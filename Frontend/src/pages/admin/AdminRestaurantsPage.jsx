import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, UtensilsCrossed, MapPin,
  Check, X, IndianRupee, Star,
} from "lucide-react";
import {
  useAdminRestaurants,
  useApproveRestaurant,
  useUpdateRestaurantCommission,
} from "../../hooks/useAdmin.js";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { formatPrice } from "../../utils/formatters.js";
import { useDebounce } from "../../hooks/useDebounce.js";

const AdminRestaurantsPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [commissionModal, setCommissionModal] = useState(null);
  const [newRate, setNewRate] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: restaurants, isLoading } = useAdminRestaurants();
  const { mutate: approveRestaurant, isPending: isApproving } =
    useApproveRestaurant();
  const { mutate: updateCommission, isPending: isUpdating } =
    useUpdateRestaurantCommission();

  const filtered = restaurants?.filter((r) => {
    const matchSearch =
      !debouncedSearch ||
      r.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      r.address?.area
        ?.toLowerCase()
        .includes(debouncedSearch.toLowerCase()) ||
      r.owner?.name
        ?.toLowerCase()
        .includes(debouncedSearch.toLowerCase());

    const matchFilter =
      filter === "all" ||
      (filter === "approved" && r.isApproved) ||
      (filter === "pending" && !r.isApproved);

    return matchSearch && matchFilter;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          All Restaurants
        </h1>
        <p className="text-gray-500 mt-1">
          {restaurants?.length || 0} restaurants •{" "}
          {restaurants?.filter((r) => r.isApproved).length || 0} live
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name, area, owner..."
            leftIcon={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "approved", "pending"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-primary-500 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="xl" />
        </div>
      ) : !filtered?.length ? (
        <div className="text-center py-20 text-gray-400">
          <UtensilsCrossed
            size={48}
            className="mx-auto mb-4 opacity-30"
          />
          <p>No restaurants found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r, i) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200">
                {r.images?.[0] ? (
                  <img
                    src={r.images[0]}
                    alt={r.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UtensilsCrossed
                      size={36}
                      className="text-gray-300"
                    />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={r.isApproved ? "success" : "warning"}
                    dot size="sm"
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    {r.isApproved ? "Live" : "Pending"}
                  </Badge>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {r.name}
                  </h3>
                  {r.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star
                        size={12}
                        className="text-yellow-500 fill-yellow-500"
                      />
                      <span className="text-xs">
                        {r.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                  <MapPin size={11} />
                  {r.address?.area}
                </p>

                {/* Owner info */}
                <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
                  <p className="text-xs text-gray-500">
                    Owner:{" "}
                    <span className="font-medium text-gray-700">
                      {r.owner?.name}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {r.owner?.email}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{formatPrice(r.averageCostForTwo)} for 2</span>
                  <span className="text-primary-600 font-medium">
                    {r.commissionRate}% commission
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!r.isApproved ? (
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      leftIcon={<Check size={14} />}
                      isLoading={isApproving}
                      onClick={() =>
                        approveRestaurant({ id: r._id, isApproved: true })
                      }
                    >
                      Approve
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      leftIcon={<X size={14} />}
                      onClick={() =>
                        approveRestaurant({
                          id: r._id,
                          isApproved: false,
                        })
                      }
                      className="text-red-500 border-red-200 hover:bg-red-50"
                    >
                      Revoke
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    leftIcon={<IndianRupee size={14} />}
                    onClick={() => {
                      setCommissionModal(r);
                      setNewRate(String(r.commissionRate));
                    }}
                  >
                    Rate
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Commission Modal */}
      <Modal
        isOpen={!!commissionModal}
        onClose={() => setCommissionModal(null)}
        title="Update Commission Rate"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setCommissionModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={isUpdating}
              onClick={() => {
                if (!newRate) return;
                updateCommission(
                  {
                    id: commissionModal._id,
                    commissionRate: Number(newRate),
                  },
                  { onSuccess: () => setCommissionModal(null) }
                );
              }}
            >
              Update
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-sm font-medium text-gray-900">
              {commissionModal?.name}
            </p>
            <p className="text-xs text-gray-500">
              {commissionModal?.address?.area} •{" "}
              {commissionModal?.owner?.name}
            </p>
            <p className="text-xs text-primary-600 font-medium mt-1">
              Current: {commissionModal?.commissionRate}%
            </p>
          </div>

          <Input
            label="New Commission Rate (%)"
            type="number"
            min="0"
            max="100"
            value={newRate}
            onChange={(e) => setNewRate(e.target.value)}
            hint="This overrides owner's default rate for this restaurant"
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminRestaurantsPage;