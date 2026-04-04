import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, BookOpen, Leaf } from "lucide-react";
import { useAdminRestaurants, useAdminAddMenu } from "../../hooks/useAdmin.js";
import { useMenu } from "../../hooks/useMenu.js";
import Button from "../../components/ui/Button.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Select from "../../components/ui/Select.jsx";
import Input from "../../components/ui/Input.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { formatPrice } from "../../utils/formatters.js";
import { useForm, useFieldArray } from "react-hook-form";

const CATEGORIES = [
  "Starters", "Main Course", "Breads",
  "Rice & Biryani", "Desserts", "Drinks", "Sides",
];

// Menu viewer for selected restaurant
const MenuViewer = ({ restaurantId }) => {
  const { data: menu, isLoading } = useMenu(restaurantId);

  if (isLoading)
    return (
      <div className="flex justify-center py-8">
        <Spinner size="md" />
      </div>
    );

  if (!menu || !Object.keys(menu).length)
    return (
      <div className="text-center py-8 text-gray-400">
        <BookOpen size={32} className="mx-auto mb-3 opacity-50" />
        <p className="text-sm">No menu added yet</p>
      </div>
    );

  return (
    <div className="space-y-4">
      {Object.entries(menu).map(([category, items]) => (
        <div key={category}>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            {category} ({items.length})
          </p>
          <div className="space-y-1.5">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-sm border-2 flex items-center justify-center ${
                      item.isVeg ? "border-green-500" : "border-red-500"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.isVeg ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                  </div>
                  <span className="text-sm text-gray-700">{item.name}</span>
                  {!item.isAvailable && (
                    <Badge variant="default" size="sm">
                      Unavailable
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatPrice(item.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const AdminMenusPage = () => {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: restaurants, isLoading } = useAdminRestaurants();
  const { mutate: addMenu, isPending } = useAdminAddMenu();

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      items: [
        {
          name: "",
          description: "",
          price: "",
          category: "Main Course",
          isVeg: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const restaurantOptions = restaurants?.map((r) => ({
    label: r.name,
    value: r._id,
  })) || [];

  const onSubmit = (data) => {
    if (!selectedRestaurantId) return;

    const items = data.items.map((item) => ({
      ...item,
      price: Number(item.price),
      isVeg: item.isVeg === true || item.isVeg === "true",
    }));

    addMenu(
      { restaurantId: selectedRestaurantId, items },
      {
        onSuccess: () => {
          setShowAddModal(false);
          reset();
        },
      }
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menus</h1>
          <p className="text-gray-500 mt-1">Manage restaurant menus</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={18} />}
          onClick={() => setShowAddModal(true)}
          disabled={!selectedRestaurantId}
        >
          Add Menu
        </Button>
      </div>

      {/* Restaurant Selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <Select
          label="Select Restaurant to View/Edit Menu"
          placeholder="Choose a restaurant..."
          options={restaurantOptions}
          value={selectedRestaurantId}
          onChange={(e) => setSelectedRestaurantId(e.target.value)}
        />
      </div>

      {/* Menu Viewer */}
      {selectedRestaurantId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <h2 className="font-semibold text-gray-900 mb-4">
            Current Menu
          </h2>
          <MenuViewer restaurantId={selectedRestaurantId} />
        </motion.div>
      )}

      {/* Add Menu Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Menu Items"
        size="2xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={isPending}
              onClick={handleSubmit(onSubmit)}
            >
              Save Menu
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
                <p className="text-sm font-medium text-gray-700">
                  Item {index + 1}
                </p>
                {fields.length > 1 && (
                  <button
                    onClick={() => remove(index)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Name"
                  placeholder="Margherita Pizza"
                  required
                  {...register(`items.${index}.name`)}
                />
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <div className="flex gap-3 mt-1">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        value="true"
                        {...register(`items.${index}.isVeg`)}
                        defaultChecked
                      />
                      <span className="text-green-600 font-medium">🥦 Veg</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        value="false"
                        {...register(`items.${index}.isVeg`)}
                      />
                      <span className="text-red-600 font-medium">🍗 Non-Veg</span>
                    </label>
                  </div>
                </div>
                <div className="sm:col-span-2">
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
                name: "",
                description: "",
                price: "",
                category: "Main Course",
                isVeg: true,
              })
            }
          >
            Add Another Item
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminMenusPage;