// =========================================
// Payment Refund Email Template
// =========================================
const paymentRefundTemplate = ({
    farmerName,
    amount,
}) => {
    return `
    <div style="font-family: Arial, sans-serif; padding:20px;">

        <h2 style="color:#FF9800;">
            💰 Payment Refunded
        </h2>

        <p>Hello <strong>${farmerName}</strong>,</p>

        <p>Your refund has been processed successfully.</p>

        <p>
            Refunded Amount:
            <strong>₹${amount}</strong>
        </p>

        <p>
            The amount will reflect in your bank account as per your payment provider's processing time.
        </p>

        <hr>

        <small>Team AgriRentX</small>

    </div>
    `;
};

module.exports = paymentRefundTemplate;