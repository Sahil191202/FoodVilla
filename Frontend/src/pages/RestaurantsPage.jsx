import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import RestaurantFilters from "../components/restaurant/RestaurantFilters.jsx";
import RestaurantGrid from "../components/restaurant/RestaurantGrid.jsx";
import { useRestaurants } from "../hooks/useRestaurants.js";
import { useSelector } from "react-redux";
import { selectFilters } from "../features/restaurant/restaurantSlice.js";
import ErrorState from "../components/ui/ErrorState.jsx";
import BackButton from "../components/common/BackButton.jsx";

const RestaurantsPage = () => {
  const { data: restaurants, isLoading, error } = useRestaurants();
  const filters = useSelector(selectFilters);

  const hasFilters = Object.values(filters).some(
    (v) => v !== "" && v !== 2 && v !== null
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
      <BackButton to="home" className="mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Restaurants 🍽️
        </h1>
        <p className="text-gray-500">
          {isLoading
            ? "Finding the best restaurants..."
            : `${restaurants?.length || 0} restaurants found${hasFilters ? " with your filters" : ""}`}
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <RestaurantFilters />
      </motion.div>

      {/* Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <RestaurantGrid
          restaurants={restaurants}
          isLoading={isLoading}
          error={error}
        />
      </motion.div>
    </div>
  );
};

export default RestaurantsPage;