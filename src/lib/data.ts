/**
 * Mock domain data for AgriRentX. Mirrors the API model names from the plan so
 * swapping in real endpoints later is a drop-in change.
 */

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled"
  | "rejected";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
export type ApprovalStatus = "approved" | "pending" | "rejected";
export type EquipmentStatus = "available" | "booked" | "maintenance" | "inactive";
export type RentalerStatus = "approved" | "pending" | "rejected" | "suspended";

export type Category = {
  slug: string;
  name: string;
  description: string;
  count: number;
};

export const categories: Category[] = [
  { slug: "tractors", name: "Tractors", description: "35–75 HP utility & row-crop", count: 128 },
  { slug: "harvesters", name: "Harvesters", description: "Combine & forage harvesters", count: 46 },
  { slug: "tillage", name: "Tillage", description: "Rotavators, ploughs, cultivators", count: 91 },
  { slug: "sowing", name: "Sowing & Planting", description: "Seed drills, transplanters", count: 63 },
  { slug: "irrigation", name: "Irrigation", description: "Pumps, sprinklers, pipe sets", count: 74 },
  { slug: "sprayers", name: "Sprayers & Drones", description: "Boom sprayers, agri drones", count: 38 },
];

export type Equipment = {
  id: string;
  title: string;
  category: string;
  categoryName: string;
  description: string;
  pricePerDay: number;
  deposit: number;
  rating: number;
  reviewCount: number;
  district: string;
  state: string;
  owner: string;
  status: EquipmentStatus;
  approvalStatus: ApprovalStatus;
  activeBookings: number;
  specs: { label: string; value: string }[];
  tone: string;
};

const tones = {
  green: "from-primary/25 to-primary/5",
  blue: "from-info/25 to-info/5",
  amber: "from-warning/25 to-warning/5",
  mint: "from-success/25 to-success/5",
  slate: "from-muted to-secondary",
};

