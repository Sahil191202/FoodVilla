import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Star, IndianRupee,
  BadgeCheck, Sparkles, ChevronLeft,
  ChevronRight, Clock,
} from "lucide-react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import { formatPrice } from "../../utils/formatters.js";
import { cn } from "../../utils/cn.js";

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    _id, name, description, cuisine,
    address, rating, averageCostForTwo,
    images, isFeatured, isVerified, ambiance,
  } = restaurant;

  const hasMultipleImages = images?.length > 1;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <Card hover padding="none" className="overflow-hidden group">
      {/* Image Gallery */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {images?.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt={`${name} ${currentImageIndex + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </AnimatePresence>

            {/* Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* Image Dots */}
            {hasMultipleImages && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(i);
                    }}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-200",
                      i === currentImageIndex
                        ? "bg-white w-3"
                        : "bg-white/60"
                    )}
                  />
                ))}
              </div>
            )}

            {/* Image count badge */}
            {hasMultipleImages && (
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                {currentImageIndex + 1}/{images.length}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-50 to-primary-100">
            <span className="text-5xl">🍽️</span>
          </div>
        )}

        {/* Cuisine Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {cuisine?.slice(0, 2).map((c) => (
            <Badge
              key={c}
              size="sm"
              className="bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm"
            >
              {c}
            </Badge>
          ))}
        </div>

        {/* Featured / Verified */}
        {isFeatured && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-primary-500 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
            <Sparkles size={11} />
            Featured
          </div>
        )}
        {isVerified && !isFeatured && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-blue-500 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
            <BadgeCheck size={11} />
            Verified
          </div>
        )}

        {/* Rating */}
        {rating > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-semibold text-gray-800">
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
          {name}
        </h3>

        {description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <MapPin size={12} className="text-primary-400" />
            {address?.area}
          </span>
          <span className="flex items-center gap-1">
            <IndianRupee size={12} className="text-primary-400" />
            {formatPrice(averageCostForTwo)} for 2
          </span>
          {ambiance && (
            <span className="capitalize text-gray-400">{ambiance}</span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => navigate(`/restaurants/${_id}`)}
          >
            View Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => navigate(`/restaurants/${_id}/book`)}
          >
            Book Now
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RestaurantCard;