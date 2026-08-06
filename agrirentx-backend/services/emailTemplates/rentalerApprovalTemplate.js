// =========================================
// Rentaler Approved Template
// =========================================
const rentalerApprovalTemplate = ({
    rentalerName,
}) => {
    return `
    <div style="font-family: Arial, sans-serif; padding:20px;">

        <h2 style="color:#2E7D32;">
            🎉 Rentaler Request Approved
        </h2>

        <p>Hello <strong>${rentalerName}</strong>,</p>

        <p>
            Congratulations! Your rentaler application has been approved.
        </p>

        <p>
            You can now add equipment and start receiving bookings.
        </p>

        <hr>

        <small>Team AgriRentX</small>

    </div>
    `;
};

module.exports = rentalerApprovalTemplate;