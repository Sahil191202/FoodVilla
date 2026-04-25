import { motion } from "framer-motion";
import {
  IndianRupee, TrendingUp, Clock,
  Users, BarChart3,
} from "lucide-react";
import { useAdminCommissions } from "../../hooks/useAdmin.js";
import Badge from "../../components/ui/Badge.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import { formatPrice, formatDate } from "../../utils/formatters.js";
import { cn } from "../../utils/cn.js";
import BackButton from "../../components/common/BackButton.jsx";

const StatCard = ({ icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
  >
    <div className={cn(
      "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
      color
    )}>
      {icon}
    </div>
    <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </motion.div>
);

const AdminCommissionPage = () => {
  const { data, isLoading } = useAdminCommissions();

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
      label: "Total Earned",
      value: formatPrice(summary?.totalEarned || 0),
      color: "bg-green-50",
      delay: 0,
    },
    {
      icon: <Clock size={22} className="text-yellow-500" />,
      label: "Pending",
      value: formatPrice(summary?.totalPending || 0),
      color: "bg-yellow-50",
      delay: 0.1,
    },
    {
      icon: <Users size={22} className="text-blue-500" />,
      label: "Active Owners",
      value: summary?.byOwner?.length || 0,
      color: "bg-blue-50",
      delay: 0.2,
    },
    {
      icon: <BarChart3 size={22} className="text-purple-500" />,
      label: "Total Records",
      value: commissions?.length || 0,
      color: "bg-purple-50",
      delay: 0.3,
    },
  ];

  return (
    <div>
      <div className="mb-8">
      <BackButton to="home" label="Back to App" className="mb-6" />
        <h1 className="text-2xl font-bold text-gray-900">
          Commission Dashboard 💰
        </h1>
        <p className="text-gray-500 mt-1">
          Platform commission earnings overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* By Owner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Commission by Owner
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {summary?.byOwner?.map((o) => (
              <div
                key={o.owner._id}
                className="px-5 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Avatar name={o.owner.name} size="xs" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {o.owner.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {o.owner.businessName || o.owner.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    {formatPrice(o.earned)}
                  </p>
                  {o.pending > 0 && (
                    <p className="text-xs text-yellow-500">
                      +{formatPrice(o.pending)} pending
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Commissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Recent Commission Records
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Code", "Owner", "Restaurant",
                    "Bill", "Commission", "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {commissions?.slice(0, 10).map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs font-mono text-gray-600">
                      {c.reservation?.confirmationCode}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {c.owner?.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {c.restaurant?.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatPrice(c.estimatedBill)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatPrice(c.commissionAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          c.status === "earned" ? "success"
                          : c.status === "cancelled" ? "danger"
                          : "warning"
                        }
                        dot size="sm"
                      >
                        {c.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminCommissionPage;