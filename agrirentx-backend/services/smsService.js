const logger = require("../utils/logger");

// =========================================
// Generic SMS Sender (Stub)
// =========================================
const sendSMS = async ({ phone, message }) => {
    try {

        logger.info(
            `SMS -> ${phone}: ${message}`
        );

        return {
            success: true,
            message: "SMS sent successfully (stub).",
        };

    } catch (error) {

        logger.error(error);

        throw error;

    }
};
// =========================================
// Send OTP SMS
// =========================================
const sendOTP = async ({ phone, otp }) => {

    return sendSMS({

        phone,

        message: `Your AgriRentX OTP is ${otp}. It is valid for 10 minutes.`,

    });

};
// =========================================
// Booking SMS
// =========================================
const sendBookingSMS = async ({
    phone,
    equipmentName,
}) => {

    return sendSMS({

        phone,

        message: `Your booking for "${equipmentName}" has been created successfully.`,

    });

};
// =========================================
// Payment SMS
// =========================================
const sendPaymentSMS = async ({
    phone,
    amount,
}) => {

    return sendSMS({

        phone,

        message: `Payment of ₹${amount} received successfully. Thank you for choosing AgriRentX.`,

    });

};
// =========================================
// Approval SMS
// =========================================
const sendApprovalSMS = async ({
    phone,
    type,
}) => {

    return sendSMS({

        phone,

        message: `Congratulations! Your ${type} has been approved.`,

    });

};
module.exports = {

    sendSMS,

    sendOTP,

    sendBookingSMS,

    sendPaymentSMS,

    sendApprovalSMS,

};