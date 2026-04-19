import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { useMyReservations } from "../hooks/useReservations.js";
import ReservationCard from "../components/reservation/ReservationCard.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { useNavigate } from "react-router-dom";
import { RESERVATION_STATUS } from "../utils/constants.js";
import { cn } from "../utils/cn.js";

const TABS = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const MyReservationsPage = () => {
  const navigate = useNavigate();
  const { data: reservations, isLoading, error, refetch } = useMyReservations();
  const [activeTab, setActiveTab] = useState("upcoming");

  const filtered = reservations?.filter((r) => {
    if (activeTab === "upcoming")
      return (
        r.status === RESERVATION_STATUS.CONFIRMED ||
        r.status === RESERVATION_STATUS.PENDING
      );
    if (activeTab === "completed")
      return r.status === RESERVATION_STATUS.COMPLETED;
    if (activeTab === "cancelled")
      return (
        r.status === RESERVATION_STATUS.CANCELLED ||
        r.status === RESERVATION_STATUS.NO_SHOW
      );
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          My Reservations 📅
        </h1>
        <p className="text-gray-500">
          Manage all your restaurant bookings here
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit"
      >
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              activeTab === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
            {reservations && (
              <span
                className={cn(
                  "ml-2 text-xs px-1.5 py-0.5 rounded-full",
                  activeTab === tab.value
                    ? "bg-primary-100 text-primary-600"
                    : "bg-gray-200 text-gray-500"
                )}
              >
                {reservations.filter((r) => {
                  if (tab.value === "upcoming")
                    return (
                      r.status === "confirmed" || r.status === "pending"
                    );
                  if (tab.value === "completed")
                    return r.status === "completed";
                  return (
                    r.status === "cancelled" || r.status === "no_show"
                  );
                }).length}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {filtered?.length === 0 ? (
              <EmptyState
                icon={<CalendarDays size={24} />}
                title={
                  activeTab === "upcoming"
                    ? "No Upcoming Reservations"
                    : activeTab === "completed"
                    ? "No Completed Reservations"
                    : "No Cancelled Reservations"
                }
                description={
                  activeTab === "upcoming"
                    ? "You don't have any upcoming bookings. Find a restaurant and book a table!"
                    : "Nothing here yet."
                }
                action={
                  activeTab === "upcoming"
                    ? () => navigate("/restaurants")
                    : undefined
                }
                actionLabel="Explore Restaurants"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered?.map((reservation, i) => (
                  <motion.div
                    key={reservation._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ReservationCard reservation={reservation} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default MyReservationsPage;