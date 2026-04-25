import { motion } from "framer-motion";
import {
  Users, UtensilsCrossed, CalendarDays,
  IndianRupee, TrendingUp, Clock,
  CheckCircle, AlertCircle,
} from "lucide-react";
import { useAdminStats, useAdminReservations } from "../../hooks/useAdmin.js";
import Spinner from "../../components/ui/Spinner.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { formatDate, formatTime, formatPrice } from "../../utils/formatters.js";
import { cn } from "../../utils/cn.js";
import BackButton from "../../components/common/BackButton.jsx";

const StatCard = ({ icon, label, value, sub, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center",
        color
      )}>
        {icon}
      </div>
      <TrendingUp size={16} className="text-green-500" />
    </div>
    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </motion.div>
);

const AdminOverviewPage = () => {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: reservations, isLoading: resLoading } = useAdminReservations();

  const isLoading = statsLoading || resLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  const recent = reservations?.slice(0, 6);

// Replace commission stats with subscription stats
const STATS = [
  {
    icon: <Users size={22} className="text-blue-500" />,
    label: "Total Users",
    value: stats?.totalUsers || 0,
    sub: `${stats?.totalOwners || 0} restaurant owners`,
    color: "bg-blue-50",
    delay: 0,
  },
  {
    icon: <UtensilsCrossed size={22} className="text-primary-500" />,
    label: "Restaurants",
    value: stats?.totalRestaurants || 0,
    sub: `${stats?.approvedRestaurants || 0} live • ${stats?.featuredRestaurants || 0} featured ⭐`,
    color: "bg-primary-50",
    delay: 0.1,
  },
  {
    icon: <CalendarDays size={22} className="text-purple-500" />,
    label: "Total Reservations",
    value: stats?.totalReservations || 0,
    sub: `${stats?.completedReservations || 0} completed`,
    color: "bg-purple-50",
    delay: 0.2,
  },
  {
    icon: <IndianRupee size={22} className="text-green-500" />,
    label: "Subscription Revenue",
    value: formatPrice(stats?.totalRevenue || 0),
    sub: `${stats?.activeSubscriptions || 0} active • ${stats?.featuredSubs || 0} featured`,
    color: "bg-green-50",
    delay: 0.3,
  },
];

  return (
    <div>
      <div className="mb-8">
      <BackButton to="home" label="Back to App" className="mb-6" />
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Dashboard 🛡️
        </h1>
        <p className="text-gray-500 mt-1">
          Platform overview and management
        </p>
      </div>

      {/* Stats */}
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
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Recent Reservations
          </h2>
          <Badge variant="primary" size="sm">
            Latest {recent?.length}
          </Badge>
        </div>

        {!recent?.length ? (
          <div className="py-12 text-center text-gray-400">
            <CalendarDays size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No reservations yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Code", "Guest", "Restaurant",
                    "Owner", "Date & Time", "Status",
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
                {recent.map((r) => (
                  <tr
                    key={r._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4 text-sm font-mono font-medium text-gray-700">
                      {r.confirmationCode}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {r.user?.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {r.restaurant?.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {r.restaurant?.owner?.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {formatDate(r.date)}
                      <br />
                      <span className="text-xs text-gray-400">
                        {formatTime(r.time)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          r.status === "confirmed" ? "success"
                          : r.status === "cancelled" ? "danger"
                          : r.status === "completed" ? "info"
                          : "warning"
                        }
                        dot size="sm"
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