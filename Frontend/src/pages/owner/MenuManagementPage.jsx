import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus, Edit2, Trash2, Upload,
  X, Check, Leaf, Drumstick,
  ChevronLeft, Image, ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { useMenu, useAddMenuItems, useToggleItemAvailability, useDeleteMenuItem } from "../../hooks/useMenu.js";
import { useMyRestaurants } from "../../hooks/useOwner.js";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { formatPrice } from "../../utils/formatters.js";
import { cn } from "../../utils/cn.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { menuService } from "../../services/menu.service.js";
import api from "../../services/api.js";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Starters", "Main Course", "Breads",
  "Rice & Biryani", "Desserts", "Drinks", "Sides",
];

// ✅ Hook for menu item image upload
const useUploadMenuItemImage = (restaurantId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, formData }) =>
      api.post(
        `/restaurants/${restaurantId}/menu/items/${itemId}/image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", restaurantId] });
      toast.success("Image uploaded!");
    },
    onError: () => toast.error("Failed to upload image"),
  });
};

// ✅ Hook for update menu item
const useUpdateMenuItemHook = (restaurantId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }) =>
      menuService.updateItem(restaurantId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", restaurantId] });
      toast.success("Item updated!");
    },
    onError: () => toast.error("Failed to update item"),
  });
};

// ✅ Single menu item card
const MenuItemCard = ({ item, restaurantId, onEdit }) => {
  const { mutate: toggleAvailability } =
    useToggleItemAvailability(restaurantId);
  const { mutate: deleteItem, isPending: isDeleting } =
    useDeleteMenuItem(restaurantId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 p-3 rounded-xl border transition-all duration-200",
        item.isAvailable
          ? "border-gray-100 bg-white hover:shadow-sm"
          : "border-gray-100 bg-gray-50 opacity-60"
      )}
    >
      {/* Item Image */}
      <div
        className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onEdit(item, "image")}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image size={20} className="text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {/* Veg indicator */}
          <div className={cn(
            "w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center shrink-0",
            item.isVeg ? "border-green-500" : "border-red-500"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              item.isVeg ? "bg-green-500" : "bg-red-500"
            )} />
          </div>
          <p className="font-medium text-gray-900 text-sm line-clamp-1">
            {item.name}
          </p>
        </div>
        {item.description && (
          <p className="text-xs text-gray-400 line-clamp-1 mb-1">
            {item.description}
          </p>
        )}
        <div className="flex items-center gap-2">
          <Badge variant="default" size="sm">{item.category}</Badge>
          <span className="text-sm font-semibold text-gray-900">
            {formatPrice(item.price)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5 shrink-0">
        <button
          onClick={() => toggleAvailability(item._id)}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            item.isAvailable
              ? "text-green-500 hover:bg-green-50"
              : "text-gray-400 hover:bg-gray-100"
          )}
          title={item.isAvailable ? "Mark unavailable" : "Mark available"}
        >
          {item.isAvailable
            ? <ToggleRight size={18} />
            : <ToggleLeft size={18} />
          }
        </button>
        <button
          onClick={() => onEdit(item, "edit")}
          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
          title="Edit item"
        >
          <Edit2 size={15} />
        </button>
        <button
          onClick={() => deleteItem(item._id)}
          disabled={isDeleting}
          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
          title="Delete item"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  );
};

// ✅ Edit item modal
const EditItemModal = ({ isOpen, onClose, item, restaurantId }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: item
      ? {
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          isVeg: item.isVeg ? "true" : "false",
          spiceLevel: item.spiceLevel,
        }
      : {},
  });

  const { mutate: updateItem, isPending } = useUpdateMenuItemHook(restaurantId);
  const { mutate: uploadImage, isPending: isUploading } =
    useUploadMenuItemImage(restaurantId);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useState(null);

  const onSubmit = (data) => {
    updateItem(
      {
        itemId: item._id,
        data: {
          ...data,
          price: Number(data.price),
          isVeg: data.isVeg === "true",
        },
      },
      { onSuccess: onClose }
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("image", file);

    uploadImage({ itemId: item._id, formData });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Menu Item"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" isLoading={isPending} onClick={handleSubmit(onSubmit)}>
            Save Changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Image Upload */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Item Image
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              {imagePreview || item?.image ? (
                <img
                  src={imagePreview || item?.image}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image size={24} className="text-gray-300" />
                </div>
              )}
            </div>
            <div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Upload size={14} />}
                  isLoading={isUploading}
                  as="span"
                >
                  {item?.image ? "Change Image" : "Upload Image"}
                </Button>
              </label>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG • Max 5MB
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Input
              label="Name"
              {...register("name")}
            />
          </div>
          <Input
            label="Price (₹)"
            type="number"
            {...register("price")}
          />
          <Select
            label="Category"
            options={CATEGORIES.map((c) => ({ label: c, value: c }))}
            {...register("category")}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">
            Description
          </label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            {...register("description")}
          />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" value="true" {...register("isVeg")} />
            <span className="text-sm text-green-600 font-medium">
              🥦 Veg
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" value="false" {...register("isVeg")} />
            <span className="text-sm text-red-600 font-medium">
              🍗 Non-Veg
            </span>
          </label>
        </div>
      </div>
    </Modal>
  );
};

// ✅ Add items modal
const AddItemsModal = ({ isOpen, onClose, restaurantId }) => {
  const { mutate: addItems, isPending } = useAddMenuItems(restaurantId);
  const { control, register, handleSubmit, reset } = useForm({
    defaultValues: {
      items: [{
        name: "", description: "",
        price: "", category: "Main Course",
        isVeg: "true",
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = (data) => {
    const items = data.items.map((item) => ({
      ...item,
      price: Number(item.price),
      isVeg: item.isVeg === "true",
    }));

    addItems(items, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Menu Items"
      size="2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            isLoading={isPending}
            onClick={handleSubmit(onSubmit)}
          >
            Add {fields.length} Item{fields.length > 1 ? "s" : ""}
          </Button>
        </>
      }
    >
      <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
        {fields.map((field, index) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-100 rounded-xl p-4 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">
                Item {index + 1}
              </p>
              {fields.length > 1 && (
                <button
                  onClick={() => remove(index)}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Input
                  label="Item Name"
                  placeholder="Margherita Pizza"
                  required
                  {...register(`items.${index}.name`)}
                />
              </div>
              <Input
                label="Price (₹)"
                type="number"
                placeholder="450"
                required
                {...register(`items.${index}.price`)}
              />
              <Select
                label="Category"
                options={CATEGORIES.map((c) => ({ label: c, value: c }))}
                {...register(`items.${index}.category`)}
              />
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  {...register(`items.${index}.description`)}
                />
              </div>
              <div className="col-span-2 flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="true"
                    defaultChecked
                    {...register(`items.${index}.isVeg`)}
                  />
                  <span className="text-sm text-green-600 font-medium">
                    🥦 Veg
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="false"
                    {...register(`items.${index}.isVeg`)}
                  />
                  <span className="text-sm text-red-600 font-medium">
                    🍗 Non-Veg
                  </span>
                </label>
              </div>
            </div>
          </motion.div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          fullWidth
          leftIcon={<Plus size={14} />}
          onClick={() =>
            append({
              name: "", description: "",
              price: "", category: "Main Course",
              isVeg: "true",
            })
          }
        >
          Add Another Item
        </Button>
      </div>
    </Modal>
  );
};

// ✅ Main Menu Management Page
const MenuManagementPage = () => {
  const navigate = useNavigate();
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editMode, setEditMode] = useState("edit");

  const { data: restaurants } = useMyRestaurants();
  const { data: menu, isLoading: menuLoading } = useMenu(selectedRestaurant);

  const handleEdit = (item, mode) => {
    setEditItem(item);
    setEditMode(mode);
  };

  const restaurantOptions =
    restaurants?.map((r) => ({ label: r.name, value: r._id })) || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Menu Management 🍽️
          </h1>
          <p className="text-gray-500 mt-1">
            Add, edit and manage your menu items
          </p>
        </div>
        {selectedRestaurant && (
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => setShowAddModal(true)}
          >
            Add Items
          </Button>
        )}
      </div>

      {/* Restaurant Selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <Select
          label="Select Restaurant"
          placeholder="Choose a restaurant to manage menu..."
          options={restaurantOptions}
          value={selectedRestaurant}
          onChange={(e) => setSelectedRestaurant(e.target.value)}
        />
      </div>

      {/* Menu Display */}
      {selectedRestaurant && (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRestaurant}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {menuLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="xl" />
              </div>
            ) : !menu || Object.keys(menu).length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <span className="text-5xl block mb-4">🍽️</span>
                <h3 className="font-semibold text-gray-900 mb-2">
                  No Menu Yet
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Add items to your menu to get started
                </p>
                <Button
                  variant="primary"
                  leftIcon={<Plus size={16} />}
                  onClick={() => setShowAddModal(true)}
                >
                  Add First Items
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(menu).map(([category, items]) => (
                  <motion.div
                    key={category}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">
                          {category}
                        </h3>
                        <Badge variant="default" size="sm">
                          {items.length} items
                        </Badge>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-4 space-y-3">
                      {items.map((item) => (
                        <MenuItemCard
                          key={item._id}
                          item={item}
                          restaurantId={selectedRestaurant}
                          onEdit={handleEdit}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Modals */}
      <AddItemsModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        restaurantId={selectedRestaurant}
      />

      {editItem && (
        <EditItemModal
          isOpen={!!editItem}
          onClose={() => setEditItem(null)}
          item={editItem}
          restaurantId={selectedRestaurant}
        />
      )}
    </div>
  );
};

export default MenuManagementPage;