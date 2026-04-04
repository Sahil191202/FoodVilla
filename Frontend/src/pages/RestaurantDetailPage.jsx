import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Star, Clock, Phone, Mail,
  IndianRupee, ChevronLeft, UtensilsCrossed,
} from "lucide-react";
import { useRestaurant } from "../hooks/useRestaurants.js";
import { useMenu } from "../hooks/useMenu.js";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import MenuCategory from "../components/menu/MenuCategory.jsx";
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
    name, description, cuisine, address,
    contact, rating, averageCostForTwo, images,
    operatingHours,
  } = restaurant;

  // Get today's hours
  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const todayHours = operatingHours?.[today];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 group transition-colors"
      >
        <ChevronLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to Restaurants
      </motion.button>

      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-72 sm:h-96 rounded-3xl overflow-hidden mb-8 bg-gray-100"
      >
        {images?.length > 0 ? (
          <img
            src={images[0]}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <UtensilsCrossed size={64} className="text-primary-200" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Info overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {cuisine?.map((c) => (
              <Badge
                key={c}
                className="bg-white/20 backdrop-blur-sm text-white border-white/30"
              >
                {c}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">{name}</h1>
          <div className="flex items-center gap-3 text-white/90 text-sm">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {address?.area}, {address?.city}
            </span>
            {rating > 0 && (
              <span className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                {rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Menu */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-5">Menu 🍽️</h2>

          {menuLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : menu && Object.keys(menu).length > 0 ? (
            Object.entries(menu).map(([category, items]) => (
              <MenuCategory key={category} category={category} items={items} />
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-50" />
              <p>Menu not available yet</p>
            </div>
          )}
        </motion.div>

        {/* Right — Info + Book */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Book Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate(`/restaurants/${id}/book`)}
              className="shadow-lg shadow-primary-500/20"
            >
              Book a Table 🎉
            </Button>
          </motion.div>

          {/* Info Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">About</h3>

            {description && (
              <p className="text-sm text-gray-500 leading-relaxed">
                {description}
              </p>
            )}

            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                  <MapPin size={15} className="text-primary-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Address</p>
                  <p className="text-gray-700 font-medium">
                    {address?.street}, {address?.area}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                  <IndianRupee size={15} className="text-primary-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Avg Cost</p>
                  <p className="text-gray-700 font-medium">
                    {formatPrice(averageCostForTwo)} for 2
                  </p>
                </div>
              </div>

              {contact?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Phone size={15} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Phone</p>
                    <p className="text-gray-700 font-medium">
                      {contact.phone}
                    </p>
                  </div>
                </div>
              )}

              {todayHours && !todayHours.isClosed && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Clock size={15} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Today's Hours</p>
                    <p className="text-gray-700 font-medium">
                      {todayHours.open} — {todayHours.close}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RestaurantDetailPage;