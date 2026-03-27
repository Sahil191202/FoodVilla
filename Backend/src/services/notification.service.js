import nodemailer from "nodemailer";
import { ENV } from "../config/env.js";

// Create transporter once — reuse everywhere
const transporter = nodemailer.createTransport({
  host: ENV.MAIL.HOST,
  port: Number(ENV.MAIL.PORT), // convert to number!
  secure: false, // false for port 587, true for port 465
  auth: {
    user: ENV.MAIL.USER,
    pass: ENV.MAIL.PASS,
  },
  tls: {
    rejectUnauthorized: false, // helps in local development
  },
});

// Verify connection on startup
transporter.verify((error) => {
  if (error) {
    console.error("Mail server connection failed:", error);
  } else {
    console.log("Mail server ready");
  }
});

// Base email sender
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"GoodFoods" <${ENV.MAIL.USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

// Reservation confirmation email
export const sendReservationConfirmation = async ({
  email,
  name,
  restaurantName,
  date,
  time,
  guests,
  confirmationCode,
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">🍽️ GoodFoods — Booking Confirmed!</h2>
      <p>Hey ${name}, your table has been booked successfully!</p>
      
      <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0;">Booking Details</h3>
        <p><strong>Restaurant:</strong> ${restaurantName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Guests:</strong> ${guests}</p>
        <p><strong>Confirmation Code:</strong> 
          <span style="font-size: 20px; font-weight: bold; color: #e74c3c;">
            ${confirmationCode}
          </span>
        </p>
      </div>

      <p>Please show this confirmation code at the restaurant.</p>
      <p style="color: #888; font-size: 12px;">
        Need to cancel? Visit your bookings on GoodFoods.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Booking Confirmed — ${restaurantName} | ${confirmationCode}`,
    html,
  });
};

// Cancellation email
export const sendCancellationEmail = async ({
  email,
  name,
  restaurantName,
  date,
  time,
  confirmationCode,
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">GoodFoods — Booking Cancelled</h2>
      <p>Hey ${name}, your reservation has been cancelled.</p>

      <div style="background: #f8f8f8; padding: 20px; border-radius: 8px;">
        <p><strong>Restaurant:</strong> ${restaurantName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Confirmation Code:</strong> ${confirmationCode}</p>
      </div>

      <p>We hope to see you again soon!</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Booking Cancelled — ${restaurantName} | ${confirmationCode}`,
    html,
  });
};

// Reminder email — called by a cron job later
export const sendReminderEmail = async ({
  email,
  name,
  restaurantName,
  date,
  time,
  guests,
  confirmationCode,
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">⏰ Reminder — Your Table is Tomorrow!</h2>
      <p>Hey ${name}, just a reminder about your upcoming reservation!</p>

      <div style="background: #f8f8f8; padding: 20px; border-radius: 8px;">
        <p><strong>Restaurant:</strong> ${restaurantName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Guests:</strong> ${guests}</p>
        <p><strong>Confirmation Code:</strong> ${confirmationCode}</p>
      </div>

      <p>See you there! 🍽️</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Reminder — ${restaurantName} Tomorrow at ${time}`,
    html,
  });
};
