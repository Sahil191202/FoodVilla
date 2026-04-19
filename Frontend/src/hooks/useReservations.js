import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { reservationService } from "../services/reservation.service.js";
import ErrorState from "../components/ui/ErrorState.jsx";

export const useMyReservations = () => {
  return useQuery({
    queryKey: ["reservations", "my"],
    queryFn: reservationService.getMyReservations,
    select: (data) => data.data.reservations,
  });
};

export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reservationService.create,
    onSuccess: (data) => {
      // Invalidate reservations cache — refetch list!
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast.success(`Table booked! Code: ${data.data.confirmationCode} 🎉`);
    },
    if(error) {
      return (
        <ErrorState
          title="Failed to load reservations"
          description="Could not fetch your bookings. Please try again."
          onRetry={() => refetch()}
        />
      );
    },
  });
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => reservationService.cancel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Reservation cancelled successfully");
    },
    if(error) {
      return (
        <ErrorState
          title="Failed to load reservations"
          description="Could not fetch your bookings. Please try again."
          onRetry={() => refetch()}
        />
      );
    },
  });
};
