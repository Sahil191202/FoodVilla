import { Clock } from "lucide-react";
import { cn } from "../../utils/cn.js";
import { formatTime } from "../../utils/formatters.js";
import Spinner from "../ui/Spinner.jsx";
import EmptyState from "../ui/EmptyState.jsx";

const SlotPicker = ({
  slots,
  selectedSlot,
  onSelect,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (!slots?.length) {
    return (
      <EmptyState
        icon={<Clock size={20} />}
        title="No Slots Available"
        description="No available slots for the selected date. Try another date!"
        className="py-8"
      />
    );
  }

  // Group slots by time period
  const morning = slots.filter((s) => {
    const hour = parseInt(s.time.split(":")[0]);
    return hour < 12;
  });
  const afternoon = slots.filter((s) => {
    const hour = parseInt(s.time.split(":")[0]);
    return hour >= 12 && hour < 17;
  });
  const evening = slots.filter((s) => {
    const hour = parseInt(s.time.split(":")[0]);
    return hour >= 17;
  });

  const SlotGroup = ({ label, slots }) => {
    if (!slots.length) return null;

    return (
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
          {label}
        </p>
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => onSelect(slot.time)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200",
                selectedSlot === slot.time
                  ? "bg-primary-500 text-white border-primary-500 shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:text-primary-600"
              )}
            >
              {formatTime(slot.time)}
              <span className="ml-1.5 text-xs opacity-70">
                ({slot.availableSeats} left)
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <SlotGroup label="Morning" slots={morning} />
      <SlotGroup label="Afternoon" slots={afternoon} />
      <SlotGroup label="Evening" slots={evening} />
    </div>
  );
};

export default SlotPicker;