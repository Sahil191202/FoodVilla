import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, UtensilsCrossed, MapPin, Star, Info } from "lucide-react";
import { useRestaurant } from "../hooks/useRestaurants.js";
import BookingForm from "../components/reservation/BookingForm.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import Badge from "../components/ui/Badge.jsx";

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
  <div className="min-h-screen pb-24" style={{ backgroundColor: '#faf9f5', color: '#1b1c1a' }}>
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
          style={{ color: '#414848' }}
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </motion.button>

        <h1
          className="font-display text-5xl md:text-6xl font-bold leading-tight mb-4"
          style={{ color: '#00191a', letterSpacing: '-0.02em' }}
        >
          Secure Your Table
        </h1>
        <p className="text-lg max-w-xl" style={{ color: '#414848', letterSpacing: '0.02em' }}>
          Experience the art of curated dining at{' '}
          <span className="font-semibold" style={{ color: '#00191a' }}>{restaurant.name}</span>.
          Please provide your details to finalize your reservation.
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
          <div className="rounded-xl overflow-hidden editorial-shadow" style={{ backgroundColor: '#ffffff' }}>
            {/* Image */}
            <div className="aspect-4/5 relative">
              {restaurant.images?.length > 0 ? (
                <img
                  src={restaurant.images[0]}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #00191a, #0d2f2f)' }}
                >
                  <UtensilsCrossed size={64} style={{ color: '#c7e9e8', opacity: 0.4 }} />
                </div>
              )}
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(0,25,26,0.85) 0%, transparent 55%)' }}
              />
              {/* Info on image */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-1"
                  style={{ color: '#fcc340' }}
                >
                  Now Booking
                </p>
                <h2 className="font-display text-2xl font-bold text-white">{restaurant.name}</h2>
                <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <MapPin size={12} />
                  {restaurant.address?.area}, {restaurant.address?.city}
                </p>
              </div>
            </div>

            {/* Meta Row */}
            <div className="px-6 py-5 grid grid-cols-2 gap-4" style={{ backgroundColor: '#f4f4f0' }}>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#414848' }}>
                  Cuisine
                </p>
                <p className="font-display italic font-semibold" style={{ color: '#00191a' }}>
                  {restaurant.cuisine?.join(', ')}
                </p>
              </div>
              {restaurant.rating > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#414848' }}>
                    Rating
                  </p>
                  <p className="font-display font-semibold flex items-center gap-1" style={{ color: '#00191a' }}>
                    <Star size={14} className="fill-current" style={{ color: '#795900' }} />
                    {restaurant.rating.toFixed(1)} / 5.0
                  </p>
                </div>
              )}
            </div>

            {/* Info note */}
            <div className="px-6 py-4 flex items-start gap-3">
              <Info size={16} className="shrink-0 mt-0.5" style={{ color: '#795900' }} />
              <p className="text-sm leading-relaxed" style={{ color: '#414848', letterSpacing: '0.02em' }}>
                Tables are held for 15 minutes. Please contact us for groups larger than 10.
              </p>
            </div>
          </div>
        </motion.aside>

        {/* Right — Booking Form */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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