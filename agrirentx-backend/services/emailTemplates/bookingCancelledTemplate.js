// =========================================
// Booking Cancelled Email Template
// =========================================
const bookingCancelledTemplate = ({
    farmerName,
    equipmentName,
}) => {
    return `
    <div style="font-family: Arial, sans-serif; padding:20px;">

        <h2 style="color:#D32F2F;">
            ❌ Booking Cancelled
        </h2>

        <p>Hello <strong>${farmerName}</strong>,</p>

        <p>Your booking has been cancelled.</p>

        <p>
            Equipment:
            <strong>${equipmentName}</strong>
        </p>

        <p>
            If this was unexpected, please contact support.
        </p>

        <hr>

        <small>Team AgriRentX</small>

    </div>
    `;
};

module.exports = bookingCancelledTemplate;