export const equipments: Equipment[] = [
  {
    id: "eq-1001",
    title: "Mahindra 575 DI XP Plus",
    category: "tractors",
    categoryName: "Tractors",
    description:
      "45 HP workhorse tractor with power steering and dual-clutch. Well maintained, serviced every 200 hours, ideal for ploughing and haulage across medium holdings.",
    pricePerDay: 2400,
    deposit: 5000,
    rating: 4.8,
    reviewCount: 64,
    district: "Nashik",
    state: "Maharashtra",
    owner: "Rajesh Patil",
    status: "available",
    approvalStatus: "approved",
    activeBookings: 1,
    specs: [
      { label: "Engine power", value: "45 HP" },
      { label: "Gearbox", value: "8 Forward + 2 Reverse" },
      { label: "Lift capacity", value: "1600 kg" },
      { label: "Fuel", value: "Diesel, 48 L tank" },
      { label: "Year", value: "2021" },
    ],
    tone: tones.green,
  },
  {
    id: "eq-1002",
    title: "John Deere W70 Combine Harvester",
    category: "harvesters",
    categoryName: "Harvesters",
    description:
      "Self-propelled combine harvester suited for wheat, paddy and soybean. Comes with trained operator on request and on-site grain tank unloading.",
    pricePerDay: 11500,
    deposit: 25000,
    rating: 4.9,
    reviewCount: 31,
    district: "Ludhiana",
    state: "Punjab",
    owner: "Gurpreet Singh",
    status: "booked",
    approvalStatus: "approved",
    activeBookings: 2,
    specs: [
      { label: "Cutting width", value: "14 ft" },
      { label: "Grain tank", value: "3500 L" },
      { label: "Engine", value: "101 HP turbo" },
      { label: "Operator", value: "Available on request" },
      { label: "Year", value: "2020" },
    ],
    tone: tones.blue,
  },
  {
    id: "eq-1003",
    title: "Shaktiman Regular Rotavator 7ft",
    category: "tillage",
    categoryName: "Tillage",
    description:
      "Heavy-duty rotavator with 42 blades for fine seedbed preparation. Fits 45 HP and above tractors, gearbox recently overhauled.",
    pricePerDay: 900,
    deposit: 2000,
    rating: 4.5,
    reviewCount: 22,
    district: "Indore",
    state: "Madhya Pradesh",
    owner: "Anil Verma",
    status: "available",
    approvalStatus: "approved",
    activeBookings: 0,
    specs: [
      { label: "Working width", value: "7 ft" },
      { label: "Blades", value: "42 L-type" },
      { label: "Required power", value: "45+ HP" },
      { label: "Weight", value: "480 kg" },
    ],
    tone: tones.amber,
  },
  {
    id: "eq-1004",
    title: "Agri Drone Sprayer 10L",
    category: "sprayers",
    categoryName: "Sprayers & Drones",
    description:
      "DGCA-compliant spraying drone covering up to 6 acres per hour. Rental includes battery set, charger and a certified pilot.",
    pricePerDay: 4200,
    deposit: 15000,
    rating: 4.7,
    reviewCount: 18,
    district: "Guntur",
    state: "Andhra Pradesh",
    owner: "Sai Krishna",
    status: "available",
    approvalStatus: "pending",
    activeBookings: 0,
    specs: [
      { label: "Tank capacity", value: "10 L" },
      { label: "Coverage", value: "6 acres/hour" },
      { label: "Flight time", value: "18 min per battery" },
      { label: "Pilot", value: "Included" },
    ],
    tone: tones.mint,
  },
  {
    id: "eq-1005",
    title: "Kirloskar 7.5 HP Irrigation Pump Set",
    category: "irrigation",
    categoryName: "Irrigation",
    description:
      "Diesel pump set with 120 ft of delivery pipe. Suitable for open well and canal lifting during peak Rabi irrigation.",
    pricePerDay: 650,
    deposit: 1500,
    rating: 4.3,
    reviewCount: 41,
    district: "Belagavi",
    state: "Karnataka",
    owner: "Mahesh Kulkarni",
    status: "maintenance",
    approvalStatus: "approved",
    activeBookings: 0,
    specs: [
      { label: "Power", value: "7.5 HP diesel" },
      { label: "Discharge", value: "22 000 L/hour" },
      { label: "Pipe included", value: "120 ft" },
    ],
    tone: tones.slate,
  },
  {
    id: "eq-1006",
    title: "Happy Seeder 9-Row Drill",
    category: "sowing",
    categoryName: "Sowing & Planting",
    description:
      "Zero-till happy seeder for direct wheat sowing into paddy residue. Cuts stubble burning and saves one full field pass.",
    pricePerDay: 1800,
    deposit: 4000,
    rating: 4.6,
    reviewCount: 27,
    district: "Karnal",
    state: "Haryana",
    owner: "Suresh Yadav",
    status: "available",
    approvalStatus: "approved",
    activeBookings: 1,
    specs: [
      { label: "Rows", value: "9" },
      { label: "Row spacing", value: "20 cm" },
      { label: "Required power", value: "50+ HP" },
      { label: "Seed box", value: "120 kg" },
    ],
    tone: tones.green,
  },
  {
    id: "eq-1007",
    title: "Sonalika DI 60 RX Tractor",
    category: "tractors",
    categoryName: "Tractors",
    description:
      "60 HP tractor with heavy-duty hydraulics, suited for trolley haulage and deep tillage on black cotton soil.",
    pricePerDay: 3100,
    deposit: 6000,
    rating: 4.4,
    reviewCount: 19,
    district: "Akola",
    state: "Maharashtra",
    owner: "Rajesh Patil",
    status: "available",
    approvalStatus: "approved",
    activeBookings: 0,
    specs: [
      { label: "Engine power", value: "60 HP" },
      { label: "Lift capacity", value: "2000 kg" },
      { label: "PTO", value: "540 / 540E" },
      { label: "Year", value: "2022" },
    ],
    tone: tones.blue,
  },
  {
    id: "eq-1008",
    title: "Boom Sprayer 400L Tractor Mounted",
    category: "sprayers",
    categoryName: "Sprayers & Drones",
    description:
      "Tractor-mounted boom sprayer with 12 m boom and adjustable nozzles for uniform coverage on cotton and soybean.",
    pricePerDay: 1100,
    deposit: 2500,
    rating: 4.2,
    reviewCount: 12,
    district: "Rajkot",
    state: "Gujarat",
    owner: "Bhavesh Mehta",
    status: "inactive",
    approvalStatus: "rejected",
    activeBookings: 0,
    specs: [
      { label: "Tank", value: "400 L" },
      { label: "Boom width", value: "12 m" },
      { label: "Nozzles", value: "24 flat fan" },
    ],
    tone: tones.amber,
  },
];

export const getEquipment = (id: string) => equipments.find((e) => e.id === id);

