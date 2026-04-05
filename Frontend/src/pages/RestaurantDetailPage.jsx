import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useRestaurant } from "../hooks/useRestaurants.js";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import MenuCategory from "../components/menu/MenuCategory.jsx";
import {
  MapPin,
  Star,
  Clock,
  Phone,
  IndianRupee,
  ChevronLeft,
  UtensilsCrossed,
} from "lucide-react";
import { useMenu } from "../hooks/useMenu.js";
import Spinner from "../components/ui/Spinner.jsx";
import { formatPrice } from "../utils/formatters.js";

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: restaurant, isLoading } = useRestaurant(id);
  const { data: menu, isLoading: menuLoading } = useMenu(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!restaurant) return null;

  const {
    name,
    description,
    cuisine,
    address,
    contact,
    rating,
    averageCostForTwo,
    images,
    operatingHours,
  } = restaurant;

  // Get today's hours
  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const todayHours = operatingHours?.[today];

  return (
    <div
      className="min-h-screen pb-32"
      style={{ backgroundColor: "#faf9f5", color: "#1b1c1a" }}
    >
      {/* ── HERO ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6">
        <section className="relative w-full h-[500px] md:h-[580px] overflow-hidden rounded-none md:rounded-3xl md:mx-auto max-w-7xl md:mt-6 md:px-0">
        {images?.length > 0 ? (
          <img
            src={images[0]}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #00191a, #0d2f2f)" }}
          >
            <UtensilsCrossed
              size={80}
              style={{ color: "#c7e9e8", opacity: 0.3 }}
            />
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,25,26,0.85) 30%, transparent 100%)",
          }}
        />

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors group z-10"
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(12px)",
            color: "#ffffff",
          }}
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back
        </motion.button>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 w-full px-8 md:px-16 pb-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Editor's Choice + Rating */}
              <div className="flex items-center gap-3 mb-4">
                {rating > 0 && (
                  <>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
                      style={{ backgroundColor: "#795900", color: "#ffffff" }}
                    >
                      Editor's Choice
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Star
                        size={14}
                        className="fill-current"
                        style={{ color: "#fcc340" }}
                      />
                      <span className="text-sm font-bold text-white">
                        {rating.toFixed(1)} Reviews
                      </span>
                    </div>
                  </>
                )}
              </div>

              <h1
                className="font-display font-bold text-white mb-2"
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {name}
              </h1>
              <p
                className="text-lg"
                style={{
                  color: "rgba(255,255,255,0.75)",
                  letterSpacing: "0.03em",
                }}
              >
                {cuisine?.join(" • ")} &bull; {address?.area}, {address?.city}
              </p>
            </motion.div>

            {/* Book a Table CTA */}
            <motion.button
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.15,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/restaurants/${id}/book`)}
              className="shrink-0 font-bold text-lg px-10 py-4 rounded-full transition-all shadow-xl"
              style={{ backgroundColor: "#795900", color: "#ffffff" }}
            >
              Book a Table
            </motion.button>
          </div>
        </div>
      </section>
      </div>
      

      {/* ── TABS + CONTENT ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 -mt-0 relative z-10">
        {/* Tab Bar */}
        <div className="pt-10 pb-2 flex items-baseline gap-4">
          <h2
            className="font-display font-bold text-3xl"
            style={{ color: "#00191a", letterSpacing: "-0.01em" }}
          >
            Menu
          </h2>
          <div
            className="flex-grow h-px"
            style={{ backgroundColor: "rgba(193,200,199,0.25)" }}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12">
          {/* Left — Menu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8 space-y-12"
          >
            {menuLoading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : menu && Object.keys(menu).length > 0 ? (
              Object.entries(menu).map(([category, items]) => (
                <div key={category}>
                  {/* Category heading with faint rule */}
                  <div className="flex items-baseline gap-4 mb-8">
                    <h2
                      className="font-display font-bold text-3xl shrink-0"
                      style={{ color: "#00191a" }}
                    >
                      {category}
                    </h2>
                    <div
                      className="flex-grow h-px"
                      style={{ backgroundColor: "rgba(193,200,199,0.25)" }}
                    />
                  </div>

                  <div className="space-y-8">
                    {items.map((item) => (
                      <div key={item._id} className="group">
                        {/* Items with image get a row layout */}
                        <div className="flex gap-6">
                          {item.image && (
                            <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden shadow-sm">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                          )}
                          <div className="flex-grow">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2">
                                <h3
                                  className="font-display font-semibold text-xl"
                                  style={{ color: "#0d2f2f" }}
                                >
                                  {item.name}
                                </h3>
                                {/* Veg/Non-veg dot */}
                                <span
                                  className="w-3 h-3 rounded-full ring-2 ring-white shrink-0"
                                  style={{
                                    backgroundColor: item.isVeg
                                      ? "#16a34a"
                                      : "#dc2626",
                                  }}
                                />
                                {!item.isAvailable && (
                                  <span
                                    className="text-xs px-2 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor: "#e3e2df",
                                      color: "#717878",
                                    }}
                                  >
                                    Unavailable
                                  </span>
                                )}
                              </div>
                              <span
                                className="font-bold text-lg shrink-0 ml-4"
                                style={{ color: "#795900" }}
                              >
                                {formatPrice(item.price)}
                              </span>
                            </div>
                            {item.description && (
                              <p
                                className="text-sm leading-relaxed"
                                style={{
                                  color: "#414848",
                                  letterSpacing: "0.02em",
                                  maxWidth: "36rem",
                                }}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div
                className="text-center py-20 rounded-xl"
                style={{ backgroundColor: "#f4f4f0" }}
              >
                <UtensilsCrossed
                  size={40}
                  className="mx-auto mb-3"
                  style={{ color: "#c1c8c7" }}
                />
                <p style={{ color: "#414848" }}>Menu not available yet</p>
              </div>
            )}
          </motion.div>

          {/* Right — About Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Story / About Card */}
            <div
              className="p-8 rounded-3xl space-y-6"
              style={{
                backgroundColor: "rgba(227,226,223,0.35)",
                border: "1px solid rgba(193,200,199,0.15)",
              }}
            >
              <h2
                className="font-display text-2xl font-bold italic"
                style={{ color: "#00191a" }}
              >
                The Story
              </h2>

              {description && (
                <p
                  className="leading-relaxed italic text-sm"
                  style={{ color: "#414848", letterSpacing: "0.02em" }}
                >
                  {description}
                </p>
              )}

              <div className="space-y-5 pt-2">
                {/* Address */}
                <div className="flex gap-4">
                  <MapPin
                    size={18}
                    className="shrink-0 mt-0.5"
                    style={{ color: "#795900" }}
                  />
                  <div>
                    <h4
                      className="font-bold text-xs uppercase tracking-widest mb-1"
                      style={{ color: "#00191a" }}
                    >
                      Address
                    </h4>
                    <p className="text-sm" style={{ color: "#414848" }}>
                      {address?.street}, {address?.area}
                      <br />
                      {address?.city} — {address?.pincode}
                    </p>
                  </div>
                </div>

                {/* Hours */}
                {todayHours && !todayHours.isClosed && (
                  <div className="flex gap-4">
                    <Clock
                      size={18}
                      className="shrink-0 mt-0.5"
                      style={{ color: "#795900" }}
                    />
                    <div>
                      <h4
                        className="font-bold text-xs uppercase tracking-widest mb-1"
                        style={{ color: "#00191a" }}
                      >
                        Hours Today
                      </h4>
                      <p className="text-sm" style={{ color: "#414848" }}>
                        {todayHours.open} – {todayHours.close}
                      </p>
                    </div>
                  </div>
                )}

                {/* Contact */}
                {contact?.phone && (
                  <div className="flex gap-4">
                    <Phone
                      size={18}
                      className="shrink-0 mt-0.5"
                      style={{ color: "#795900" }}
                    />
                    <div>
                      <h4
                        className="font-bold text-xs uppercase tracking-widest mb-1"
                        style={{ color: "#00191a" }}
                      >
                        Contact
                      </h4>
                      <p className="text-sm" style={{ color: "#414848" }}>
                        {contact.phone}
                      </p>
                      {contact?.email && (
                        <p className="text-sm" style={{ color: "#414848" }}>
                          {contact.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Cost */}
                <div className="flex gap-4">
                  <IndianRupee
                    size={18}
                    className="shrink-0 mt-0.5"
                    style={{ color: "#795900" }}
                  />
                  <div>
                    <h4
                      className="font-bold text-xs uppercase tracking-widest mb-1"
                      style={{ color: "#00191a" }}
                    >
                      Avg Cost
                    </h4>
                    <p className="text-sm" style={{ color: "#414848" }}>
                      {formatPrice(averageCostForTwo)} for two
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Awards / Accolades strip */}
            <div
              className="p-6 rounded-3xl flex items-center justify-around"
              style={{ border: "1px solid rgba(193,200,199,0.2)" }}
            >
              {[
                { icon: <UtensilsCrossed size={28} />, label: "Top Rated" },
                { icon: <Star size={28} />, label: "Editor Pick" },
                { icon: <IndianRupee size={28} />, label: "Best Value" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <span style={{ color: "#795900" }}>{icon}</span>
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: "#414848" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default RestaurantDetailPage;
