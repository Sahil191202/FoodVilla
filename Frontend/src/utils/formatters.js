import { format, parseISO } from "date-fns";

export const formatDate = (dateString) => {
  return format(parseISO(dateString), "dd MMM yyyy");
};

export const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatRelativeDate = (dateString) => {
  const date = parseISO(dateString);
  return format(date, "EEEE, dd MMMM yyyy"); // "Saturday, 28 December 2024"
};