import cron from "node-cron";
import { Subscription } from "../models/Subscription.model.js";
import { User } from "../models/User.model.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { sendEmail } from "../services/notification.service.js";
import { ENV } from "../config/env.js";

// -------------------------------------------------------
// Run every day at midnight IST (18:30 UTC)
// -------------------------------------------------------
export const startCronJobs = () => {
  console.log("⏰ Cron jobs started");

  // Check expired subscriptions — daily at midnight
  cron.schedule("30 18 * * *", async () => {
    console.log("🔄 Running subscription expiry check...");
    await checkExpiredSubscriptions();
  });

  // Check trial ending soon — daily at 9 AM IST (3:30 UTC)
  cron.schedule("30 3 * * *", async () => {
    console.log("🔄 Checking trials ending soon...");
    await notifyTrialEndingSoon();
  });

  // Health check log — every hour
  cron.schedule("0 * * * *", () => {
    console.log(`✅ Cron alive — ${new Date().toISOString()}`);
  });
};

// -------------------------------------------------------
// Expire subscriptions past their end date
// -------------------------------------------------------
const checkExpiredSubscriptions = async () => {
  try {
    const now = new Date();

    const expired = await Subscription.find({
      status: "active",
      currentPeriodEnd: { $lt: now },
    }).populate("owner", "name email");

    console.log(`Found ${expired.length} expired subscriptions`);

    for (const sub of expired) {
      // Mark expired
      sub.status = "expired";
      await sub.save();

      // Downgrade user
      await User.findByIdAndUpdate(sub.owner._id, {
        currentPlan: "none",
      });

      // Remove featured from restaurants
      await Restaurant.updateMany(
        { owner: sub.owner._id },
        {
          isFeatured: false,
          featuredUntil: null,
        }
      );

      // Send expiry email
      try {
        await sendExpiryEmail({
          email: sub.owner.email,
          name: sub.owner.name,
          planName: sub.planName,
          isTrial: sub.isTrial,
        });
      } catch (emailErr) {
        console.error("Expiry email failed:", emailErr.message);
      }

      console.log(
        `✅ Expired subscription for: ${sub.owner.email} (${sub.planName})`
      );
    }
  } catch (err) {
    console.error("❌ Expiry check failed:", err.message);
  }
};

// -------------------------------------------------------
// Notify owners 3 days before trial ends
// -------------------------------------------------------
const notifyTrialEndingSoon = async () => {
  try {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const endingSoon = await Subscription.find({
      status: "active",
      isTrial: true,
      trialEndsAt: {
        $gte: now,
        $lte: threeDaysLater,
      },
      // Dont notify same sub twice
      notifiedTrialEnding: { $ne: true },
    }).populate("owner", "name email");

    console.log(`Found ${endingSoon.length} trials ending soon`);

    for (const sub of endingSoon) {
      const daysLeft = Math.ceil(
        (sub.trialEndsAt - now) / (1000 * 60 * 60 * 24)
      );

      try {
        await sendTrialEndingEmail({
          email: sub.owner.email,
          name: sub.owner.name,
          daysLeft,
          trialEndsAt: sub.trialEndsAt,
        });

        // Mark as notified
        sub.notifiedTrialEnding = true;
        await sub.save();

        console.log(
          `📧 Trial ending notification sent: ${sub.owner.email} (${daysLeft} days left)`
        );
      } catch (emailErr) {
        console.error("Trial ending email failed:", emailErr.message);
      }
    }
  } catch (err) {
    console.error("❌ Trial ending check failed:", err.message);
  }
};

// -------------------------------------------------------
// Email templates
// -------------------------------------------------------
const sendExpiryEmail = async ({ email, name, planName, isTrial }) => {
  const html = `
    <div style="font-family: DM Sans, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf9f5; padding: 32px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #00191a; font-size: 24px; margin: 0;">GoodFoods</h1>
      </div>
      
      <h2 style="color: #00191a; font-size: 20px;">
        ${isTrial ? "Your free trial has ended 😢" : "Your subscription has expired"}
      </h2>
      
      <p style="color: #414848; line-height: 1.6;">
        Hey ${name}, your ${isTrial ? "14-day free trial" : `${planName} plan`} 
        has expired. Your owner dashboard has been temporarily suspended.
      </p>

      <div style="background: #0d2f2f; padding: 20px; border-radius: 12px; margin: 24px 0; text-align: center;">
        <p style="color: rgba(255,255,255,0.8); margin: 0 0 16px 0; font-size: 14px;">
          Renew now to restore full access to your dashboard
        </p>
        <a href="${ENV.FRONTEND_URL}/become-owner" 
          style="background: #795900; color: white; padding: 12px 28px; border-radius: 50px; text-decoration: none; font-weight: 700; display: inline-block;">
          Renew Subscription
        </a>
      </div>

      <p style="color: #717878; font-size: 13px; text-align: center;">
        Your restaurant listings are paused until you renew.
        All your data is safe and will be restored on renewal.
      </p>
    </div>
  `;

  const { sendEmail: send } = await import("../services/notification.service.js");
  await send({
    to: email,
    subject: isTrial
      ? "Your GoodFoods free trial has ended"
      : "Your GoodFoods subscription has expired",
    html,
  });
};

const sendTrialEndingEmail = async ({
  email, name, daysLeft, trialEndsAt,
}) => {
  const html = `
    <div style="font-family: DM Sans, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf9f5; padding: 32px; border-radius: 16px;">
      <h2 style="color: #00191a;">
        ⏰ Your free trial ends in ${daysLeft} day${daysLeft > 1 ? "s" : ""}!
      </h2>
      
      <p style="color: #414848; line-height: 1.6;">
        Hey ${name}, your GoodFoods free trial expires on 
        <strong>${new Date(trialEndsAt).toLocaleDateString("en-IN", { 
          day: "numeric", month: "long", year: "numeric" 
        })}</strong>.
      </p>

      <p style="color: #414848;">
        Upgrade to a paid plan to keep your restaurants live and 
        continue receiving bookings without interruption.
      </p>

      <div style="display: flex; gap: 12px; margin: 24px 0; flex-wrap: wrap;">
        <div style="flex: 1; background: white; border: 1px solid #e3e2df; border-radius: 12px; padding: 16px; min-width: 200px;">
          <h3 style="color: #00191a; margin: 0 0 8px 0;">Premium</h3>
          <p style="color: #795900; font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">₹2,999/mo</p>
          <ul style="color: #414848; font-size: 13px; padding-left: 16px; margin: 0;">
            <li>Up to 5 restaurants</li>
            <li>Analytics dashboard</li>
            <li>AI marketing</li>
          </ul>
        </div>
        <div style="flex: 1; background: #0d2f2f; border-radius: 12px; padding: 16px; min-width: 200px;">
          <h3 style="color: white; margin: 0 0 8px 0;">Featured ⭐</h3>
          <p style="color: #fcc340; font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">₹5,999/mo</p>
          <ul style="color: rgba(255,255,255,0.8); font-size: 13px; padding-left: 16px; margin: 0;">
            <li>Unlimited restaurants</li>
            <li>First in AI search</li>
            <li>Verified badge</li>
          </ul>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${ENV.FRONTEND_URL}/owner/subscription" 
          style="background: #795900; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 16px;">
          Upgrade Now →
        </a>
      </div>
    </div>
  `;

  const { sendEmail: send } = await import("../services/notification.service.js");
  await send({
    to: email,
    subject: `⏰ Your GoodFoods trial ends in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`,
    html,
  });
};

export { checkExpiredSubscriptions, notifyTrialEndingSoon };