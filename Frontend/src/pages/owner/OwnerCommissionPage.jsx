import { motion } from "framer-motion";
import {
  IndianRupee,
  TrendingUp,
  Clock,
  XCircle,
  Info,
} from "lucide-react";
import { useOwnerCommissions } from "../../hooks/useOwner.js";
import Badge from "../../components/ui/Badge.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { formatPrice, formatDate } from "../../utils/formatters.js";
import { cn } from "../../utils/cn.js";

const StatCard = ({ icon, label, value, color, delay, sub }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
  >
    <div
      className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
        color
      )}
    >
      {icon}
    </div>
    <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </motion.div>
);

const OwnerCommissionPage = () => {
  const { data, isLoading } = useOwnerCommissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  const { summary, commissions } = data || {};

  const STATS = [
    {
      icon: <IndianRupee size={22} className="text-green-500" />,
      label: "Total Commission Paid",
      value: formatPrice(summary?.totalEarned || 0),
      sub: "To GoodFoods platform",
      color: "bg-green-50",
      delay: 0,
    },
    {
      icon: <Clock size={22} className="text-yellow-500" />,
      label: "Pending Commission",
      value: formatPrice(summary?.totalPending || 0),
      sub: "For upcoming reservations",
      color: "bg-yellow-50",
      delay: 0.1,
    },
    {
      icon: <XCircle size={22} className="text-gray-400" />,
      label: "Cancelled Commission",
      value: formatPrice(summary?.totalCancelled || 0),
      sub: "Cancelled reservations",
      color: "bg-gray-50",
      delay: 0.2,
    },
    {
      icon: <TrendingUp size={22} className="text-blue-500" />,
      label: "Total Records",
      value: summary?.totalRecords || 0,
      sub: "All time bookings",
      color: "bg-blue-50",
      delay: 0.3,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Commission Dashboard 💰
        </h1>
        <p className="text-gray-500 mt-1">
          Track commission paid to GoodFoods platform
        </p>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-6 flex items-start gap-3"
      >
        <Info
          size={18}
          className="text-primary-500 shrink-0 mt-0.5"
        />
        <div>
          <p className="text-sm font-medium text-primary-700">
            How Commission Works
          </p>
          <p className="text-xs text-primary-600 mt-0.5">
            Commission = (Avg Cost per Person) × Guests ×
            Commission Rate. Commission is only charged when a user
            actually visits your restaurant!
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Commission Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            Commission History
          </h2>
        </div>

        {!commissions?.length ? (
          <div className="py-16 text-center text-gray-400">
            <IndianRupee
              size={40}
              className="mx-auto mb-3 opacity-30"
            />
            <p>No commission records yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Reservation",
                    "Restaurant",
                    "Date",
                    "Guests",
                    "Est. Bill",
                    "Rate",
                    "Commission",
                    "Status",
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
                {commissions.map((c, i) => (
                  <motion.tr
                    key={c._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4 text-sm font-mono font-medium text-gray-700">
                      {c.reservation?.confirmationCode}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {c.restaurant?.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {c.reservation?.date
                        ? formatDate(c.reservation.date)
                        : "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {c.guests}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {formatPrice(c.estimatedBill)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {c.commissionRate}%
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                      {formatPrice(c.commissionAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          c.status === "earned"
                            ? "success"
                            : c.status === "cancelled"
                            ? "danger"
                            : "warning"
                        }
                        dot
                        size="sm"
                      >
                        {c.status}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {commissions?.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {commissions.length} records
            </p>
            <p className="text-xs font-medium text-gray-700">
              Total Paid:{" "}
              <span className="text-green-600">
                {formatPrice(summary?.totalEarned || 0)}
              </span>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default OwnerCommissionPage;