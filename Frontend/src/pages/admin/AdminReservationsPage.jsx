import { useState } from "react";
import { motion } from "framer-motion";
import { Search, CalendarDays } from "lucide-react";
import { useAdminReservations, useUpdateReservationStatus } from "../../hooks/useAdmin.js";
import Badge from "../../components/ui/Badge.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { formatDate, formatTime } from "../../utils/formatters.js";
import { RESERVATION_STATUS } from "../../utils/constants.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import BackButton from "../../components/common/BackButton.jsx";

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "No Show", value: "no_show" },
];

const AdminReservationsPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: reservations, isLoading } = useAdminReservations();
  const { mutate: updateStatus } = useUpdateReservationStatus();

  const filtered = reservations?.filter((r) => {
    const matchSearch =
      !debouncedSearch ||
      r.confirmationCode
        ?.toLowerCase()
        .includes(debouncedSearch.toLowerCase()) ||
      r.user?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      r.restaurant?.name
        ?.toLowerCase()
        .includes(debouncedSearch.toLowerCase());

    const matchStatus = !statusFilter || r.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
      <BackButton to="home" label="Back to App" className="mb-6" />
        <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
        <p className="text-gray-500 mt-1">
          {reservations?.length || 0} total reservations
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by code, guest name, restaurant..."
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
          <CalendarDays size={48} className="mx-auto mb-4 opacity-30" />
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
                {filtered.map((r, i) => (
                  <motion.tr
                    key={r._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4 text-sm font-mono font-medium text-gray-700">
                      {r.confirmationCode}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      <div>
                        <p className="font-medium">{r.user?.name}</p>
                        <p className="text-xs text-gray-400">{r.user?.phone}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      <div>
                        <p className="font-medium">{r.restaurant?.name}</p>
                        <p className="text-xs text-gray-400">
                          {r.restaurant?.address?.area}
                        </p>
                      </div>
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
                      {r.status === RESERVATION_STATUS.CONFIRMED && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              updateStatus({
                                id: r._id,
                                status: RESERVATION_STATUS.COMPLETED,
                              })
                            }
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() =>
                              updateStatus({
                                id: r._id,
                                status: RESERVATION_STATUS.NO_SHOW,
                              })
                            }
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            No Show
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {filtered.length} of {reservations?.length} reservations
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminReservationsPage;