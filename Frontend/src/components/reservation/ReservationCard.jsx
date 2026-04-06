import { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Hash,
  MessageSquare,
  X,
} from "lucide-react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";
import { formatRelativeDate, formatTime } from "../../utils/formatters.js";
import { useCancelReservation } from "../../hooks/useReservations.js";
import { STATUS_COLORS, RESERVATION_STATUS } from "../../utils/constants.js";
import { cn } from "../../utils/cn.js";

const ReservationCard = ({ reservation }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { mutate: cancel, isPending } = useCancelReservation();

  const {
    _id,
    confirmationCode,
    restaurant,
    date,
    time,
    guests,
    status,
    specialRequests,
  } = reservation;

  const canCancel = status === RESERVATION_STATUS.CONFIRMED ||
    status === RESERVATION_STATUS.PENDING;

  const handleCancel = () => {
    cancel(
      { id: _id, data: { cancelReason: "Cancelled by user" } },
      { onSuccess: () => setShowCancelModal(false) }
    );
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-gray-900 text-lg">
              {restaurant?.name}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin size={11} />
              {restaurant?.address?.area}, {restaurant?.address?.city}
            </p>
          </div>
          <Badge
            variant={
              status === "confirmed" ? "success" :
              status === "cancelled" ? "danger" :
              status === "completed" ? "info" : "warning"
            }
            dot
            size="sm"
          >
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
          </Badge>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
              <Calendar size={14} className="text-primary-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Date</p>
              <p className="font-medium text-xs">{formatRelativeDate(date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
              <Clock size={14} className="text-primary-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Time</p>
              <p className="font-medium text-xs">{formatTime(time)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
              <Users size={14} className="text-primary-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Guests</p>
              <p className="font-medium text-xs">{guests} People</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
              <Hash size={14} className="text-primary-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Code</p>
              <p className="font-medium text-xs font-mono">{confirmationCode}</p>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {specialRequests && (
          <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3 mb-4">
            <MessageSquare size={14} className="text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-600">{specialRequests}</p>
          </div>
        )}

        {/* Cancel Button */}
        {canCancel && (
          <Button
            variant="outline"
            size="sm"
            fullWidth
            leftIcon={<X size={14} />}
            onClick={() => setShowCancelModal(true)}
            className="text-red-500 border-red-200 hover:bg-red-50"
          >
            Cancel Reservation
          </Button>
        )}
      </Card>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Reservation"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
            >
              Keep Booking
            </Button>
            <Button
              variant="danger"
              isLoading={isPending}
              onClick={handleCancel}
            >
              Yes, Cancel
            </Button>
          </>
        }
      >
        <div className="text-center py-2">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={24} className="text-red-500" />
          </div>
          <p className="text-gray-700 font-medium mb-1">
            Are you sure you want to cancel?
          </p>
          <p className="text-sm text-gray-500">
            Your reservation at{" "}
            <span className="font-semibold">{restaurant?.name}</span> on{" "}
            <span className="font-semibold">{formatRelativeDate(date)}</span>{" "}
            will be cancelled.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default ReservationCard;