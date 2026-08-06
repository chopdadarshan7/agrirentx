// =========================================
// Payment Success Email Template
// =========================================
const paymentSuccessTemplate = ({
    farmerName,
    equipmentName,
    amount,
    paymentId,
}) => {
    return `
    <div style="font-family: Arial, sans-serif; padding:20px;">

        <h2 style="color:#2E7D32;">
            💳 Payment Successful
        </h2>

        <p>Hello <strong>${farmerName}</strong>,</p>

        <p>Your payment has been received successfully.</p>

        <table style="border-collapse: collapse;">
            <tr>
                <td><strong>Equipment</strong></td>
                <td>${equipmentName}</td>
            </tr>

            <tr>
                <td><strong>Amount</strong></td>
                <td>₹${amount}</td>
            </tr>

            <tr>
                <td><strong>Payment ID</strong></td>
                <td>${paymentId}</td>
            </tr>
        </table>

        <br>

        <p>Thank you for using AgriRentX.</p>

        <hr>

        <small>Team AgriRentX</small>

    </div>
    `;
};

module.exports = paymentSuccessTemplate;