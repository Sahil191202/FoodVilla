import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  UtensilsCrossed,
  MapPin,
  Star,
  Info,
  ChevronRight,
  Armchair,
  Users,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import { useRestaurant } from "../hooks/useRestaurants.js";
import BookingForm from "../components/reservation/BookingForm.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { cn } from "../utils/cn.js";

// ─── Table Map ────────────────────────────────────────────────
const TABLE_STYLES = {
  indoor: { bg: "rgba(13,107,107,0.08)", border: "#0d6b6b", dot: "#0d6b6b" },
  outdoor: { bg: "rgba(22,163,74,0.08)", border: "#16a34a", dot: "#16a34a" },
  private: { bg: "rgba(121,89,0,0.08)", border: "#795900", dot: "#795900" },
  bar: { bg: "rgba(193,200,199,0.15)", border: "#717878", dot: "#717878" },
};

const TableMap = ({ tables, guests = 2 }) => {
  if (!tables?.length) return null;

  const active = tables.filter((t) => t.isActive);
  const totalSeats = active.reduce((s, t) => s + t.capacity, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mt-8 rounded-2xl border overflow-hidden"
      style={{ borderColor: "rgba(193,200,199,0.3)", backgroundColor: "#fff" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{
          borderColor: "rgba(193,200,199,0.2)",
          backgroundColor: "#faf9f5",
        }}
      >
        <div>
          <h3
            className="font-display font-bold text-lg"
            style={{ color: "#00191a" }}
          >
            Table Layout
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#717878" }}>
            Visual reference — exact table assigned at restaurant
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
          style={{ backgroundColor: "rgba(13,107,107,0.1)", color: "#0d6b6b" }}
        >
          <Users size={12} />
          {totalSeats} seats
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-6 pt-4">
        {Object.entries(TABLE_STYLES).map(([type, s]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm border"
              style={{ backgroundColor: s.bg, borderColor: s.border }}
            />
            <span className="text-xs capitalize" style={{ color: "#717878" }}>
              {type}
            </span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="p-6 grid grid-cols-4 sm:grid-cols-5 gap-3">
        {active.map((table) => {
          const s = TABLE_STYLES[table.type] || TABLE_STYLES.indoor;
          const fits = table.capacity >= guests;

          return (
            <motion.div
              key={table._id}
              whileHover={fits ? { scale: 1.05 } : {}}
              className="relative flex flex-col items-center justify-center gap-1 rounded-xl py-3 border text-center transition-all"
              style={{
                backgroundColor: s.bg,
                borderColor: fits ? s.border : "rgba(193,200,199,0.2)",
                opacity: fits ? 1 : 0.35,
              }}
              title={`Table ${table.tableNumber} · ${table.capacity} seats`}
            >
              <Armchair size={18} style={{ color: s.border }} />
              <p className="text-xs font-bold" style={{ color: "#00191a" }}>
                T{table.tableNumber}
              </p>
              <p className="text-[10px]" style={{ color: "#717878" }}>
                {table.capacity} seats
              </p>
              {!fits && (
                <div
                  className="absolute inset-0 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
                >
                  <span className="text-[10px]" style={{ color: "#c1c8c7" }}>
                    Small
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─── Image Gallery ─────────────────────────────────────────────
const ImageGallery = ({ images, name }) => {
  const [active, setActive] = useState(0);
  const hasMany = images?.length > 1;

  if (!images?.length) {
    return (
      <div
        className="w-full aspect-4/5 flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #00191a, #0d2f2f)" }}
      >
        <UtensilsCrossed size={64} style={{ color: "#c7e9e8", opacity: 0.4 }} />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-4/5 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={active}
          src={images[active]}
          alt={`${name} ${active + 1}`}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,25,26,0.88) 0%, transparent 55%)",
        }}
      />

      {/* Arrows */}
      {hasMany && (
        <>
          <button
            onClick={() =>
              setActive((p) => (p === 0 ? images.length - 1 : p - 1))
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center z-10 transition-all"
            style={{
              backgroundColor: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff",
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() =>
              setActive((p) => (p === images.length - 1 ? 0 : p + 1))
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center z-10 transition-all"
            style={{
              backgroundColor: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff",
            }}
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Thumbnail dots */}
      {hasMany && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                i === active ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50",
              )}
            />
          ))}
        </div>
      )}

      {/* Image counter */}
      {hasMany && (
        <div
          className="absolute top-4 right-4 text-xs font-medium px-2.5 py-1 rounded-full z-10"
          style={{
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(8px)",
            color: "#fff",
          }}
        >
          {active + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────
const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: restaurant, isLoading } = useRestaurant(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div
      className="min-h-screen pb-24"
      style={{ backgroundColor: "#faf9f5", color: "#1b1c1a" }}
    >
      <main className="max-w-5xl mx-auto pt-12 px-6 md:px-8">
        {/* Editorial Header */}
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium mb-8 group transition-colors"
            style={{ color: "#414848" }}
          >
            <ChevronLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back
          </motion.button>

          <h1
            className="font-display text-5xl md:text-6xl font-bold leading-tight mb-4"
            style={{ color: "#00191a", letterSpacing: "-0.02em" }}
          >
            Secure Your Table
          </h1>
          <p
            className="text-lg max-w-xl"
            style={{ color: "#414848", letterSpacing: "0.02em" }}
          >
            Experience the art of curated dining at{" "}
            <span className="font-semibold" style={{ color: "#00191a" }}>
              {restaurant.name}
            </span>
            . Please provide your details to finalize your reservation.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left — Restaurant Summary Card */}
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <div
              className="rounded-2xl overflow-hidden editorial-shadow"
              style={{ backgroundColor: "#ffffff" }}
            >
              {/* ✅ Image Gallery */}
              <div className="relative">
                <ImageGallery
                  images={restaurant.images}
                  name={restaurant.name}
                />

                {/* Info on image */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  {/* Featured / Verified */}
                  {(restaurant.isFeatured || restaurant.isVerified) && (
                    <div className="mb-2">
                      {restaurant.isFeatured ? (
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: "#795900", color: "#fff" }}
                        >
                          <Sparkles size={11} />
                          Featured
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.2)",
                            backdropFilter: "blur(8px)",
                            color: "#fff",
                          }}
                        >
                          <BadgeCheck size={11} />
                          Verified
                        </span>
                      )}
                    </div>
                  )}
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: "#fcc340" }}
                  >
                    Now Booking
                  </p>
                  <h2 className="font-display text-2xl font-bold text-white">
                    {restaurant.name}
                  </h2>
                  <p
                    className="text-sm mt-1 flex items-center gap-1.5"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    <MapPin size={12} />
                    {restaurant.address?.area}, {restaurant.address?.city}
                  </p>
                </div>
              </div>

              {/* Meta Row */}
              <div
                className="px-6 py-5 grid grid-cols-2 gap-4"
                style={{ backgroundColor: "#f4f4f0" }}
              >
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: "#414848" }}
                  >
                    Cuisine
                  </p>
                  <p
                    className="font-display italic font-semibold"
                    style={{ color: "#00191a" }}
                  >
                    {restaurant.cuisine?.join(", ")}
                  </p>
                </div>
                {restaurant.rating > 0 && (
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-1"
                      style={{ color: "#414848" }}
                    >
                      Rating
                    </p>
                    <p
                      className="font-display font-semibold flex items-center gap-1"
                      style={{ color: "#00191a" }}
                    >
                      <Star
                        size={14}
                        className="fill-current"
                        style={{ color: "#795900" }}
                      />
                      {restaurant.rating.toFixed(1)} / 5.0
                    </p>
                  </div>
                )}
              </div>

              {/* Info note */}
              <div className="px-6 py-4 flex items-start gap-3">
                <Info
                  size={16}
                  className="shrink-0 mt-0.5"
                  style={{ color: "#795900" }}
                />
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#414848", letterSpacing: "0.02em" }}
                >
                  Tables are held for 15 minutes. Please contact us for groups
                  larger than 10.
                </p>
              </div>
            </div>

            {/* ✅ Table Map — below the card */}
            {restaurant.tables?.length > 0 && (
              <TableMap tables={restaurant.tables} guests={2} />
            )}
          </motion.aside>

          {/* Right — Booking Form */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="lg:col-span-7"
          >
            <BookingForm restaurant={restaurant} />
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default BookingPage;
