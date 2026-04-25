import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Eye, Search, CalendarDays,
  TrendingUp, Bot, Target,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useMyRestaurants } from "../../hooks/useOwner.js";
import { useRestaurantAnalytics } from "../../hooks/useAnalytics.js";
import Select from "../../components/ui/Select.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import BackButton from "../../components/common/BackButton.jsx";

const StatCard = ({ icon, label, value, sub, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="rounded-2xl border p-5"
    style={{
      backgroundColor: "#fff",
      borderColor: "rgba(193,200,199,0.3)",
    }}
  >
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
      style={{ backgroundColor: color + "15" }}
    >
      <span style={{ color }}>{icon}</span>
    </div>
    <p
      className="text-2xl font-bold font-display mb-1"
      style={{ color: "#00191a" }}
    >
      {value}
    </p>
    <p className="text-sm" style={{ color: "#414848" }}>{label}</p>
    {sub && (
      <p className="text-xs mt-1" style={{ color: "#717878" }}>{sub}</p>
    )}
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border px-4 py-3 shadow-lg"
      style={{
        backgroundColor: "#fff",
        borderColor: "rgba(193,200,199,0.3)",
      }}
    >
      <p className="text-xs font-bold mb-2" style={{ color: "#00191a" }}>
        {label}
      </p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const OwnerAnalyticsPage = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [days, setDays] = useState(30);

  const { data: restaurants } = useMyRestaurants();
  const { data: analytics, isLoading } = useRestaurantAnalytics(
    selectedRestaurant,
    days
  );

  const restaurantOptions =
    restaurants?.map((r) => ({ label: r.name, value: r._id })) || [];

  const dayOptions = [
    { label: "Last 7 days", value: "7" },
    { label: "Last 30 days", value: "30" },
    { label: "Last 90 days", value: "90" },
  ];

  const STATS = analytics
    ? [
        {
          icon: <Eye size={20} />,
          label: "Profile Views",
          value: analytics.totals.profileViews,
          sub: "Users viewed your restaurant",
          color: "#0d6b6b",
          delay: 0,
        },
        {
          icon: <Search size={20} />,
          label: "Search Appearances",
          value: analytics.totals.searchAppearances,
          sub: "Times shown in results",
          color: "#795900",
          delay: 0.1,
        },
        {
          icon: <CalendarDays size={20} />,
          label: "Bookings Made",
          value: analytics.totals.bookingsMade,
          sub: `${analytics.totals.bookingsCancelled} cancelled`,
          color: "#16a34a",
          delay: 0.2,
        },
        {
          icon: <Target size={20} />,
          label: "Conversion Rate",
          value: `${analytics.totals.conversionRate}%`,
          sub: "Views → Bookings",
          color: "#7c5cbf",
          delay: 0.3,
        },
        {
          icon: <Bot size={20} />,
          label: "AI Mentions",
          value: analytics.totals.aiMentions,
          sub: "Shown in AI chat",
          color: "#0d6b6b",
          delay: 0.4,
        },
      ]
    : [];

  return (
    <div>
    <BackButton to="home" label="Back to App" className="mb-6" />
      <div className="mb-6">
        <h1
          className="text-2xl font-bold font-display"
          style={{ color: "#00191a" }}
        >
          Analytics 📊
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#414848" }}>
          Track your restaurant performance
        </p>
      </div>

      {/* Selectors */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Select
            placeholder="Select restaurant..."
            options={restaurantOptions}
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Select
            options={dayOptions}
            value={String(days)}
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </div>
      </div>

      {!selectedRestaurant ? (
        <div
          className="text-center py-20 rounded-2xl border"
          style={{
            backgroundColor: "#faf9f5",
            borderColor: "rgba(193,200,199,0.3)",
          }}
        >
          <BarChart3
            size={40}
            className="mx-auto mb-3"
            style={{ color: "#c1c8c7" }}
          />
          <p style={{ color: "#414848" }}>
            Select a restaurant to view analytics
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="xl" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {STATS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Charts */}
          {analytics?.daily?.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bookings Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl border p-5"
                style={{
                  backgroundColor: "#fff",
                  borderColor: "rgba(193,200,199,0.3)",
                }}
              >
                <h3
                  className="font-semibold mb-4"
                  style={{ color: "#00191a" }}
                >
                  Bookings Over Time
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={analytics.daily}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(193,200,199,0.3)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#717878" }}
                      tickFormatter={(d) =>
                        new Date(d).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      }
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#717878" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="bookingsMade"
                      name="Bookings"
                      stroke="#0d6b6b"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Views Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-2xl border p-5"
                style={{
                  backgroundColor: "#fff",
                  borderColor: "rgba(193,200,199,0.3)",
                }}
              >
                <h3
                  className="font-semibold mb-4"
                  style={{ color: "#00191a" }}
                >
                  Views & Searches
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.daily}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(193,200,199,0.3)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#717878" }}
                      tickFormatter={(d) =>
                        new Date(d).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      }
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#717878" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="profileViews"
                      name="Views"
                      fill="#0d6b6b"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="searchAppearances"
                      name="Searches"
                      fill="#fcc340"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OwnerAnalyticsPage;