// =========================================
// Booking Confirmed Email Template
// =========================================
const bookingConfirmedTemplate = ({
    farmerName,
    equipmentName,
}) => {
    return `
    <div style="font-family: Arial, sans-serif; padding:20px;">

        <h2 style="color:#2E7D32;">
            ✅ Booking Confirmed
        </h2>

        <p>Hello <strong>${farmerName}</strong>,</p>

        <p>Your booking has been confirmed.</p>

        <p>
            Equipment:
            <strong>${equipmentName}</strong>
        </p>

        <p>
            Please arrive on time for pickup.
        </p>

        <hr>

        <small>Team AgriRentX</small>

    </div>
    `;
};

module.exports = bookingConfirmedTemplate;