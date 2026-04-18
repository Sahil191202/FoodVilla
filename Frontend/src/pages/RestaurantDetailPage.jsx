import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRestaurant } from "../hooks/useRestaurants.js";
import { useMenu } from "../hooks/useMenu.js";
import Button from "../components/ui/Button.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { formatPrice } from "../utils/formatters.js";
import {
  MapPin, Star, Clock, Phone,
  IndianRupee, ChevronLeft, UtensilsCrossed,
  ChevronRight, Sparkles, BadgeCheck,
} from "lucide-react";
import { cn } from "../utils/cn.js";

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);

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
    name, description, cuisine, address,
    contact, rating, averageCostForTwo,
    images, operatingHours, isFeatured, isVerified,
    ambiance, amenities,
  } = restaurant;

  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const todayHours = operatingHours?.[today];
  const hasMultipleImages = images?.length > 1;

  return (
    <div
      className="min-h-screen pb-32"
      style={{ backgroundColor: "#faf9f5", color: "#1b1c1a" }}
    >
      {/* ── HERO with Image Gallery ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6">
        <section className="relative w-full h-125 md:h-145 overflow-hidden rounded-none md:rounded-3xl md:mt-6">

          {/* ✅ Image Gallery */}
          {images?.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={images[activeImg]}
                  alt={`${name} ${activeImg + 1}`}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={() =>
                      setActiveImg((p) =>
                        p === 0 ? images.length - 1 : p - 1
                      )
                    }
                    className="absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all z-10"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(12px)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImg((p) =>
                        p === images.length - 1 ? 0 : p + 1
                      )
                    }
                    className="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all z-10"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(12px)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* ✅ Thumbnail Strip */}
              {hasMultipleImages && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={cn(
                        "w-14 h-10 rounded-lg overflow-hidden border-2 transition-all duration-200",
                        i === activeImg
                          ? "border-white scale-110 shadow-lg"
                          : "border-white/40 opacity-60 hover:opacity-90"
                      )}
                    >
                      <img
                        src={img}
                        alt={`thumb ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Image counter */}
              {hasMultipleImages && (
                <div
                  className="absolute top-6 right-6 text-xs font-medium px-3 py-1.5 rounded-full z-10"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.4)",
                    backdropFilter: "blur(8px)",
                    color: "#fff",
                  }}
                >
                  {activeImg + 1} / {images.length}
                </div>
              )}
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #00191a, #0d2f2f)",
              }}
            >
              <UtensilsCrossed
                size={80}
                style={{ color: "#c7e9e8", opacity: 0.3 }}
              />
            </div>
          )}

          {/* Gradient Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,25,26,0.88) 30%, transparent 100%)",
            }}
          />

          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full z-10 group"
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <ChevronLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back
          </motion.button>

          {/* Featured / Verified Badge */}
          {(isFeatured || isVerified) && (
            <div className="absolute top-6 right-6 z-10">
              {isFeatured ? (
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: "#795900", color: "#fff" }}
                >
                  <Sparkles size={12} />
                  Featured
                </span>
              ) : (
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(8px)",
                    color: "#fff",
                  }}
                >
                  <BadgeCheck size={12} />
                  Verified
                </span>
              )}
            </div>
          )}

          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 w-full px-8 md:px-12 pb-8 pointer-events-none">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Rating */}
                <div className="flex items-center gap-3 mb-3">
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
                          {rating.toFixed(1)}
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
                  {cuisine?.join(" • ")} &bull; {address?.area},{" "}
                  {address?.city}
                </p>
              </motion.div>

              {/* Book CTA */}
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
                className="pointer-events-auto shrink-0 font-bold text-lg px-10 py-4 rounded-full shadow-xl"
                style={{ backgroundColor: "#795900", color: "#ffffff" }}
              >
                Book a Table
              </motion.button>
            </div>
          </div>
        </section>
      </div>

      {/* ── CONTENT ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 mt-0 relative z-10">
        {/* Menu Header */}
        <div className="pt-10 pb-2 flex items-baseline gap-4">
          <h2
            className="font-display font-bold text-3xl"
            style={{ color: "#00191a", letterSpacing: "-0.01em" }}
          >
            Menu
          </h2>
          <div
            className="grow h-px"
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
                  <div className="flex items-baseline gap-4 mb-8">
                    <h2
                      className="font-display font-bold text-3xl shrink-0"
                      style={{ color: "#00191a" }}
                    >
                      {category}
                    </h2>
                    <div
                      className="grow h-px"
                      style={{ backgroundColor: "rgba(193,200,199,0.25)" }}
                    />
                  </div>

                  <div className="space-y-8">
                    {items.map((item) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="group"
                      >
                        <div className="flex gap-6">
                          {/* ✅ Item Image */}
                          {item.image && (
                            <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden shadow-sm">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                          )}

                          <div className="grow">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2.5">
                                {/* Veg/Non-veg indicator */}
                                <div
                                  className="w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center shrink-0"
                                  style={{
                                    borderColor: item.isVeg
                                      ? "#16a34a"
                                      : "#dc2626",
                                  }}
                                >
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                      backgroundColor: item.isVeg
                                        ? "#16a34a"
                                        : "#dc2626",
                                    }}
                                  />
                                </div>

                                <h3
                                  className="font-display font-semibold text-xl"
                                  style={{ color: "#0d2f2f" }}
                                >
                                  {item.name}
                                </h3>

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

                                {item.tags?.includes("bestseller") && (
                                  <span
                                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={{
                                      backgroundColor: "#fcc34020",
                                      color: "#795900",
                                      border: "1px solid #fcc34040",
                                    }}
                                  >
                                    Bestseller
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
                                className="text-sm leading-relaxed mt-1"
                                style={{
                                  color: "#414848",
                                  letterSpacing: "0.02em",
                                  maxWidth: "36rem",
                                }}
                              >
                                {item.description}
                              </p>
                            )}

                            {/* Spice level */}
                            {item.spiceLevel &&
                              item.spiceLevel !== "medium" && (
                                <div className="flex items-center gap-1 mt-2">
                                  {item.spiceLevel === "hot" && (
                                    <span className="text-xs text-red-500">
                                      🌶️ Hot
                                    </span>
                                  )}
                                  {item.spiceLevel === "extra_hot" && (
                                    <span className="text-xs text-red-600">
                                      🌶️🌶️ Extra Hot
                                    </span>
                                  )}
                                  {item.spiceLevel === "mild" && (
                                    <span className="text-xs text-green-600">
                                      🌿 Mild
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Divider */}
                        <div
                          className="mt-6 h-px"
                          style={{
                            backgroundColor: "rgba(193,200,199,0.2)",
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div
                className="text-center py-20 rounded-2xl"
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

          {/* Right — About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Story Card */}
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

                {/* Today's Hours */}
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

                {/* Amenities */}
                {amenities?.length > 0 && (
                  <div className="pt-2">
                    <h4
                      className="font-bold text-xs uppercase tracking-widest mb-2"
                      style={{ color: "#00191a" }}
                    >
                      Amenities
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((a) => (
                        <span
                          key={a}
                          className="text-xs px-2.5 py-1 rounded-full capitalize"
                          style={{
                            backgroundColor: "rgba(121,89,0,0.08)",
                            color: "#795900",
                            border: "1px solid rgba(121,89,0,0.15)",
                          }}
                        >
                          {a.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Accolades */}
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