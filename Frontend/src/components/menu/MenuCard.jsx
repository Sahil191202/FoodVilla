import { Leaf, Drumstick } from "lucide-react";
import { formatPrice } from "../../utils/formatters.js";
import Badge from "../ui/Badge.jsx";
import { cn } from "../../utils/cn.js";

const MenuCard = ({ item }) => {
  const { name, description, price, isVeg, isAvailable } = item;

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 p-4",
        "border border-gray-100 rounded-xl bg-white",
        "hover:shadow-sm transition-shadow duration-200",
        !isAvailable && "opacity-50"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {/* Veg/Non-veg indicator */}
          <div
            className={cn(
              "w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0",
              isVeg ? "border-green-500" : "border-red-500"
            )}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isVeg ? "bg-green-500" : "bg-red-500"
              )}
            />
          </div>
          <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
            {name}
          </h4>
          {!isAvailable && (
            <Badge variant="default" size="sm">Unavailable</Badge>
          )}
        </div>

        {description && (
          <p className="text-xs text-gray-500 line-clamp-2 ml-6">
            {description}
          </p>
        )}
      </div>

      <div className="shrink-0">
        <p className="font-semibold text-gray-900 text-sm">
          {formatPrice(price)}
        </p>
      </div>
    </div>
  );
};

export default MenuCard;