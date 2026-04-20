import { CUISINE_TYPES } from "../../utils/constants.js";
import { Restaurant } from "../../models/Restaurant.model.js";
import { parseNaturalDate } from "../../services/datetime.service.js";
import { trackSearchAppearance, trackAIMention } from "../../services/analytics.service.js";

export const searchRestaurantsTool = {
  type: "function",
  function: {
    name: "searchRestaurants",
    description: "Search restaurants by cuisine, area, ambiance, amenities and date in Mumbai",
    parameters: {
      type: "object",
      properties: {
        cuisine: {
          type: "string",
          enum: CUISINE_TYPES,
          description: "Cuisine type",
        },
        area: {
          type: "string",
          description: "Area in Bangalore",
        },
        date: {
          type: "string",
          description: "Date in YYYY-MM-DD format",
        },
        guests: {
          type: "number",
          description: "Number of guests",
        },
        ambiance: {
          type: "string",
          description: "Vibe — romantic, casual, family, rooftop, fine_dining etc",
        },
        amenities: {
          type: "string",
          description: "Special requirements — craft_beer, live_music, parking, wifi etc",
        },
        tags: {
          type: "string",
          description: "Any special tags — quiet, romantic, group friendly etc",
        },
      },
      required: [],
    },
  },
};

export const executeSearchRestaurants = async (args) => {
  const { cuisine, area, date, guests, ambiance, amenities, tags } = args;

  // Build query
  const query = {
    isActive: true,
    isApproved: true,
    isBanned: false,
  };

  if (cuisine) query.cuisine = { $in: [cuisine] };
  if (area) query["address.area"] = { $regex: area, $options: "i" };
  if (ambiance) query.ambiance = ambiance;
  if (amenities) query.amenities = { $in: [amenities] };
  if (tags) query.tags = { $regex: tags, $options: "i" };

  // ✅ Featured restaurants first! — sorted by isFeatured desc
  const restaurants = await Restaurant.find(query)
    .sort({ isFeatured: -1, isVerified: -1, rating: -1 })
    .select("-managedBy")
    .populate("owner", "name currentPlan");

  if (!restaurants.length) {
    return {
      success: true,
      message: "No restaurants found matching the criteria",
      restaurants: [],
    };
  }

  // ✅ Track analytics
  const restaurantIds = restaurants.map((r) => r._id);
  await trackSearchAppearance(restaurantIds).catch(() => {});
  await Promise.all(
    restaurantIds.map((id) => trackAIMention(id).catch(() => {}))
  );

  return {
    success: true,
    count: restaurants.length,
    restaurants: restaurants.map((r) => ({
      id: r._id,
      name: r.name,
      cuisine: r.cuisine,
      area: r.address.area,
      rating: r.rating,
      averageCostForTwo: r.averageCostForTwo,
      description: r.description,
      ambiance: r.ambiance,
      amenities: r.amenities,
      tags: r.tags,
      isFeatured: r.isFeatured,   // ✅ AI knows this is featured
      isVerified: r.isVerified,   // ✅ AI knows this is verified
    })),
  };
};