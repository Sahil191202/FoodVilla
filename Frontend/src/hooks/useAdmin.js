import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice.js";
import { adminService } from "../services/admin.service.js";
import { restaurantService } from "../services/restaurant.service.js";
import { menuService } from "../services/menu.service.js";
import toast from "react-hot-toast";

// Check if user is admin
export const useIsAdmin = () => {
  const user = useSelector(selectUser);
  return user?.role === "admin" || user?.role === "staff";
};

// Get all restaurants for admin
export const useAdminRestaurants = () => {
  return useQuery({
    queryKey: ["admin", "restaurants"],
    queryFn: () => restaurantService.getAll(),
    select: (data) => data.data.restaurants,
  });
};

// Get all reservations for admin
export const useAdminReservations = () => {
  return useQuery({
    queryKey: ["admin", "reservations"],
    queryFn: adminService.getAllReservations,
    select: (data) => data.data.reservations,
  });
};

// Add restaurant
export const useAddRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.addRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success("Restaurant added successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to add restaurant");
    },
  });
};

// Add menu
export const useAdminAddMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ restaurantId, items }) =>
      menuService.createMenu(restaurantId, items),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["menu", variables.restaurantId],
      });
      toast.success("Menu created successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create menu");
    },
  });
};

// Update reservation status
export const useUpdateReservationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) =>
      adminService.updateReservationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reservations"] });
      toast.success("Status updated!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update status");
    },
  });
};