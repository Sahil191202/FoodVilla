import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  CalendarDays,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAdminRestaurants, useAdminReservations } from "../../hooks/useAdmin.js";
import Spinner from "../../components/ui/Spinner.jsx";
import { RESERVATION_STATUS } from "../../utils/constants.js";
import { formatDate, formatTime } from "../../utils/formatters.js";
import Badge from "../../components/ui/Badge.jsx";

const StatCard = ({ icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
  >
    <div className="flex items-center justify-between mb-4">
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          color
        )}
      >
        {icon}
      </div>
      <TrendingUp size={16} className="text-green-500" />
    </div>
    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </motion.div>
);

import { cn } from "../../utils/cn.js";

const AdminOverviewPage = () => {
  const { data: restaurants, isLoading: restaurantsLoading } =
    useAdminRestaurants();
  const { data: reservations, isLoading: reservationsLoading } =
    useAdminReservations();

  const isLoading = restaurantsLoading || reservationsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  const confirmed = reservations?.filter(
    (r) => r.status === RESERVATION_STATUS.CONFIRMED
  ).length;
  const cancelled = reservations?.filter(
    (r) => r.status === RESERVATION_STATUS.CANCELLED
  ).length;
  const completed = reservations?.filter(
    (r) => r.status === RESERVATION_STATUS.COMPLETED
  ).length;

  // Recent 5 reservations
  const recent = reservations?.slice(0, 5);

  const STATS = [
    {
      icon: <UtensilsCrossed size={22} className="text-primary-500" />,
      label: "Total Restaurants",
      value: restaurants?.length || 0,
      color: "bg-primary-50",
      delay: 0,
    },
    {
      icon: <CalendarDays size={22} className="text-blue-500" />,
      label: "Total Reservations",
      value: reservations?.length || 0,
      color: "bg-blue-50",
      delay: 0.1,
    },
    {
      icon: <CheckCircle size={22} className="text-green-500" />,
      label: "Confirmed",
      value: confirmed || 0,
      color: "bg-green-50",
      delay: 0.2,
    },
    {
      icon: <XCircle size={22} className="text-red-500" />,
      label: "Cancelled",
      value: cancelled || 0,
      color: "bg-red-50",
      delay: 0.3,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Overview 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Recent Reservations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Reservations</h2>
        </div>

        {!recent?.length ? (
          <div className="py-12 text-center text-gray-400">
            <CalendarDays size={32} className="mx-auto mb-3 opacity-50" />
            <p>No reservations yet</p>
          </div>
        ) : (
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
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((r) => (
                  <tr
                    key={r._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-gray-700">
                      {r.confirmationCode}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {r.user?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {r.restaurant?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(r.date)} • {formatTime(r.time)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {r.guests}
                    </td>
                    <td className="px-6 py-4">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminOverviewPage;