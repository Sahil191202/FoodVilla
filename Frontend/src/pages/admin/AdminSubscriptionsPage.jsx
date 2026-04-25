import { motion } from "framer-motion";
import {
  IndianRupee, Users, Crown,
  Star, Zap, TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../services/admin.service.js";
import Badge from "../../components/ui/Badge.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { formatPrice, formatDate } from "../../utils/formatters.js";
import { cn } from "../../utils/cn.js";
import BackButton from "../../components/common/BackButton.jsx";

const PLAN_ICONS = {
  free: <Zap size={14} className="text-gray-500" />,
  premium: <Star size={14} className="text-blue-500" />,
  featured: <Crown size={14} className="text-primary-500" />,
};

const PLAN_COLORS = {
  free: "default",
  premium: "info",
  featured: "primary",
};

const useAdminSubscriptions = () => {
  return useQuery({
    queryKey: ["admin", "subscriptions"],
    queryFn: adminService.getSubscriptions,
    select: (data) => data.data.subscriptions,
  });
};

const StatCard = ({ icon, label, value, color, delay }) => (
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
  </motion.div>
);

const AdminSubscriptionsPage = () => {
  const { data: subscriptions, isLoading } = useAdminSubscriptions();

  const totalRevenue = subscriptions
    ?.flatMap((s) => s.payments || [])
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.amount, 0) || 0;

  const premiumCount = subscriptions?.filter(
    (s) => s.planName === "premium" && s.status === "active"
  ).length || 0;

  const featuredCount = subscriptions?.filter(
    (s) => s.planName === "featured" && s.status === "active"
  ).length || 0;

  const STATS = [
    {
      icon: <IndianRupee size={22} className="text-green-500" />,
      label: "Total Revenue",
      value: formatPrice(totalRevenue),
      color: "bg-green-50",
      delay: 0,
    },
    {
      icon: <Users size={22} className="text-blue-500" />,
      label: "Active Subscriptions",
      value: subscriptions?.filter((s) => s.status === "active").length || 0,
      color: "bg-blue-50",
      delay: 0.1,
    },
    {
      icon: <Star size={22} className="text-blue-400" />,
      label: "Premium Owners",
      value: premiumCount,
      color: "bg-blue-50",
      delay: 0.2,
    },
    {
      icon: <Crown size={22} className="text-primary-500" />,
      label: "Featured Owners",
      value: featuredCount,
      color: "bg-primary-50",
      delay: 0.3,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
      <BackButton to="home" label="Back to App" className="mb-6" />
        <h1 className="text-2xl font-bold text-gray-900">
          Subscriptions & Revenue 💰
        </h1>
        <p className="text-gray-500 mt-1">
          Platform subscription management
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Subscriptions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            All Subscriptions
          </h2>
          <Badge variant="primary" size="sm">
            {subscriptions?.length} total
          </Badge>
        </div>

        {!subscriptions?.length ? (
          <div className="py-16 text-center text-gray-400">
            <Crown size={40} className="mx-auto mb-3 opacity-30" />
            <p>No subscriptions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Owner",
                    "Plan",
                    "Status",
                    "Period",
                    "Revenue",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subscriptions.map((sub, i) => {
                  const revenue = sub.payments
                    ?.filter((p) => p.status === "success")
                    .reduce((sum, p) => sum + p.amount, 0) || 0;

                  return (
                    <motion.tr
                      key={sub._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={sub.owner?.name}
                            size="sm"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {sub.owner?.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {sub.owner?.businessName ||
                                sub.owner?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {PLAN_ICONS[sub.planName]}
                          <Badge
                            variant={PLAN_COLORS[sub.planName]}
                            size="sm"
                          >
                            {sub.plan?.displayName || sub.planName}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={
                            sub.status === "active"
                              ? "success"
                              : sub.status === "expired"
                              ? "danger"
                              : "warning"
                          }
                          dot
                          size="sm"
                        >
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        <p className="text-xs">
                          {formatDate(sub.currentPeriodStart)}
                        </p>
                        <p className="text-xs text-gray-400">
                          → {formatDate(sub.currentPeriodEnd)}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-green-600">
                        {formatPrice(revenue)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-between">
          <p className="text-xs text-gray-500">
            {subscriptions?.length} subscriptions
          </p>
          <p className="text-xs font-medium text-gray-700">
            Total Revenue:{" "}
            <span className="text-green-600">
              {formatPrice(totalRevenue)}
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSubscriptionsPage;