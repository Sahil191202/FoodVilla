import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  CalendarDays,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useMyRestaurants, useOwnerReservations, useOwnerCommissions } from "../../hooks/useOwner.js";
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
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          color
        )}
      >
        {icon}
      </div>
      <TrendingUp size={16} className="text-green-400" />
    </div>
    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </motion.div>
);

const OwnerOverviewPage = () => {
  const { data: restaurants, isLoading: rLoading } = useMyRestaurants();
  const { data: reservations, isLoading: resLoading } = useOwnerReservations();
  const { data: commissionData, isLoading: cLoading } = useOwnerCommissions();

  const isLoading = rLoading || resLoading || cLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  const confirmed = reservations?.filter(
    (r) => r.status === "confirmed"
  ).length || 0;

  const completed = reservations?.filter(
    (r) => r.status === "completed"
  ).length || 0;

  const totalEarned = commissionData?.summary?.totalEarned || 0;
  const totalPending = commissionData?.summary?.totalPending || 0;

  // Today's reservations
  const today = new Date().toISOString().split("T")[0];
  const todayReservations = reservations?.filter(
    (r) => r.date === today && r.status === "confirmed"
  ) || [];

  const STATS = [
    {
      icon: <UtensilsCrossed size={22} className="text-primary-500" />,
      label: "My Restaurants",
      value: restaurants?.length || 0,
      sub: `${restaurants?.filter((r) => r.isApproved).length || 0} approved`,
      color: "bg-primary-50",
      delay: 0,
    },
    {
      icon: <CalendarDays size={22} className="text-blue-500" />,
      label: "Total Reservations",
      value: reservations?.length || 0,
      sub: `${confirmed} upcoming`,
      color: "bg-blue-50",
      delay: 0.1,
    },
    {
      icon: <IndianRupee size={22} className="text-green-500" />,
      label: "Commission Earned",
      value: formatPrice(totalEarned),
      sub: `${formatPrice(totalPending)} pending`,
      color: "bg-green-50",
      delay: 0.2,
    },
    {
      icon: <CheckCircle size={22} className="text-purple-500" />,
      label: "Completed Visits",
      value: completed,
      sub: "Users who visited",
      color: "bg-purple-50",
      delay: 0.3,
    },
  ];

  return (
    <div>
      {/* Header */}
      <BackButton to="home" label="Back to App" className="mb-6" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here's your restaurant performance overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Reservations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              Today's Reservations
            </h2>
            <Badge variant="primary" size="sm">
              {todayReservations.length} upcoming
            </Badge>
          </div>

          {!todayReservations.length ? (
            <div className="py-12 text-center text-gray-400">
              <Clock size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No reservations today</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {todayReservations.map((r) => (
                <div
                  key={r._id}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {r.user?.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {r.restaurant?.name} • {formatTime(r.time)} •{" "}
                      {r.guests} guests
                    </p>
                  </div>
                  <Badge variant="success" dot size="sm">
                    {r.confirmationCode}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* My Restaurants Quick View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">My Restaurants</h2>
          </div>

          {!restaurants?.length ? (
            <div className="py-12 text-center text-gray-400">
              <UtensilsCrossed
                size={32}
                className="mx-auto mb-3 opacity-40"
              />
              <p className="text-sm">No restaurants added yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {restaurants.map((r) => (
                <div
                  key={r._id}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center overflow-hidden">
                      {r.images?.[0] ? (
                        <img
                          src={r.images[0]}
                          alt={r.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UtensilsCrossed
                          size={18}
                          className="text-primary-300"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {r.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {r.address?.area}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={r.isApproved ? "success" : "warning"}
                    dot
                    size="sm"
                  >
                    {r.isApproved ? "Live" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OwnerOverviewPage;