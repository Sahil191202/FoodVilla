import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  UtensilsCrossed,
  MapPin,
  Edit2,
  Image,
  Trash2,
  X,
  Upload,
  Check,
} from "lucide-react";
import { useForm } from "react-hook-form";
import {
  useMyRestaurants,
  useAddRestaurant,
  useUpdateRestaurant,
  useUploadImages,
  useDeleteImage,
} from "../../hooks/useOwner.js";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { CUISINE_TYPES } from "../../utils/constants.js";
import { formatPrice } from "../../utils/formatters.js";
import { useRef } from "react";
import BackButton from "../../components/common/BackButton.jsx";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

// Add/Edit Restaurant Modal
const RestaurantFormModal = ({ isOpen, onClose, restaurant = null }) => {
  const isEdit = !!restaurant;
  const { mutate: addRestaurant, isPending: isAdding } = useAddRestaurant();
  const { mutate: updateRestaurant, isPending: isUpdating } =
    useUpdateRestaurant(restaurant?._id);

  const isPending = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: restaurant
      ? {
          name: restaurant.name,
          description: restaurant.description,
          cuisine: restaurant.cuisine?.[0],
          street: restaurant.address?.street,
          area: restaurant.address?.area,
          city: restaurant.address?.city,
          pincode: restaurant.address?.pincode,
          phone: restaurant.contact?.phone,
          email: restaurant.contact?.email,
          totalSeats: restaurant.totalSeats,
          averageCostForTwo: restaurant.averageCostForTwo,
          ...DAYS.reduce(
            (acc, day) => ({
              ...acc,
              [`${day}_open`]:
                restaurant.operatingHours?.[day]?.open || "11:00",
              [`${day}_close`]:
                restaurant.operatingHours?.[day]?.close || "23:00",
              [`${day}_closed`]:
                restaurant.operatingHours?.[day]?.isClosed || false,
            }),
            {},
          ),
        }
      : {},
  });

  const onSubmit = (data) => {
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

    if (isEdit) {
      updateRestaurant(payload, { onSuccess: onClose });
    } else {
      addRestaurant(payload, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Restaurant" : "Add New Restaurant"}
      size="2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            isLoading={isPending}
            onClick={handleSubmit(onSubmit)}
          >
            {isEdit ? "Save Changes" : "Add Restaurant"}
          </Button>
        </>
      }
    >
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
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
            {...register("cuisine", { required: "Cuisine required" })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Tell customers about your restaurant..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            {...register("description")}
          />
        </div>

        {/* Address */}
        <p className="text-sm font-semibold text-gray-700 pt-1">Address</p>
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
          <Input label="City" placeholder="Bangalore" {...register("city")} />
          <Input
            label="Pincode"
            placeholder="560034"
            required
            {...register("pincode", { required: true })}
          />
        </div>

        {/* Contact */}
        <p className="text-sm font-semibold text-gray-700 pt-1">Contact</p>
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

        {/* Capacity */}
        <p className="text-sm font-semibold text-gray-700 pt-1">
          Capacity & Pricing
        </p>
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
        <p className="text-sm font-semibold text-gray-700 pt-1">
          Operating Hours
        </p>
        <div className="space-y-2.5">
          {DAYS.map((day) => (
            <div key={day} className="grid grid-cols-4 gap-3 items-center">
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
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded accent-primary-500"
                  {...register(`${day}_closed`)}
                />
                Closed
              </label>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

// ✅ Fixed ImageManagerModal
const ImageManagerModal = ({ isOpen, onClose, restaurant }) => {
  const fileInputRef = useRef(null);
  const [previews, setPreviews] = useState([]);

  // ✅ Pass restaurantId properly
  const { mutate: uploadImages, isPending: isUploading } = useUploadImages(
    restaurant?._id,
  );
  const { mutate: deleteImage, isPending: isDeleting } = useDeleteImage(
    restaurant?._id,
  );

  // Reset previews when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [isOpen]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setPreviews(newPreviews);
  };

  const handleUpload = () => {
    if (!previews.length) return;

    const formData = new FormData();
    previews.forEach((p) => formData.append("images", p.file));

    uploadImages(formData, {
      onSuccess: () => {
        setPreviews([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
    });
  };

  const removePreview = (index) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const currentImageCount = restaurant?.images?.length || 0;
  const maxImages = 5;
  const canUploadMore = currentImageCount < maxImages;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Images — ${restaurant?.name}`}
      size="lg"
    >
      <div className="space-y-5">
        {/* Current Images */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            Current Images ({currentImageCount}/{maxImages})
          </p>

          {currentImageCount === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-400 border-2 border-dashed border-gray-200">
              <span className="text-3xl block mb-2">🖼️</span>
              <p className="text-sm">No images yet</p>
              <p className="text-xs mt-1">Add photos to attract customers!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {restaurant?.images?.map((img, i) => (
                <div
                  key={i}
                  className="relative group rounded-xl overflow-hidden aspect-video bg-gray-100 shadow-sm"
                >
                  <img
                    src={img}
                    alt={`Image ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => deleteImage(img)}
                      disabled={isDeleting}
                      className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {i === 0 && (
                    <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Section */}
        {canUploadMore && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Upload New Images ({maxImages - currentImageCount} slots
              remaining)
            </p>

            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-100 transition-colors">
                <Upload
                  size={22}
                  className="text-gray-400 group-hover:text-primary-500"
                />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Click to select images
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, WebP • Max 5MB each
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Previews */}
            {previews.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">
                  {previews.length} image(s) selected — ready to upload
                </p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {previews.map((p, i) => (
                    <div
                      key={i}
                      className="relative rounded-xl overflow-hidden aspect-video bg-gray-100"
                    >
                      <img
                        src={p.url}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removePreview(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  isLoading={isUploading}
                  leftIcon={<Upload size={16} />}
                  onClick={handleUpload}
                >
                  Upload {previews.length} Image
                  {previews.length > 1 ? "s" : ""}
                </Button>
              </div>
            )}
          </div>
        )}

        {!canUploadMore && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
            <p className="text-sm text-yellow-700">
              Maximum {maxImages} images allowed. Delete an image to upload a
              new one.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Main Page
const OwnerRestaurantsPage = () => {
  const { data: restaurants, isLoading } = useMyRestaurants();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRestaurant, setEditRestaurant] = useState(null);
  const [imageRestaurant, setImageRestaurant] = useState(null);

  return (
    <div>
      {/* Header */}
      <BackButton to="home" label="Back to App" className="mb-6" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Restaurants</h1>
          <p className="text-gray-500 mt-1">
            {restaurants?.length || 0} restaurants
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={18} />}
          onClick={() => setShowAddModal(true)}
        >
          Add Restaurant
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="xl" />
        </div>
      ) : !restaurants?.length ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed size={36} className="text-primary-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Restaurants Yet
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Add your first restaurant to get started!
          </p>
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => setShowAddModal(true)}
          >
            Add Restaurant
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {restaurants.map((r, i) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-44 bg-linear-to-br from-primary-50 to-primary-100">
                {r.images?.length > 0 ? (
                  <img
                    src={r.images[0]}
                    alt={r.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UtensilsCrossed size={40} className="text-primary-200" />
                  </div>
                )}

                {/* Approval Badge */}
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={r.isApproved ? "success" : "warning"}
                    dot
                    size="sm"
                    className="bg-white/90 backdrop-blur-sm shadow-sm"
                  >
                    {r.isApproved ? "Live" : "Pending Approval"}
                  </Badge>
                </div>

                {/* Image count */}
                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  {r.images?.length || 0}/5 photos
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{r.name}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                  <MapPin size={11} />
                  {r.address?.area}, {r.address?.city}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{r.totalSeats} seats</span>
                  <span>{formatPrice(r.averageCostForTwo)} for 2</span>
                  <span className="text-primary-500 font-medium">
                    {r.commissionRate}% commission
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    leftIcon={<Image size={14} />}
                    onClick={() => setImageRestaurant(r)}
                  >
                    Images
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    leftIcon={<Edit2 size={14} />}
                    onClick={() => setEditRestaurant(r)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <RestaurantFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Edit Modal */}
      <RestaurantFormModal
        isOpen={!!editRestaurant}
        onClose={() => setEditRestaurant(null)}
        restaurant={editRestaurant}
      />

      {/* Image Manager */}
      <ImageManagerModal
        isOpen={!!imageRestaurant}
        onClose={() => setImageRestaurant(null)}
        restaurant={imageRestaurant}
      />
    </div>
  );
};

export default OwnerRestaurantsPage;
