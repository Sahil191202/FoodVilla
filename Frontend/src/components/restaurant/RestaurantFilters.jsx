import { useDispatch, useSelector } from "react-redux";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  setFilters,
  resetFilters,
  selectFilters,
  toggleAmenity,
} from "../../features/restaurant/restaurantSlice.js";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Button from "../ui/Button.jsx";
import {
  CUISINE_TYPES,
  AMBIANCE_TYPES,
  AMENITIES,
  AREAS,
} from "../../utils/constants.js";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cuisineOptions = [...CUISINE_TYPES.map((c) => ({ label: c, value: c }))];

const areaOptions = [...AREAS.map((a) => ({ label: a, value: a }))];

const ambianceOptions = AMBIANCE_TYPES.map((a) => ({
  label: a.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
  value: a,
}));

const guestOptions = Array.from({ length: 10 }, (_, i) => ({
  label: `${i + 1} ${i + 1 === 1 ? "Guest" : "Guests"}`,
  value: String(i + 1),
}));

const AMENITY_LABELS = {
  wifi: "WiFi",
  parking: "Parking",
  live_music: "Live Music",
  craft_beer: "Craft Beer",
  valet: "Valet",
  outdoor_seating: "Outdoor Seating",
  private_dining: "Private Dining",
  wheelchair_accessible: "Wheelchair Access",
};

const AMENITY_EMOJIS = {
  wifi: "📶",
  parking: "🅿️",
  live_music: "🎵",
  craft_beer: "🍺",
  valet: "🚗",
  outdoor_seating: "🌿",
  private_dining: "🔒",
  wheelchair_accessible: "♿",
};

const RestaurantFilters = () => {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters =
    filters.cuisine !== "" ||
    filters.area !== "" ||
    filters.date !== "" ||
    filters.guests !== 2 ||
    filters.ambiance !== "" ||
    filters.amenities.length > 0;

  const handleChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  return (
    <div
      className="rounded-2xl border shadow-sm overflow-hidden"
      style={{ backgroundColor: "#fff", borderColor: "rgba(193,200,199,0.3)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "rgba(193,200,199,0.2)" }}
      >
        <div
          className="flex items-center gap-2 font-semibold"
          style={{ color: "#00191a" }}
        >
          <SlidersHorizontal size={18} style={{ color: "#0d6b6b" }} />
          Filters
          {hasActiveFilters && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#0d6b6b", color: "#fff" }}
            >
              Active
            </span>
          )}
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

      <div className="p-5">
        {/* Basic Filters — 4 columns with AREA included */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Select
            label="Cuisine"
            placeholder="All Cuisines"
            options={cuisineOptions}
            value={filters.cuisine}
            onChange={(e) => handleChange("cuisine", e.target.value)}
          />

          {/* ✅ Area — dropdown with predefined areas */}
          <Select
            label="Area"
            placeholder="All Areas"
            options={areaOptions}
            value={filters.area}
            onChange={(e) => handleChange("area", e.target.value)}
          />

          <Input
            label="Date"
            type="date"
            value={filters.date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => handleChange("date", e.target.value)}
          />

          <Select
            label="Guests"
            options={guestOptions}
            value={String(filters.guests)}
            onChange={(e) => handleChange("guests", Number(e.target.value))}
          />
        </div>

        {/* Advanced Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium transition-colors mb-2"
          style={{ color: "#0d6b6b" }}
        >
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showAdvanced ? "Hide" : "More"} Filters (Ambiance, Amenities)
        </button>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div
                className="pt-4 border-t space-y-5"
                style={{ borderColor: "rgba(193,200,199,0.2)" }}
              >
                {/* Ambiance */}
                <div>
                  <label
                    className="text-sm font-medium block mb-3"
                    style={{ color: "#00191a" }}
                  >
                    Ambiance / Vibe
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AMBIANCE_TYPES.map((a) => {
                      const isSelected = filters.ambiance === a;
                      return (
                        <button
                          key={a}
                          onClick={() =>
                            handleChange("ambiance", isSelected ? "" : a)
                          }
                          className="px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all duration-200 border"
                          style={
                            isSelected
                              ? {
                                  backgroundColor: "#0d6b6b",
                                  color: "#fff",
                                  borderColor: "#0d6b6b",
                                }
                              : {
                                  backgroundColor: "transparent",
                                  color: "#414848",
                                  borderColor: "rgba(193,200,199,0.5)",
                                }
                          }
                        >
                          {a.replace("_", " ")}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label
                    className="text-sm font-medium block mb-3"
                    style={{ color: "#00191a" }}
                  >
                    Amenities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES.map((a) => {
                      const isSelected = filters.amenities.includes(a);
                      return (
                        <button
                          key={a}
                          onClick={() => dispatch(toggleAmenity(a))}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border"
                          style={
                            isSelected
                              ? {
                                  backgroundColor: "#0d6b6b",
                                  color: "#fff",
                                  borderColor: "#0d6b6b",
                                }
                              : {
                                  backgroundColor: "transparent",
                                  color: "#414848",
                                  borderColor: "rgba(193,200,199,0.5)",
                                }
                          }
                        >
                          <span>{AMENITY_EMOJIS[a]}</span>
                          {AMENITY_LABELS[a]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RestaurantFilters;