export type Booking = {
  id: string;
  equipmentId: string;
  equipmentTitle: string;
  farmer: string;
  rentaler: string;
  from: string;
  to: string;
  days: number;
  amount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  placedAt: string;
  minutesSincePlaced: number;
  timeline: { label: string; at: string; note?: string }[];
};

export const bookings: Booking[] = [
  {
    id: "BK-24081",
    equipmentId: "eq-1001",
    equipmentTitle: "Mahindra 575 DI XP Plus",
    farmer: "Aarti Deshmukh",
    rentaler: "Rajesh Patil",
    from: "12 Aug 2026",
    to: "15 Aug 2026",
    days: 3,
    amount: 7200,
    status: "confirmed",
    paymentStatus: "paid",
    placedAt: "3 Aug 2026, 09:12",
    minutesSincePlaced: 45,
    timeline: [
      { label: "Booking requested", at: "3 Aug, 09:12" },
      { label: "Payment received", at: "3 Aug, 09:14", note: "₹7,200 via Razorpay" },
      { label: "Approved by rentaler", at: "3 Aug, 10:02" },
    ],
  },
  {
    id: "BK-24080",
    equipmentId: "eq-1003",
    equipmentTitle: "Shaktiman Regular Rotavator 7ft",
    farmer: "Aarti Deshmukh",
    rentaler: "Anil Verma",
    from: "28 Jul 2026",
    to: "30 Jul 2026",
    days: 2,
    amount: 1800,
    status: "completed",
    paymentStatus: "paid",
    placedAt: "26 Jul 2026, 14:40",
    minutesSincePlaced: 11000,
    timeline: [
      { label: "Booking requested", at: "26 Jul, 14:40" },
      { label: "Payment received", at: "26 Jul, 14:42" },
      { label: "Approved by rentaler", at: "26 Jul, 16:10" },
      { label: "Marked completed", at: "30 Jul, 18:30" },
    ],
  },
  {
    id: "BK-24079",
    equipmentId: "eq-1002",
    equipmentTitle: "John Deere W70 Combine Harvester",
    farmer: "Vikram Rao",
    rentaler: "Gurpreet Singh",
    from: "20 Aug 2026",
    to: "22 Aug 2026",
    days: 2,
    amount: 23000,
    status: "pending",
    paymentStatus: "pending",
    placedAt: "3 Aug 2026, 15:55",
    minutesSincePlaced: 20,
    timeline: [{ label: "Booking requested", at: "3 Aug, 15:55" }],
  },
  {
    id: "BK-24078",
    equipmentId: "eq-1006",
    equipmentTitle: "Happy Seeder 9-Row Drill",
    farmer: "Aarti Deshmukh",
    rentaler: "Suresh Yadav",
    from: "5 Aug 2026",
    to: "6 Aug 2026",
    days: 1,
    amount: 1800,
    status: "active",
    paymentStatus: "paid",
    placedAt: "1 Aug 2026, 08:20",
    minutesSincePlaced: 3800,
    timeline: [
      { label: "Booking requested", at: "1 Aug, 08:20" },
      { label: "Payment received", at: "1 Aug, 08:22" },
      { label: "Approved by rentaler", at: "1 Aug, 09:00" },
      { label: "Rental started", at: "5 Aug, 07:00" },
    ],
  },
  {
    id: "BK-24077",
    equipmentId: "eq-1005",
    equipmentTitle: "Kirloskar 7.5 HP Irrigation Pump Set",
    farmer: "Meena Kumari",
    rentaler: "Mahesh Kulkarni",
    from: "18 Jul 2026",
    to: "19 Jul 2026",
    days: 1,
    amount: 650,
    status: "cancelled",
    paymentStatus: "refunded",
    placedAt: "17 Jul 2026, 12:05",
    minutesSincePlaced: 24000,
    timeline: [
      { label: "Booking requested", at: "17 Jul, 12:05" },
      { label: "Payment received", at: "17 Jul, 12:07" },
      { label: "Cancelled by farmer", at: "17 Jul, 13:20" },
      { label: "Refund processed", at: "18 Jul, 10:00", note: "₹650 returned" },
    ],
  },
  {
    id: "BK-24076",
    equipmentId: "eq-1007",
    equipmentTitle: "Sonalika DI 60 RX Tractor",
    farmer: "Vikram Rao",
    rentaler: "Rajesh Patil",
    from: "10 Jul 2026",
    to: "12 Jul 2026",
    days: 2,
    amount: 6200,
    status: "rejected",
    paymentStatus: "failed",
    placedAt: "9 Jul 2026, 19:30",
    minutesSincePlaced: 34000,
    timeline: [
      { label: "Booking requested", at: "9 Jul, 19:30" },
      { label: "Payment failed", at: "9 Jul, 19:33", note: "Card declined" },
      { label: "Rejected by rentaler", at: "10 Jul, 08:00" },
    ],
  },
];

