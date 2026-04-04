import { useDispatch, useSelector } from "react-redux";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  setFilters,
  resetFilters,
  selectFilters,
} from "../../features/restaurant/restaurantSlice.js";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Button from "../ui/Button.jsx";
import { CUISINE_TYPES, AREAS } from "../../utils/constants.js";

const cuisineOptions = [
  ...CUISINE_TYPES.map((c) => ({ label: c, value: c })),
];

const areaOptions = [
  ...AREAS.map((a) => ({ label: a, value: a })),
];

const guestOptions = Array.from({ length: 10 }, (_, i) => ({
  label: `${i + 1} ${i + 1 === 1 ? "Guest" : "Guests"}`,
  value: String(i + 1),
}));

const RestaurantFilters = () => {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== "" && v !== 2 && v !== null
  );

  const handleChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-700 font-semibold">
          <SlidersHorizontal size={18} className="text-primary-500" />
          Filters
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<X size={14} />}
            onClick={() => dispatch(resetFilters())}
            className="text-red-500 hover:bg-red-50"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cuisine */}
        <Select
          label="Cuisine"
          placeholder="All Cuisines"
          options={cuisineOptions}
          value={filters.cuisine}
          onChange={(e) => handleChange("cuisine", e.target.value)}
        />

        {/* Area */}
        <Select
          label="Area"
          placeholder="All Areas"
          options={areaOptions}
          value={filters.area}
          onChange={(e) => handleChange("area", e.target.value)}
        />

        {/* Date */}
        <Input
          label="Date"
          type="date"
          value={filters.date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => handleChange("date", e.target.value)}
        />

        {/* Guests */}
        <Select
          label="Guests"
          options={guestOptions}
          value={String(filters.guests)}
          onChange={(e) => handleChange("guests", Number(e.target.value))}
        />
      </div>
    </div>
  );
};

export default RestaurantFilters;