// =========================================
// Forgot Password Template
// =========================================
const forgotPasswordTemplate = ({
    fullName,
    resetLink,
}) => {
    return `
    <div style="font-family: Arial, sans-serif; padding:20px;">

        <h2 style="color:#1976D2;">
            🔑 Password Reset
        </h2>

        <p>Hello <strong>${fullName}</strong>,</p>

        <p>
            We received a request to reset your password.
        </p>

        <p>
            Click the link below to continue:
        </p>

        <a href="${resetLink}">
            Reset Password
        </a>

        <p>
            If you didn't request this, simply ignore this email.
        </p>

        <hr>

        <small>Team AgriRentX</small>

    </div>
    `;
};

module.exports = forgotPasswordTemplate;
