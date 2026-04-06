import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Button from "../ui/Button.jsx";
import SlotPicker from "../restaurant/SlotPicker.jsx";
import { useRestaurantSlots } from "../../hooks/useRestaurants.js";
import { useCreateReservation } from "../../hooks/useReservations.js";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formatTime } from "../../utils/formatters.js";

const schema = z.object({
  date: z
    .string()
    .min(1, "Date is required")
    .refine(
      (d) => new Date(d) >= new Date(new Date().setHours(0, 0, 0, 0)),
      "Date cannot be in the past",
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
    Number(guests),
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
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Step 1 — Party Details */}
      <div
        className="p-8 rounded-xl space-y-6"
        style={{ backgroundColor: "#f4f4f0" }}
      >
          
          <h3
            className="font-display text-xl font-bold items-center text-center"
            style={{ color: "#1b1c1a" }}
          >
            Party Details
          </h3>
        

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Date */}
          <div className="space-y-2">
            <label
              className="block text-xs font-bold uppercase tracking-widest"
              style={{ color: "#414848" }}
            >
              Selected Date <span style={{ color: "#ba1a1a" }}>*</span>
            </label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="w-full p-3 font-medium transition-all outline-none border-b-2"
              style={{
                backgroundColor: "#e3e2df",
                borderColor: errors.date ? "#ba1a1a" : "#e3e2df",
                color: "#1b1c1a",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#795900")}
              onBlur={(e) =>
                (e.target.style.borderColor = errors.date
                  ? "#ba1a1a"
                  : "#e3e2df")
              }
              {...register("date")}
            />
            {errors.date && (
              <p className="text-xs" style={{ color: "#ba1a1a" }}>
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Guests */}
          <div className="space-y-2">
            <label
              className="block text-xs font-bold uppercase tracking-widest"
              style={{ color: "#414848" }}
            >
              Number of Guests <span style={{ color: "#ba1a1a" }}>*</span>
            </label>
            <select
              className="w-full p-3 font-medium transition-all outline-none border-b-2 appearance-none"
              style={{
                backgroundColor: "#e3e2df",
                borderColor: "#e3e2df",
                color: "#1b1c1a",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#795900")}
              onBlur={(e) => (e.target.style.borderColor = "#e3e2df")}
              {...register("guests")}
            >
              {guestOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.guests && (
              <p className="text-xs" style={{ color: "#ba1a1a" }}>
                {errors.guests.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Step 2 — Preferred Time */}
      {date && guests && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            
            <h3
              className="font-display text-xl font-bold"
              style={{ color: "#1b1c1a" }}
            >
              Preferred Time
            </h3>
          </div>

          {!date || !guests ? (
            // Placeholder when date/guests not yet selected
            <div
              className="text-center py-10 rounded-xl"
              style={{ backgroundColor: "#f4f4f0" }}
            >
              <Clock
                size={24}
                className="mx-auto mb-2"
                style={{ color: "#c1c8c7" }}
              />
              <p
                className="text-sm"
                style={{ color: "#717878", letterSpacing: "0.03em" }}
              >
                Please select a date and number of guests first
              </p>
            </div>
          ) : slotsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : !slots?.length ? (
            <div
              className="text-center py-8 rounded-xl"
              style={{ backgroundColor: "#f4f4f0" }}
            >
              <Clock
                size={24}
                className="mx-auto mb-2"
                style={{ color: "#c1c8c7" }}
              />
              <p className="text-sm" style={{ color: "#414848" }}>
                No slots available for this date. Try another date!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {[
                {
                  label: "Morning Experience",
                  slots: slots.filter((s) => parseInt(s.time) < 12),
                },
                {
                  label: "Lunch Experience",
                  slots: slots.filter((s) => {
                    const h = parseInt(s.time);
                    return h >= 12 && h < 17;
                  }),
                },
                {
                  label: "Dinner Soirée",
                  slots: slots.filter((s) => parseInt(s.time) >= 17),
                },
              ]
                .filter((g) => g.slots.length > 0)
                .map((group) => (
                  <div key={group.label}>
                    <h4
                      className="text-xs font-bold uppercase tracking-widest mb-4"
                      style={{ color: "#414848" }}
                    >
                      {group.label}
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {group.slots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => {
                            setSelectedSlot(slot.time);
                            setSlotError("");
                          }}
                          className="px-6 py-3 rounded-full text-sm font-medium transition-all duration-200"
                          style={
                            selectedSlot === slot.time
                              ? {
                                  backgroundColor: "#0d2f2f",
                                  color: "#ffffff",
                                  border: "1px solid #0d2f2f",
                                  boxShadow: "0 0 0 2px #795900",
                                }
                              : {
                                  backgroundColor: "transparent",
                                  color: "#1b1c1a",
                                  border: "1px solid rgba(193,200,199,0.5)",
                                }
                          }
                        >
                          {formatTime(slot.time)}
                          <span className="ml-1.5 text-xs opacity-60">
                            ({slot.availableSeats})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {slotError && (
            <p className="text-xs" style={{ color: "#ba1a1a" }}>
              {slotError}
            </p>
          )}
        </div>
      )}

      {/* Step 3 — Personal Touches */}
      <div className="space-y-6">
        
          
          <h3
            className="font-display text-xl font-bold items-center text-center"
            style={{ color: "#1b1c1a" }}
          >
            Personal Touches
          </h3>
        

        <div className="space-y-2">
          <label
            className="block text-xs font-bold uppercase tracking-widest"
            style={{ color: "#414848" }}
          >
            Special Requests
            <span
              className="ml-2 normal-case font-normal"
              style={{ color: "#717878" }}
            >
              (optional)
            </span>
          </label>
          <textarea
            placeholder="Allergies, anniversaries, or preferred seating..."
            rows={4}
            className="w-full p-4 font-medium transition-all outline-none border-b-2 rounded-t-xl resize-none"
            style={{
              backgroundColor: "#f4f4f0",
              borderColor: "#e3e2df",
              color: "#1b1c1a",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#795900")}
            onBlur={(e) => (e.target.style.borderColor = "#e3e2df")}
            {...register("specialRequests")}
          />
          {errors.specialRequests && (
            <p className="text-xs" style={{ color: "#ba1a1a" }}>
              {errors.specialRequests.message}
            </p>
          )}
        </div>
      </div>

      {/* Confirm Button */}
      <div className="pt-4">
        <motion.button
          type="submit"
          disabled={isPending || !selectedSlot}
          whileHover={{ scale: isPending || !selectedSlot ? 1 : 1.01 }}
          whileTap={{ scale: isPending || !selectedSlot ? 1 : 0.98 }}
          className="w-full font-bold text-lg py-5 px-8 rounded-full flex items-center justify-center gap-3 group transition-all editorial-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#0d2f2f", color: "#ffffff" }}
        >
          {isPending ? (
            <Spinner size="sm" color="white" />
          ) : (
            <>
              Confirm Booking
              <ChevronRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </>
          )}
        </motion.button>
        <p
          className="text-center text-xs uppercase tracking-widest mt-6"
          style={{ color: "#717878" }}
        >
          No payment required today.
        </p>
      </div>
    </form>
  );
};

export default BookingForm;
