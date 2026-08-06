// =========================================
// Equipment Rejected Template
// =========================================
const equipmentRejectedTemplate = ({
    rentalerName,
    equipmentName,
}) => {
    return `
    <div style="font-family: Arial, sans-serif; padding:20px;">

        <h2 style="color:#D32F2F;">
            ❌ Equipment Rejected
        </h2>

        <p>Hello <strong>${rentalerName}</strong>,</p>

        <p>Your equipment submission was not approved.</p>

        <p>
            Equipment:
            <strong>${equipmentName}</strong>
        </p>

        <p>
            Please review the equipment details and submit again if necessary.
        </p>

        <hr>

        <small>Team AgriRentX</small>

    </div>
    `;
};

module.exports = equipmentRejectedTemplate;