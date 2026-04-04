import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Calendar, Users, MessageSquare } from "lucide-react";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Button from "../ui/Button.jsx";
import SlotPicker from "../restaurant/SlotPicker.jsx";
import { useRestaurantSlots } from "../../hooks/useRestaurants.js";
import { useCreateReservation } from "../../hooks/useReservations.js";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  date: z
    .string()
    .min(1, "Date is required")
    .refine((d) => new Date(d) >= new Date(new Date().setHours(0,0,0,0)),
      "Date cannot be in the past"
    ),
  guests: z.string().min(1, "Guests required"),
  specialRequests: z.string().max(200).optional(),
});

const guestOptions = Array.from({ length: 10 }, (_, i) => ({
  label: `${i + 1} ${i + 1 === 1 ? "Guest" : "Guests"}`,
  value: String(i + 1),
}));

const BookingForm = ({ restaurant }) => {
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slotError, setSlotError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { guests: "2" },
  });

  const date = watch("date");
  const guests = watch("guests");

  // Fetch slots when date and guests are selected
  const { data: slots, isLoading: slotsLoading } = useRestaurantSlots(
    restaurant?._id,
    date,
    Number(guests)
  );

  const { mutate: createReservation, isPending } = useCreateReservation();

  const onSubmit = (data) => {
    if (!selectedSlot) {
      setSlotError("Please select a time slot");
      return;
    }
    setSlotError("");

    createReservation(
      {
        restaurantId: restaurant._id,
        date: data.date,
        time: selectedSlot,
        guests: Number(data.guests),
        specialRequests: data.specialRequests,
      },
      {
        onSuccess: () => navigate("/my-reservations"),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Date and Guests */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          min={new Date().toISOString().split("T")[0]}
          leftIcon={<Calendar size={16} />}
          error={errors.date?.message}
          required
          {...register("date")}
        />
        <Select
          label="Guests"
          options={guestOptions}
          error={errors.guests?.message}
          required
          {...register("guests")}
        />
      </div>

      {/* Slot Picker */}
      {date && guests && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            Select Time Slot <span className="text-red-500">*</span>
          </p>
          <SlotPicker
            slots={slots}
            selectedSlot={selectedSlot}
            onSelect={(slot) => {
              setSelectedSlot(slot);
              setSlotError("");
            }}
            isLoading={slotsLoading}
          />
          {slotError && (
            <p className="text-xs text-red-500 mt-2">{slotError}</p>
          )}
        </div>
      )}

      {/* Special Requests */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">
          Special Requests
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          placeholder="Window seat, birthday celebration, dietary restrictions..."
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all"
          {...register("specialRequests")}
        />
        {errors.specialRequests && (
          <p className="text-xs text-red-500 mt-1">
            {errors.specialRequests.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isPending}
        disabled={!selectedSlot}
      >
        Confirm Booking
      </Button>
    </form>
  );
};

export default BookingForm;