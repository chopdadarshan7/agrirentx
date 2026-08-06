// =========================================
// Rentaler Rejected Template
// =========================================
const rentalerRejectedTemplate = ({
    rentalerName,
}) => {
    return `
    <div style="font-family: Arial, sans-serif; padding:20px;">

        <h2 style="color:#D32F2F;">
            ❌ Rentaler Request Rejected
        </h2>

        <p>Hello <strong>${rentalerName}</strong>,</p>

        <p>
            Unfortunately, your rentaler application could not be approved.
        </p>

        <p>
            Please review your KYC documents and submit again.
        </p>

        <hr>

        <small>Team AgriRentX</small>

    </div>
    `;
};

module.exports = rentalerRejectedTemplate;