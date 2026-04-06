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
};import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice.js";
import { adminService } from "../services/admin.service.js";
import toast from "react-hot-toast";

// Check if user is admin
export const useIsAdmin = () => {
  const user = useSelector(selectUser);
  return user?.role === "admin";
};

// Dashboard stats
export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminService.getStats,
    select: (data) => data.data,
  });
};

// -------------------------------------------------------
// OWNERS
// -------------------------------------------------------
export const useAdminOwners = () => {
  return useQuery({
    queryKey: ["admin", "owners"],
    queryFn: adminService.getAllOwners,
    select: (data) => data.data.owners,
  });
};

export const useApproveOwner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isApproved, commissionRate }) =>
      adminService.approveOwner(id, { isApproved, commissionRate }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "owners"] });
      toast.success(
        variables.isApproved
          ? "Owner approved successfully! ✅"
          : "Owner rejected"
      );
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update owner");
    },
  });
};

export const useUpdateOwnerCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, commissionRate }) =>
      adminService.updateOwnerCommission(id, commissionRate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "owners"] });
      toast.success("Commission rate updated!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update commission");
    },
  });
};

// -------------------------------------------------------
// RESTAURANTS
// -------------------------------------------------------
export const useAdminRestaurants = () => {
  return useQuery({
    queryKey: ["admin", "restaurants"],
    queryFn: adminService.getAllRestaurants,
    select: (data) => data.data.restaurants,
  });
};

export const useApproveRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isApproved }) =>
      adminService.approveRestaurant(id, isApproved),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "restaurants"],
      });
      toast.success(
        variables.isApproved
          ? "Restaurant approved! Now live 🎉"
          : "Restaurant rejected"
      );
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update restaurant");
    },
  });
};

export const useUpdateRestaurantCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, commissionRate }) =>
      adminService.updateRestaurantCommission(id, commissionRate),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "restaurants"],
      });
      toast.success("Restaurant commission updated!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update commission");
    },
  });
};

// -------------------------------------------------------
// RESERVATIONS
// -------------------------------------------------------
export const useAdminReservations = () => {
  return useQuery({
    queryKey: ["admin", "reservations"],
    queryFn: adminService.getAllReservations,
    select: (data) => data.data.reservations,
  });
};

export const useUpdateReservationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) =>
      adminService.updateReservationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "reservations"],
      });
      toast.success("Status updated!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update status");
    },
  });
};

// -------------------------------------------------------
// COMMISSIONS
// -------------------------------------------------------
export const useAdminCommissions = () => {
  return useQuery({
    queryKey: ["admin", "commissions"],
    queryFn: adminService.getCommissions,
    select: (data) => data.data,
  });
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