export const getBooking = (id: string) => bookings.find((b) => b.id === id);

/** Farmer may cancel only within 2 hours of placing, and only before it goes active. */
export const canCancel = (b: Booking) =>
  b.minutesSincePlaced <= 120 && (b.status === "pending" || b.status === "confirmed");

export type Payment = {
  id: string;
  bookingId: string;
  equipmentTitle: string;
  date: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  payer: string;
};

export const payments: Payment[] = [
  {
    id: "PAY-90231",
    bookingId: "BK-24081",
    equipmentTitle: "Mahindra 575 DI XP Plus",
    date: "3 Aug 2026",
    amount: 7200,
    method: "UPI",
    status: "paid",
    payer: "Aarti Deshmukh",
  },
  {
    id: "PAY-90212",
    bookingId: "BK-24080",
    equipmentTitle: "Shaktiman Rotavator 7ft",
    date: "26 Jul 2026",
    amount: 1800,
    method: "Card",
    status: "paid",
    payer: "Aarti Deshmukh",
  },
  {
    id: "PAY-90198",
    bookingId: "BK-24078",
    equipmentTitle: "Happy Seeder 9-Row Drill",
    date: "1 Aug 2026",
    amount: 1800,
    method: "Netbanking",
    status: "paid",
    payer: "Aarti Deshmukh",
  },
  {
    id: "PAY-90177",
    bookingId: "BK-24077",
    equipmentTitle: "Kirloskar Pump Set",
    date: "17 Jul 2026",
    amount: 650,
    method: "UPI",
    status: "refunded",
    payer: "Meena Kumari",
  },
  {
    id: "PAY-90154",
    bookingId: "BK-24076",
    equipmentTitle: "Sonalika DI 60 RX Tractor",
    date: "9 Jul 2026",
    amount: 6200,
    method: "Card",
    status: "failed",
    payer: "Vikram Rao",
  },
  {
    id: "PAY-90140",
    bookingId: "BK-24079",
    equipmentTitle: "John Deere W70 Combine",
    date: "3 Aug 2026",
    amount: 23000,
    method: "UPI",
    status: "pending",
    payer: "Vikram Rao",
  },
];

export type Review = {
  id: string;
  equipmentId: string;
  equipmentTitle: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  hidden: boolean;
};

export const reviews: Review[] = [
  {
    id: "RV-501",
    equipmentId: "eq-1001",
    equipmentTitle: "Mahindra 575 DI XP Plus",
    author: "Aarti Deshmukh",
    rating: 5,
    comment: "Tractor arrived on time and ran flawlessly for three days of ploughing. Owner was helpful.",
    date: "31 Jul 2026",
    hidden: false,
  },
  {
    id: "RV-502",
    equipmentId: "eq-1001",
    equipmentTitle: "Mahindra 575 DI XP Plus",
    author: "Vikram Rao",
    rating: 4,
    comment: "Good condition overall, though the tyres could use replacement before the monsoon season.",
    date: "22 Jul 2026",
    hidden: false,
  },
  {
    id: "RV-503",
    equipmentId: "eq-1003",
    equipmentTitle: "Shaktiman Rotavator 7ft",
    author: "Meena Kumari",
    rating: 5,
    comment: "Seedbed came out very fine. Would rent again next season.",
    date: "30 Jul 2026",
    hidden: false,
  },
  {
    id: "RV-504",
    equipmentId: "eq-1002",
    equipmentTitle: "John Deere W70 Combine",
    author: "Anonymous",
    rating: 1,
    comment: "Flagged by two users for abusive language.",
    date: "18 Jul 2026",
    hidden: true,
  },
];

export type AppUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  joined: string;
  isFarmer: boolean;
  isRentaler: boolean;
  rentalerStatus: RentalerStatus | null;
  blocked: boolean;
  isAdmin: boolean;
};

