import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice.js";
import { ownerService } from "../services/owner.service.js";
import toast from "react-hot-toast";

// Check if user is owner
export const useIsOwner = () => {
  const user = useSelector(selectUser);
  return user?.role === "owner" || user?.role === "admin";
};

// Get my restaurants
export const useMyRestaurants = () => {
  return useQuery({
    queryKey: ["owner", "restaurants"],
    queryFn: ownerService.getMyRestaurants,
    select: (data) => data.data.restaurants,
  });
};

// Add restaurant
export const useAddRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ownerService.addRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner", "restaurants"] });
      toast.success(
        "Restaurant added! Pending admin approval. 🎉"
      );
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to add restaurant");
    },
  });
};

// Update restaurant
export const useUpdateRestaurant = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => ownerService.updateRestaurant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner", "restaurants"] });
      toast.success("Restaurant updated successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update restaurant");
    },
  });
};

// Upload images
export const useUploadImages = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => ownerService.uploadImages(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner", "restaurants"] });
      toast.success("Images uploaded successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to upload images");
    },
  });
};

// Delete image
export const useDeleteImage = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageUrl) => ownerService.deleteImage(id, imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner", "restaurants"] });
      toast.success("Image deleted!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete image");
    },
  });
};

// Get my reservations
export const useOwnerReservations = (filters = {}) => {
  return useQuery({
    queryKey: ["owner", "reservations", filters],
    queryFn: () => ownerService.getMyReservations(filters),
    select: (data) => data.data.reservations,
  });
};

// Complete reservation
export const useCompleteReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ownerService.completeReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner", "reservations"] });
      queryClient.invalidateQueries({ queryKey: ["owner", "commissions"] });
      toast.success("Reservation completed! Commission earned! 💰");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to complete reservation");
    },
  });
};

// Mark no show
export const useMarkNoShow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ownerService.markNoShow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner", "reservations"] });
      toast.success("Marked as no-show");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to mark no-show");
    },
  });
};

// Get commissions
export const useOwnerCommissions = () => {
  return useQuery({
    queryKey: ["owner", "commissions"],
    queryFn: ownerService.getMyCommissions,
    select: (data) => data.data,
  });
};