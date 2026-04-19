import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filters: {
    cuisine: "",
    area: "",
    date: "",
    guests: 2,
    ambiance: "", // ✅ New
    amenities: [], // ✅ New
  },
  selectedRestaurant: null,
};

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    toggleAmenity: (state, action) => {
      const amenity = action.payload;
      const idx = state.filters.amenities.indexOf(amenity);
      if (idx === -1) {
        state.filters.amenities.push(amenity);
      } else {
        state.filters.amenities.splice(idx, 1);
      }
    },
    setSelectedRestaurant: (state, action) => {
      state.selectedRestaurant = action.payload;
    },
    clearSelectedRestaurant: (state) => {
      state.selectedRestaurant = null;
    },
  },
});

export const {
  setFilters,
  resetFilters,
  toggleAmenity,
  setSelectedRestaurant,
  clearSelectedRestaurant,
} = restaurantSlice.actions;

export const selectFilters = (state) => state.restaurant.filters;
export const selectSelectedRestaurant = (state) =>
  state.restaurant.selectedRestaurant;

export default restaurantSlice.reducer;