export const users: AppUser[] = [
  {
    id: "US-1",
    name: "Aarti Deshmukh",
    email: "aarti@example.com",
    phone: "+91 98220 11223",
    district: "Nashik",
    joined: "12 Mar 2026",
    isFarmer: true,
    isRentaler: false,
    rentalerStatus: null,
    blocked: false,
    isAdmin: false,
  },
  {
    id: "US-2",
    name: "Rajesh Patil",
    email: "rajesh@example.com",
    phone: "+91 98230 44556",
    district: "Nashik",
    joined: "2 Jan 2026",
    isFarmer: true,
    isRentaler: true,
    rentalerStatus: "approved",
    blocked: false,
    isAdmin: false,
  },
  {
    id: "US-3",
    name: "Sai Krishna",
    email: "sai@example.com",
    phone: "+91 90000 78901",
    district: "Guntur",
    joined: "28 Jul 2026",
    isFarmer: true,
    isRentaler: true,
    rentalerStatus: "pending",
    blocked: false,
    isAdmin: false,
  },
  {
    id: "US-4",
    name: "Bhavesh Mehta",
    email: "bhavesh@example.com",
    phone: "+91 99887 66554",
    district: "Rajkot",
    joined: "14 May 2026",
    isFarmer: true,
    isRentaler: true,
    rentalerStatus: "suspended",
    blocked: false,
    isAdmin: false,
  },
  {
    id: "US-5",
    name: "Vikram Rao",
    email: "vikram@example.com",
    phone: "+91 91234 55667",
    district: "Guntur",
    joined: "9 Jun 2026",
    isFarmer: true,
    isRentaler: false,
    rentalerStatus: null,
    blocked: true,
    isAdmin: false,
  },
  {
    id: "US-6",
    name: "Gurpreet Singh",
    email: "gurpreet@example.com",
    phone: "+91 98765 43210",
    district: "Ludhiana",
    joined: "3 Feb 2026",
    isFarmer: true,
    isRentaler: true,
    rentalerStatus: "approved",
    blocked: false,
    isAdmin: false,
  },
];

export type Notification = {
  id: string;
  title: string;
  body: string;
  at: string;
  unread: boolean;
  audience?: string;
};

export const notifications: Notification[] = [
  {
    id: "NT-1",
    title: "Booking confirmed",
    body: "Rajesh Patil approved your booking BK-24081 for the Mahindra 575 DI.",
    at: "2 hours ago",
    unread: true,
  },
  {
    id: "NT-2",
    title: "Payment received",
    body: "₹7,200 paid successfully for booking BK-24081.",
    at: "2 hours ago",
    unread: true,
  },
  {
    id: "NT-3",
    title: "Rental starting tomorrow",
    body: "Your Happy Seeder rental begins on 5 Aug. Please arrange pickup by 7:00 AM.",
    at: "Yesterday",
    unread: false,
  },
  {
    id: "NT-4",
    title: "Leave a review",
    body: "How was the Shaktiman Rotavator? Your feedback helps other farmers.",
    at: "4 Aug 2026",
    unread: false,
  },
];

export const broadcastLog: Notification[] = [
  {
    id: "BC-1",
    title: "Monsoon readiness drive",
    body: "Book irrigation equipment early — availability drops sharply after the first rains.",
    at: "28 Jul 2026",
    unread: false,
    audience: "All users",
  },
  {
    id: "BC-2",
    title: "New payout schedule",
    body: "Rentaler payouts now settle within 48 hours of rental completion.",
    at: "12 Jul 2026",
    unread: false,
    audience: "Rentalers",
  },
];

export const revenueSeries = [
  { month: "Feb", revenue: 82000, bookings: 24 },
  { month: "Mar", revenue: 104500, bookings: 31 },
  { month: "Apr", revenue: 96800, bookings: 28 },
  { month: "May", revenue: 141200, bookings: 39 },
  { month: "Jun", revenue: 168400, bookings: 47 },
  { month: "Jul", revenue: 192600, bookings: 55 },
];

export const userGrowthSeries = [
  { month: "Feb", users: 320 },
  { month: "Mar", users: 468 },
  { month: "Apr", users: 601 },
  { month: "May", users: 812 },
  { month: "Jun", users: 1104 },
  { month: "Jul", users: 1436 },
];

export const equipmentMixSeries = [
  { category: "Tractors", listings: 128 },
  { category: "Tillage", listings: 91 },
  { category: "Irrigation", listings: 74 },
  { category: "Sowing", listings: 63 },
  { category: "Harvesters", listings: 46 },
  { category: "Sprayers", listings: 38 },
];

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
