const baseTemplate = require("./baseTemplate");

const bookingCreatedTemplate = ({ farmerName, equipmentName, bookingDate, totalAmount }) => {
    return baseTemplate(`
        <h2>🚜 Booking Created Successfully</h2>

        <p>Hello <strong>${farmerName}</strong>,</p>

        <p>Your booking has been created successfully.</p>

        <p><strong>Equipment:</strong> ${equipmentName}</p>

        <p><strong>Date:</strong> ${bookingDate}</p>

        <p><strong>Total:</strong> ₹${totalAmount}</p>
    `);
};

module.exports = bookingCreatedTemplate;