/**
 * ============================================================
 * AGRIRENTX – Admin API Test Suite
 * Tests: Dashboard, All Users, User By ID, Block/Unblock, Delete
 * ============================================================
 * Run with: node test-admin-apis.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const http = require("http");

const BASE_URL = "http://localhost:8000/api/admin";
let ADMIN_TOKEN = "";
let TARGET_USER_ID = "";

// ──────────────────────────────────────────────
// Tiny HTTP helper (no axios needed)
// ──────────────────────────────────────────────
function request(method, url, body, token) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 80,
            path: urlObj.pathname,
            method,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
            },
        };

        const req = http.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on("error", reject);
        if (payload) req.write(payload);
        req.end();
    });
}

// ──────────────────────────────────────────────
// Console helpers
// ──────────────────────────────────────────────
const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const BOLD   = "\x1b[1m";
const RESET  = "\x1b[0m";

function pass(msg) { console.log(`  ${GREEN}✅ PASS${RESET} - ${msg}`); }
function fail(msg) { console.log(`  ${RED}❌ FAIL${RESET} - ${msg}`); }
function info(msg) { console.log(`  ${YELLOW}INFO  ${RESET} ${msg}`); }
function title(msg) { console.log(`\n${BOLD}${CYAN}=== ${msg} ===${RESET}`); }

// ──────────────────────────────────────────────
// Step 0 – Get or create admin user & login
// ──────────────────────────────────────────────
async function setup() {
    title("SETUP – Ensure Admin User Exists + Login");

    const User = require("./models/user");
    await mongoose.connect(process.env.MONGO_URI);
    info("Connected to MongoDB");

    // Find or create admin
    let admin = await User.findOne({ email: "admin@agrirentx.com" });

    if (!admin) {
        admin = await User.create({
            fullName: "Admin User",
            email: "admin@agrirentx.com",
            phone: "9000000001",
            password: "Admin@1234",
            isAdmin: true,
        });
        info("Created admin user: admin@agrirentx.com / Admin@1234");
    } else {
        if (!admin.isAdmin) {
            admin.isAdmin = true;
            await admin.save();
            info("Patched existing user to isAdmin=true");
        } else {
            info("Admin user already exists");
        }
    }

    // Grab a non-admin user to use in Test 3, 4, 5
    const nonAdmin = await User.findOne({ isAdmin: false, isDeleted: false });
    if (nonAdmin) {
        TARGET_USER_ID = nonAdmin._id.toString();
        info(`Target user for tests: ${nonAdmin.fullName} (${TARGET_USER_ID})`);
    } else {
        const dummy = await User.create({
            fullName: "Test Farmer",
            email: "farmer.test@agrirentx.com",
            phone: "9000000002",
            password: "Farmer@1234",
            is_farmer: true,
        });
        TARGET_USER_ID = dummy._id.toString();
        info(`Created dummy farmer: ${TARGET_USER_ID}`);
    }

    await mongoose.disconnect();

    // Login via HTTP to get JWT
    const loginRes = await request("POST", "http://localhost:8000/api/auth/login", {
        email: "admin@agrirentx.com",
        password: "Admin@1234",
    });

    if (loginRes.status === 200 && loginRes.body.accessToken) {
        ADMIN_TOKEN = loginRes.body.accessToken;
        pass(`Logged in. Token: ${ADMIN_TOKEN.slice(0, 30)}...`);
    } else {
        fail(`Login failed: ${JSON.stringify(loginRes.body)}`);
        process.exit(1);
    }
}

// ──────────────────────────────────────────────
// Test 1 – Admin Dashboard
// ──────────────────────────────────────────────
async function test1_dashboard() {
    title("TEST 1 – GET /api/admin/dashboard");

    const res = await request("GET", `${BASE_URL}/dashboard`, null, ADMIN_TOKEN);
    info(`Status: ${res.status}`);

    if (res.status === 200 && res.body.success) {
        pass("Response success=true");
        const d = res.body.data;
        const keys = [
            "totalUsers", "totalFarmers", "totalRentalers",
            "totalEquipments", "approvedEquipments", "pendingEquipments",
            "totalBookings", "completedBookings", "pendingBookings", "cancelledBookings",
            "totalPayments", "successfulPayments", "refundedPayments", "totalRevenue",
        ];
        let allPresent = true;
        for (const k of keys) {
            if (d[k] === undefined) { fail(`Missing key: ${k}`); allPresent = false; }
        }
        if (allPresent) pass("All 14 expected keys present in data");
        console.log("  Dashboard Data:", JSON.stringify(d, null, 4));
    } else {
        fail(`Unexpected response: ${JSON.stringify(res.body)}`);
    }
}

// ──────────────────────────────────────────────
// Test 2 – Get All Users
// ──────────────────────────────────────────────
async function test2_getAllUsers() {
    title("TEST 2 – GET /api/admin/users");

    const res = await request("GET", `${BASE_URL}/users`, null, ADMIN_TOKEN);
    info(`Status: ${res.status}`);

    if (res.status === 200 && res.body.success) {
        pass("Response success=true");
        const users = res.body.data;
        pass(`Returned ${users.length} user(s)`);

        const hasPassword = users.some((u) => u.password);
        const hasToken    = users.some((u) => u.refreshToken);

        if (!hasPassword) pass("Password NOT returned in response");
        else fail("PASSWORD IS EXPOSED in response!");

        if (!hasToken) pass("RefreshToken NOT returned in response");
        else fail("REFRESH TOKEN IS EXPOSED in response!");
    } else {
        fail(`Unexpected response: ${JSON.stringify(res.body)}`);
    }
}

// ──────────────────────────────────────────────
// Test 3 – Get User By ID
// ──────────────────────────────────────────────
async function test3_getUserById() {
    title(`TEST 3 – GET /api/admin/users/:id`);

    const res = await request("GET", `${BASE_URL}/users/${TARGET_USER_ID}`, null, ADMIN_TOKEN);
    info(`Status: ${res.status}`);
    info(`URL: ${BASE_URL}/users/${TARGET_USER_ID}`);

    if (res.status === 200 && res.body.success) {
        pass("Response success=true");
        const u = res.body.data;
        if (u._id) pass(`User found: ${u.fullName} (${u._id})`);
        if (!u.password)      pass("Password NOT returned");
        else                  fail("PASSWORD IS EXPOSED!");
        if (!u.refreshToken)  pass("RefreshToken NOT returned");
        else                  fail("REFRESH TOKEN IS EXPOSED!");
        console.log("  User:", JSON.stringify({ _id: u._id, fullName: u.fullName, email: u.email, is_farmer: u.is_farmer }, null, 4));
    } else {
        fail(`Unexpected response: ${JSON.stringify(res.body)}`);
    }
}

// ──────────────────────────────────────────────
// Test 4 – Block / Unblock User (run twice)
// ──────────────────────────────────────────────
async function test4_blockUnblock() {
    title(`TEST 4 – PUT /api/admin/users/:id/block (Toggle x2)`);

    const res1 = await request("PUT", `${BASE_URL}/users/${TARGET_USER_ID}/block`, null, ADMIN_TOKEN);
    info(`First call status: ${res1.status}`);
    if (res1.status === 200 && res1.body.success) {
        pass(`First call: "${res1.body.message}"`);
    } else {
        fail(`First call failed: ${JSON.stringify(res1.body)}`);
    }

    const res2 = await request("PUT", `${BASE_URL}/users/${TARGET_USER_ID}/block`, null, ADMIN_TOKEN);
    info(`Second call status: ${res2.status}`);
    if (res2.status === 200 && res2.body.success) {
        pass(`Second call: "${res2.body.message}"`);
    } else {
        fail(`Second call failed: ${JSON.stringify(res2.body)}`);
    }
}

// ──────────────────────────────────────────────
// Test 5 – Delete User (Soft Delete)
// ──────────────────────────────────────────────
async function test5_deleteUser() {
    title(`TEST 5 – DELETE /api/admin/users/:id`);

    const res = await request("DELETE", `${BASE_URL}/users/${TARGET_USER_ID}`, null, ADMIN_TOKEN);
    info(`Status: ${res.status}`);

    if (res.status === 200 && res.body.success) {
        pass(`Response: "${res.body.message}"`);

        const User = require("./models/user");
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findById(TARGET_USER_ID);
        await mongoose.disconnect();

        if (user && user.isDeleted === true) {
            pass(`isDeleted=true confirmed in MongoDB`);
        } else {
            fail("isDeleted is NOT true in MongoDB!");
        }

        if (user && user.deletedAt) {
            pass(`deletedAt=${user.deletedAt} confirmed in MongoDB`);
        } else {
            fail("deletedAt is NOT set in MongoDB!");
        }
    } else {
        fail(`Unexpected response: ${JSON.stringify(res.body)}`);
    }
}

// ──────────────────────────────────────────────
// Main Runner
// ──────────────────────────────────────────────
(async () => {
    console.log("\n" + BOLD + CYAN + "==============================================");
    console.log("    AGRIRENTX Admin API Test Suite          ");
    console.log("==============================================" + RESET);
    console.log(`  Server : http://localhost:8000`);
    console.log(`  Tests  : 5 (Dashboard, Users CRUD, Block, Delete)\n`);

    try {
        await setup();
        await test1_dashboard();
        await test2_getAllUsers();
        await test3_getUserById();
        await test4_blockUnblock();
        await test5_deleteUser();
    } catch (err) {
        console.error(`\n${RED}TEST RUNNER CRASHED:${RESET}`, err.message);
        console.error(err.stack);
    }

    console.log(`\n${BOLD}${GREEN}=== All tests complete ===${RESET}\n`);
    process.exit(0);
})();
