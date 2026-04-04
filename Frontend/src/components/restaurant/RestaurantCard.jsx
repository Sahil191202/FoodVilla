import { useNavigate } from "react-router-dom";
import { MapPin, Star, Users, IndianRupee, Clock } from "lucide-react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import { formatPrice } from "../../utils/formatters.js";
import { cn } from "../../utils/cn.js";

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const {
    _id,
    name,
    description,
    cuisine,
    address,
    rating,
    averageCostForTwo,
    images,
    isActive,
  } = restaurant;

  return (
    <Card
      hover
      padding="none"
      className="overflow-hidden group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {images?.length > 0 ? (
          <img
            src={images[0]}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <span className="text-5xl">🍽️</span>
          </div>
        )}

        {/* Cuisine Badges on image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {cuisine?.slice(0, 2).map((c) => (
            <Badge key={c} variant="default" size="sm"
              className="bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm"
            >
              {c}
            </Badge>
          ))}
        </div>

        {/* Rating on image */}
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

        {/* Info Row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <MapPin size={12} className="text-primary-400" />
            {address?.area}
          </span>
          <span className="flex items-center gap-1">
            <IndianRupee size={12} className="text-primary-400" />
            {formatPrice(averageCostForTwo)} for 2
          </span>
        </div>

        {/* Actions */}
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