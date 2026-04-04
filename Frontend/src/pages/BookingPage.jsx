import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, UtensilsCrossed } from "lucide-react";
import { useRestaurant } from "../hooks/useRestaurants.js";
import BookingForm from "../components/reservation/BookingForm.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import Badge from "../components/ui/Badge.jsx";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: restaurant, isLoading } = useRestaurant(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 group transition-colors"
      >
        <ChevronLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back
      </motion.button>

      {/* Restaurant Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <UtensilsCrossed size={26} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{restaurant.name}</h2>
            <p className="text-white/80 text-sm mt-0.5">
              {restaurant.address?.area}, {restaurant.address?.city}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {restaurant.cuisine?.map((c) => (
                <Badge
                  key={c}
                  size="sm"
                  className="bg-white/20 text-white border-white/30"
                >
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Booking Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Reserve Your Table 🍽️
        </h2>
        <BookingForm restaurant={restaurant} />
      </motion.div>
    </div>
  );
};

export default BookingPage;