const bookingEmail = (userName) => `
<h2>Hello ${userName},</h2>
<p>Your booking has been created successfully.</p>
<p>Thank you for choosing AgriRentX.</p>
`;

const paymentEmail = (userName) => `
<h2>Hello ${userName},</h2>
<p>Your payment has been received successfully.</p>
`;

const reviewEmail = (userName) => `
<h2>Hello ${userName},</h2>
<p>You have received a new review for your equipment.</p>
`;

const approvalEmail = (userName) => `
<h2>Hello ${userName},</h2>
<p>Congratulations! Your rentaler account has been approved.</p>
<p>Thank you for choosing AgriRentX.</p>
`;

const rejectionEmail = (userName, reason) => `
<h2>Hello ${userName},</h2>
<p>Your rentaler application has been rejected.</p>
<p><strong>Reason:</strong> ${reason || "Does not meet requirements."}</p>
`;

module.exports = {
    bookingEmail,
    paymentEmail,
    reviewEmail,
    approvalEmail,
    rejectionEmail,
};
