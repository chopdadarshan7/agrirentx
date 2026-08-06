// Email Service
// Implementation: Phase — Notifications
const welcomeTemplate = require("./emailTemplates/welcomeTemplate");

const bookingCreatedTemplate = require("./emailTemplates/bookingCreatedTemplate");

const bookingConfirmedTemplate = require("./emailTemplates/bookingConfirmedTemplate");

const bookingCancelledTemplate = require("./emailTemplates/bookingCancelledTemplate");

const paymentSuccessTemplate = require("./emailTemplates/paymentSuccessTemplate");

const paymentRefundTemplate = require("./emailTemplates/paymentRefundTemplate");

const equipmentApprovalTemplate = require("./emailTemplates/equipmentApprovalTemplate");

const equipmentRejectedTemplate = require("./emailTemplates/equipmentRejectedTemplate");

const rentalerApprovalTemplate = require("./emailTemplates/rentalerApprovalTemplate");

const rentalerRejectedTemplate = require("./emailTemplates/rentalerRejectedTemplate");
const { EMAIL_SUBJECTS } = require("../constants");

const forgotPasswordTemplate = require("./emailTemplates/forgotPasswordTemplate");

const nodemailer = require("nodemailer");
const logger = require("../utils/logger");
// ===============================
// SMTP Transporter
// ===============================
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
// ===============================
// Verify SMTP Connection
// ===============================
transporter.verify((error, success) => {
    if (error) {
        logger.error("SMTP Error:", error.message);
    } else {
        logger.info("✅ SMTP Server Ready");
    }
});
// ===============================
// Send Email
// ===============================
const sendEmail = async ({
    to,
    subject,
    html,
    text,
}) => {
    try {
        const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
    text,
};
const info = await transporter.sendMail(mailOptions);

return info;

    } catch (error) {
        logger.error("Email Error:", error);

        throw error;
    }
};

// =========================================
// Internal Template Email Helper
// =========================================
const sendTemplateEmail = async ({
    to,
    subject,
    template,
    text,
}) => {

    await sendEmail({
        to,
        subject,
        html: template,
        text,
    });

};



// ===============================
// Welcome Email
// ===============================
const sendWelcomeEmail = async (user) => {
    try {
    await sendTemplateEmail({
    to: user.email,
    subject: EMAIL_SUBJECTS.WELCOME,
    template: welcomeTemplate(user),
    text: "Welcome to AgriRentX",
});
    
    } catch (error) {
        logger.error("Welcome Email Error:", error);

        throw error;
    }
};


// =========================================
// Booking Created Email
// =========================================
const sendBookingCreatedEmail = async (data) => {
    try {
await sendTemplateEmail({
    to: data.email,
    subject: EMAIL_SUBJECTS.BOOKING_CREATED,
    template: bookingCreatedTemplate(data),
    text: "Booking Created Successfully",
});
        
    } catch (error) {
        logger.error("Booking Created Email Error:", error);

        throw error;
    }
};

// =========================================
// Booking Confirmed Email
// =========================================
const sendBookingConfirmedEmail = async (data) => {
    try {

        const html = bookingConfirmedTemplate(data);

        await sendEmail({
            to: data.email,
            subject: EMAIL_SUBJECTS.BOOKING_CONFIRMED,
            html,
            text: "Your booking has been confirmed.",
        });

    } catch (error) {
        logger.error("Booking Confirmed Email Error:", error);

        throw error;
    }
};

// =========================================
// Booking Cancelled Email
// =========================================
const sendBookingCancelledEmail = async (data) => {
    try {

        const html = bookingCancelledTemplate(data);

        await sendEmail({
            to: data.email,
            subject: EMAIL_SUBJECTS.BOOKING_CANCELLED,
            html,
            text: "Your booking has been cancelled.",
        });

    } catch (error) {
        logger.error("Booking Cancelled Email Error:", error);

        throw error;
    }
};

