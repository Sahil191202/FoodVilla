import { UtensilsCrossed } from "lucide-react";
import RestaurantCard from "./RestaurantCard.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import Spinner from "../ui/Spinner.jsx";
import { useNavigate } from "react-router-dom";

const RestaurantGrid = ({ restaurants, isLoading, error }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500">Finding restaurants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<span className="text-2xl">😕</span>}
        title="Something went wrong"
        description="Failed to load restaurants. Please try again."
      />
    );
  }

  if (!restaurants?.length) {
    return (
      <EmptyState
        icon={<UtensilsCrossed size={24} />}
        title="No Restaurants Found"
        description="Try adjusting your filters or search in a different area!"
        action={() => navigate("/restaurants")}
        actionLabel="Clear Filters"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant._id} restaurant={restaurant} />
      ))}
    </div>
  );
};

export default RestaurantGrid;