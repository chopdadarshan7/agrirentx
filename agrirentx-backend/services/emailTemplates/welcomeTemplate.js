const baseTemplate = require("./baseTemplate");

// =========================================
// Welcome Email Template
// =========================================
const welcomeTemplate = (user) => {
    const content = `
        <h2 style="color:#2E7D32;">
            🚜 Welcome to AgriRentX
        </h2>

        <p>Hello <strong>${user.fullName}</strong>,</p>

        <p>
            Thank you for joining AgriRentX.
        </p>

        <p>
            Your account has been created successfully.
        </p>

        <p>
            You can now rent agricultural equipment or become a verified rentaler and earn income by renting your machinery.
        </p>

        <p>
            Happy Farming 🌱
        </p>
    `;

    return baseTemplate(content);
};

module.exports = welcomeTemplate;