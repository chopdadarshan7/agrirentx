// =========================================
// Equipment Approved Template
// =========================================
const equipmentApprovalTemplate = ({
    rentalerName,
    equipmentName,
}) => {
    return `
    <div style="font-family: Arial, sans-serif; padding:20px;">

        <h2 style="color:#2E7D32;">
            ✅ Equipment Approved
        </h2>

        <p>Hello <strong>${rentalerName}</strong>,</p>

        <p>Your equipment has been approved.</p>

        <p>
            Equipment:
            <strong>${equipmentName}</strong>
        </p>

        <p>
            It is now visible to farmers for booking.
        </p>

        <hr>

        <small>Team AgriRentX</small>

    </div>
    `;
};

module.exports = equipmentApprovalTemplate;