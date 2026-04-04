import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, UtensilsCrossed, MapPin, Star, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAdminRestaurants, useAddRestaurant } from "../../hooks/useAdmin.js";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { CUISINE_TYPES } from "../../utils/constants.js";
import { formatPrice } from "../../utils/formatters.js";

const DAYS = [
  "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday", "sunday",
];

const AdminRestaurantsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const { data: restaurants, isLoading } = useAdminRestaurants();
  const { mutate: addRestaurant, isPending } = useAddRestaurant();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    // Build operating hours from form
    const operatingHours = {};
    DAYS.forEach((day) => {
      operatingHours[day] = {
        open: data[`${day}_open`] || "11:00",
        close: data[`${day}_close`] || "23:00",
        isClosed: data[`${day}_closed`] || false,
      };
    });

    const payload = {
      name: data.name,
      description: data.description,
      cuisine: [data.cuisine],
      address: {
        street: data.street,
        area: data.area,
        city: data.city || "Bangalore",
        pincode: data.pincode,
      },
      contact: {
        phone: data.phone,
        email: data.email,
      },
      operatingHours,
      totalSeats: Number(data.totalSeats),
      averageCostForTwo: Number(data.averageCostForTwo),
    };

    addRestaurant(payload, {
      onSuccess: () => {
        setShowModal(false);
        reset();
      },
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
          <p className="text-gray-500 mt-1">
            {restaurants?.length || 0} restaurants registered
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={18} />}
          onClick={() => setShowModal(true)}
        >
          Add Restaurant
        </Button>
      </div>

      {/* Restaurants Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="xl" />
        </div>
      ) : !restaurants?.length ? (
        <div className="text-center py-20 text-gray-400">
          <UtensilsCrossed size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No restaurants yet</p>
          <p className="text-sm mt-1">Add your first restaurant!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {restaurants.map((r, i) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="h-36 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                {r.images?.length > 0 ? (
                  <img
                    src={r.images[0]}
                    alt={r.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UtensilsCrossed size={36} className="text-primary-200" />
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{r.name}</h3>
                  {r.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star
                        size={12}
                        className="text-yellow-500 fill-yellow-500"
                      />
                      <span className="text-xs font-medium">
                        {r.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                  <MapPin size={11} />
                  {r.address?.area}, {r.address?.city}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {r.cuisine?.map((c) => (
                    <Badge key={c} variant="primary" size="sm">
                      {c}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span>{r.totalSeats} seats</span>
                  <span>{formatPrice(r.averageCostForTwo)} for 2</span>
                  <Badge
                    variant={r.isActive ? "success" : "danger"}
                    size="sm"
                    dot
                  >
                    {r.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Restaurant Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Restaurant"
        size="2xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={isPending}
              onClick={handleSubmit(onSubmit)}
            >
              Add Restaurant
            </Button>
          </>
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Restaurant Name"
              placeholder="La Pizzeria"
              error={errors.name?.message}
              required
              {...register("name", { required: "Name is required" })}
            />
            <Select
              label="Cuisine"
              options={CUISINE_TYPES.map((c) => ({ label: c, value: c }))}
              placeholder="Select cuisine"
              required
              {...register("cuisine", { required: "Cuisine is required" })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of the restaurant..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              {...register("description")}
            />
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Street"
              placeholder="80 Feet Road"
              required
              {...register("street", { required: true })}
            />
            <Input
              label="Area"
              placeholder="Koramangala"
              required
              {...register("area", { required: true })}
            />
            <Input
              label="City"
              placeholder="Bangalore"
              {...register("city")}
            />
            <Input
              label="Pincode"
              placeholder="560034"
              required
              {...register("pincode", { required: true })}
            />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone"
              placeholder="9876543210"
              required
              {...register("phone", { required: true })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="restaurant@email.com"
              {...register("email")}
            />
          </div>

          {/* Capacity & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Total Seats"
              type="number"
              placeholder="60"
              required
              {...register("totalSeats", { required: true })}
            />
            <Input
              label="Avg Cost for 2 (₹)"
              type="number"
              placeholder="1200"
              required
              {...register("averageCostForTwo", { required: true })}
            />
          </div>

          {/* Operating Hours */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Operating Hours
            </p>
            <div className="space-y-2">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="grid grid-cols-4 gap-3 items-center"
                >
                  <span className="text-sm text-gray-600 capitalize font-medium">
                    {day.slice(0, 3)}
                  </span>
                  <Input
                    type="time"
                    defaultValue="11:00"
                    {...register(`${day}_open`)}
                  />
                  <Input
                    type="time"
                    defaultValue="23:00"
                    {...register(`${day}_close`)}
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-500">
                    <input
                      type="checkbox"
                      className="rounded"
                      {...register(`${day}_closed`)}
                    />
                    Closed
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminRestaurantsPage;