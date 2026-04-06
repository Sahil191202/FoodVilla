import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CalendarDays,
  CheckCircle,
  UserX,
  Filter,
} from "lucide-react";
import {
  useOwnerReservations,
  useCompleteReservation,
  useMarkNoShow,
} from "../../hooks/useOwner.js";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { formatDate, formatTime, formatPrice } from "../../utils/formatters.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import { RESERVATION_STATUS } from "../../utils/constants.js";

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "No Show", value: "no_show" },
];

const OwnerReservationsPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionModal, setActionModal] = useState(null);
  // actionModal = { type: "complete" | "noshow", reservation }

  const debouncedSearch = useDebounce(search, 400);

  const { data: reservations, isLoading } = useOwnerReservations();
  const { mutate: complete, isPending: isCompleting } =
    useCompleteReservation();
  const { mutate: noShow, isPending: isNoShowing } = useMarkNoShow();

  const filtered = reservations?.filter((r) => {
    const matchSearch =
      !debouncedSearch ||
      r.confirmationCode
        ?.toLowerCase()
        .includes(debouncedSearch.toLowerCase()) ||
      r.user?.name
        ?.toLowerCase()
        .includes(debouncedSearch.toLowerCase()) ||
      r.restaurant?.name
        ?.toLowerCase()
        .includes(debouncedSearch.toLowerCase());

    const matchStatus = !statusFilter || r.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const handleAction = () => {
    if (!actionModal) return;

    if (actionModal.type === "complete") {
      complete(actionModal.reservation._id, {
        onSuccess: () => setActionModal(null),
      });
    } else {
      noShow(actionModal.reservation._id, {
        onSuccess: () => setActionModal(null),
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
        <p className="text-gray-500 mt-1">
          {reservations?.length || 0} total reservations
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by code, guest, restaurant..."
            leftIcon={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sm:w-48">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="xl" />
        </div>
      ) : !filtered?.length ? (
        <div className="text-center py-20 text-gray-400">
          <CalendarDays
            size={48}
            className="mx-auto mb-4 opacity-30"
          />
          <p>No reservations found</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Code",
                    "Guest",
                    "Restaurant",
                    "Date & Time",
                    "Guests",
                    "Est. Bill",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r, i) => {
                  const estimatedBill =
                    ((r.restaurant?.averageCostForTwo || 0) / 2) * r.guests;

                  return (
                    <motion.tr
                      key={r._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm font-mono font-medium text-gray-700">
                        {r.confirmationCode}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {r.user?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {r.user?.phone}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {r.restaurant?.name}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {formatDate(r.date)}
                        <br />
                        <span className="text-xs text-gray-400">
                          {formatTime(r.time)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {r.guests}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">
                        {formatPrice(estimatedBill)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={
                            r.status === "confirmed"
                              ? "success"
                              : r.status === "cancelled"
                              ? "danger"
                              : r.status === "completed"
                              ? "info"
                              : "warning"
                          }
                          dot
                          size="sm"
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        {r.status ===
                          RESERVATION_STATUS.CONFIRMED && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setActionModal({
                                  type: "complete",
                                  reservation: r,
                                })
                              }
                              className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                            >
                              <CheckCircle size={12} />
                              Visited
                            </button>
                            <button
                              onClick={() =>
                                setActionModal({
                                  type: "noshow",
                                  reservation: r,
                                })
                              }
                              className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                              <UserX size={12} />
                              No Show
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {filtered.length} of {reservations?.length}{" "}
              reservations
            </p>
          </div>
        </motion.div>
      )}

      {/* Confirm Action Modal */}
      <Modal
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        title={
          actionModal?.type === "complete"
            ? "Confirm Visit"
            : "Mark No-Show"
        }
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setActionModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant={
                actionModal?.type === "complete" ? "primary" : "danger"
              }
              isLoading={isCompleting || isNoShowing}
              onClick={handleAction}
            >
              {actionModal?.type === "complete"
                ? "Yes, Mark Visited"
                : "Yes, Mark No-Show"}
            </Button>
          </>
        }
      >
        <div className="text-center py-2">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
              actionModal?.type === "complete"
                ? "bg-green-100"
                : "bg-gray-100"
            }`}
          >
            {actionModal?.type === "complete" ? (
              <CheckCircle size={24} className="text-green-500" />
            ) : (
              <UserX size={24} className="text-gray-500" />
            )}
          </div>
          <p className="text-gray-700 font-medium mb-1">
            {actionModal?.type === "complete"
              ? "Mark this reservation as visited?"
              : "Mark this reservation as no-show?"}
          </p>
          <p className="text-sm text-gray-500">
            {actionModal?.type === "complete"
              ? "This will earn you commission for this booking! 💰"
              : "No commission will be charged for no-shows."}
          </p>
          <div className="mt-3 bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-mono text-gray-600">
              {actionModal?.reservation?.confirmationCode}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {actionModal?.reservation?.user?.name} •{" "}
              {actionModal?.reservation?.guests} guests
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OwnerReservationsPage;