// =========================================
// Payment Success Email
// =========================================
const sendPaymentSuccessEmail = async (data) => {
    try {

        const html = paymentSuccessTemplate(data);

        await sendEmail({
            to: data.email,
            subject:EMAIL_SUBJECTS.PAYMENT_SUCCESS ,
            html,
            text: "Your payment has been received successfully.",
        });

    } catch (error) {
        logger.error("Payment Success Email Error:", error);

        throw error;
    }
};

// =========================================
// Payment Refund Email
// =========================================
const sendPaymentRefundEmail = async (data) => {
    try {

        const html = paymentRefundTemplate(data);

        await sendEmail({
            to: data.email,
            subject: EMAIL_SUBJECTS.PAYMENT_REFUND,
            html,
            text: "Your refund has been processed.",
        });

    } catch (error) {
        logger.error("Payment Refund Email Error:", error);

        throw error;
    }
};

// =========================================
// Equipment Approved Email
// =========================================
const sendEquipmentApprovedEmail = async (data) => {
    try {

        const html = equipmentApprovalTemplate(data);

        await sendEmail({
            to: data.email,
            subject: EMAIL_SUBJECTS.EQUIPMENT_APPROVED,
            html,
            text: "Your equipment has been approved.",
        });

    } catch (error) {
        logger.error("Equipment Approved Email Error:", error);

        throw error;
    }
};

// =========================================
// Equipment Rejected Email
// =========================================
const sendEquipmentRejectedEmail = async (data) => {
    try {

        const html = equipmentRejectedTemplate(data);

        await sendEmail({
            to: data.email,
            subject: EMAIL_SUBJECTS.EQUIPMENT_REJECTED,
            html,
            text: "Your equipment submission was rejected.",
        });

    } catch (error) {
        logger.error("Equipment Rejected Email Error:", error);

        throw error;
    }
};
// =========================================
// Rentaler Approved Email
// =========================================
const sendRentalerApprovedEmail = async (data) => {
    try {

        const html = rentalerApprovalTemplate(data);

        await sendEmail({
            to: data.email,
            subject: EMAIL_SUBJECTS.RENTALER_APPROVED,
            html,
            text: "Your rentaler application has been approved.",
        });

    } catch (error) {
        logger.error("Rentaler Approved Email Error:", error);

        throw error;
    }
};
// =========================================
// Rentaler Rejected Email
// =========================================
const sendRentalerRejectedEmail = async (data) => {
    try {

        const html = rentalerRejectedTemplate(data);

        await sendEmail({
            to: data.email,
            subject: EMAIL_SUBJECTS.RENTALER_REJECTED,
            html,
            text: "Your rentaler application has been rejected.",
        });

    } catch (error) {
        logger.error("Rentaler Rejected Email Error:", error);

        throw error;
    }
};


// =========================================
// Forgot Password Email
// =========================================
const sendForgotPasswordEmail = async (data) => {
    try {

        const html = forgotPasswordTemplate(data);

        await sendEmail({
            to: data.email,
            subject: EMAIL_SUBJECTS.FORGOT_PASSWORD,
            html,
            text: "Reset your AgriRentX password.",
        });

    } catch (error) {
        logger.error("Forgot Password Email Error:", error);

        throw error;
    }
};


module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendBookingCreatedEmail,
    sendBookingConfirmedEmail,
    sendBookingCancelledEmail,
    sendPaymentSuccessEmail,
    sendPaymentRefundEmail,
    sendEquipmentApprovedEmail,
sendEquipmentRejectedEmail,     
sendRentalerApprovedEmail,
sendRentalerRejectedEmail,  
sendForgotPasswordEmail
};

// =========================================
// Welcome Emails
// =========================================

// =========================================
// Booking Emails
// =========================================

// =========================================
// Payment Emails
// =========================================

// =========================================
// Equipment Emails
// =========================================

// =========================================
// Rentaler Emails
// =========================================

// =========================================
// Authentication Emails
// =========================================
