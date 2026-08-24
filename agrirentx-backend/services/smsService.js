const logger = require("../utils/logger");

const MSG91_BASE_URL = "https://control.msg91.com/api/v5";

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
// MSG91 OTP delivery (real, when configured)
// =========================================
const isMsg91Configured = () =>
    Boolean(process.env.MSG91_AUTH_KEY && process.env.MSG91_OTP_TEMPLATE_ID);

const sendOtpViaMsg91 = async ({ phone, otp }) => {
    const mobile = phone.length === 10 ? `91${phone}` : phone;

    const url =
        `${MSG91_BASE_URL}/otp` +
        `?template_id=${encodeURIComponent(process.env.MSG91_OTP_TEMPLATE_ID)}` +
        `&mobile=${encodeURIComponent(mobile)}` +
        `&authkey=${encodeURIComponent(process.env.MSG91_AUTH_KEY)}` +
        `&otp=${encodeURIComponent(otp)}`;

    const res = await fetch(url, { method: "POST" });
    const data = await res.json();

    if (data.type !== "success") {
        throw new Error(data.message || "MSG91 OTP send failed.");
    }

    return data;
};

// =========================================
// Send OTP SMS — real via MSG91 when configured,
// falls back to the console-log stub otherwise.
// =========================================
const sendOTP = async ({ phone, otp }) => {

    if (isMsg91Configured()) {
        try {
            await sendOtpViaMsg91({ phone, otp });
            logger.info(`MSG91 OTP sent -> ${phone}`);
            return { success: true, message: "OTP sent via MSG91." };
        } catch (error) {
            logger.error(`MSG91 OTP send failed, falling back to stub: ${error.message}`);
        }
    }

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