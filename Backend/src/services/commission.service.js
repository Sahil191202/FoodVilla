import { Commission } from "../models/Commission.model.js";
import { User } from "../models/User.model.js";
import { COMMISSION_STATUS } from "../utils/constants.js";

// Calculate commission for a reservation
export const calculateCommission = (
  averageCostForTwo,
  guests,
  commissionRate
) => {
  const estimatedBill = (averageCostForTwo / 2) * guests;
  const commissionAmount = (estimatedBill * commissionRate) / 100;

  return {
    estimatedBill: Math.round(estimatedBill),
    commissionAmount: Math.round(commissionAmount),
  };
};

// Create commission record when reservation is made
export const createCommission = async ({
  reservationId,
  restaurantId,
  ownerId,
  userId,
  guests,
  averageCostForTwo,
  commissionRate,
}) => {
  const { estimatedBill, commissionAmount } = calculateCommission(
    averageCostForTwo,
    guests,
    commissionRate
  );

  const commission = await Commission.create({
    reservation: reservationId,
    restaurant: restaurantId,
    owner: ownerId,
    user: userId,
    guests,
    averageCostForTwo,
    estimatedBill,
    commissionRate,
    commissionAmount,
    status: COMMISSION_STATUS.PENDING,
  });

  return commission;
};

// Mark commission as earned — when reservation completed
export const earnCommission = async (reservationId) => {
  const commission = await Commission.findOne({
    reservation: reservationId,
  });

  if (!commission) return;

  commission.status = COMMISSION_STATUS.EARNED;
  commission.earnedAt = new Date();
  await commission.save();

  // Update owner's total commission paid
  await User.findByIdAndUpdate(commission.owner, {
    $inc: { totalCommissionPaid: commission.commissionAmount },
  });

  return commission;
};

// Cancel commission — when reservation cancelled
export const cancelCommission = async (reservationId) => {
  const commission = await Commission.findOne({
    reservation: reservationId,
  });

  if (!commission) return;

  commission.status = COMMISSION_STATUS.CANCELLED;
  commission.cancelledAt = new Date();
  await commission.save();

  return commission;
};

// Get commission summary for owner
export const getOwnerCommissionSummary = async (ownerId) => {
  const commissions = await Commission.find({ owner: ownerId })
    .populate("restaurant", "name")
    .populate("reservation", "date confirmationCode")
    .sort({ createdAt: -1 });

  const totalEarned = commissions
    .filter((c) => c.status === COMMISSION_STATUS.EARNED)
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const totalPending = commissions
    .filter((c) => c.status === COMMISSION_STATUS.PENDING)
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const totalCancelled = commissions
    .filter((c) => c.status === COMMISSION_STATUS.CANCELLED)
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  return {
    commissions,
    summary: {
      totalEarned,
      totalPending,
      totalCancelled,
      totalRecords: commissions.length,
    },
  };
};

// Get all commissions for admin
export const getAdminCommissionSummary = async () => {
  const commissions = await Commission.find()
    .populate("owner", "name email businessName")
    .populate("restaurant", "name")
    .populate("user", "name")
    .sort({ createdAt: -1 });

  const totalEarned = commissions
    .filter((c) => c.status === COMMISSION_STATUS.EARNED)
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const totalPending = commissions
    .filter((c) => c.status === COMMISSION_STATUS.PENDING)
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  // Group by owner
  const byOwner = commissions.reduce((acc, c) => {
    const ownerId = c.owner._id.toString();
    if (!acc[ownerId]) {
      acc[ownerId] = {
        owner: c.owner,
        earned: 0,
        pending: 0,
        total: 0,
      };
    }
    if (c.status === COMMISSION_STATUS.EARNED) {
      acc[ownerId].earned += c.commissionAmount;
    }
    if (c.status === COMMISSION_STATUS.PENDING) {
      acc[ownerId].pending += c.commissionAmount;
    }
    acc[ownerId].total += c.commissionAmount;
    return acc;
  }, {});

  return {
    commissions,
    summary: {
      totalEarned,
      totalPending,
      byOwner: Object.values(byOwner),
    },
  };
};