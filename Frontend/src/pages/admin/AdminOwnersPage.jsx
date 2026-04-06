import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Users, Check, X,
  IndianRupee, Building, Phone,
  Mail, Clock,
} from "lucide-react";
import {
  useAdminOwners,
  useApproveOwner,
  useUpdateOwnerCommission,
} from "../../hooks/useAdmin.js";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import { formatDate, formatPrice } from "../../utils/formatters.js";
import { useDebounce } from "../../hooks/useDebounce.js";

const OwnerCard = ({ owner, onApprove, onReject, onCommission }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={owner.name} size="md" />
          <div>
            <p className="font-semibold text-gray-900">{owner.name}</p>
            <p className="text-xs text-gray-400">
              {owner.businessName || "No business name"}
            </p>
          </div>
        </div>
        <Badge
          variant={owner.isApproved ? "success" : "warning"}
          dot size="sm"
        >
          {owner.isApproved ? "Approved" : "Pending"}
        </Badge>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Mail size={13} className="text-gray-400" />
          {owner.email}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Phone size={13} className="text-gray-400" />
          {owner.phone}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={13} className="text-gray-400" />
          Joined {formatDate(owner.createdAt)}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <IndianRupee size={13} className="text-gray-400" />
          Commission: {owner.commissionRate}% •{" "}
          Total paid:{" "}
          {formatPrice(owner.totalCommissionPaid || 0)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {!owner.isApproved ? (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            leftIcon={<Check size={14} />}
            onClick={() => onApprove(owner)}
          >
            Approve
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            fullWidth
            leftIcon={<X size={14} />}
            onClick={() => onReject(owner)}
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
          onClick={() => onCommission(owner)}
        >
          Commission
        </Button>
      </div>
    </motion.div>
  );
};

const AdminOwnersPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [commissionModal, setCommissionModal] = useState(null);
  const [newRate, setNewRate] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: owners, isLoading } = useAdminOwners();
  const { mutate: approveOwner, isPending: isApproving } = useApproveOwner();
  const { mutate: updateCommission, isPending: isUpdating } =
    useUpdateOwnerCommission();

  const filtered = owners?.filter((o) => {
    const matchSearch =
      !debouncedSearch ||
      o.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      o.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      o.businessName?.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchFilter =
      filter === "all" ||
      (filter === "approved" && o.isApproved) ||
      (filter === "pending" && !o.isApproved);

    return matchSearch && matchFilter;
  });

  const handleApprove = (owner) => {
    approveOwner({ id: owner._id, isApproved: true });
  };

  const handleReject = (owner) => {
    approveOwner({ id: owner._id, isApproved: false });
  };

  const handleCommissionUpdate = () => {
    if (!newRate || isNaN(newRate)) return;
    updateCommission(
      { id: commissionModal._id, commissionRate: Number(newRate) },
      { onSuccess: () => setCommissionModal(null) }
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Restaurant Owners
        </h1>
        <p className="text-gray-500 mt-1">
          {owners?.length || 0} owners registered
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, business..."
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

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="xl" />
        </div>
      ) : !filtered?.length ? (
        <div className="text-center py-20 text-gray-400">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p>No owners found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((owner) => (
            <OwnerCard
              key={owner._id}
              owner={owner}
              onApprove={handleApprove}
              onReject={handleReject}
              onCommission={(o) => {
                setCommissionModal(o);
                setNewRate(String(o.commissionRate));
              }}
            />
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
              onClick={handleCommissionUpdate}
            >
              Update Rate
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-900">
              {commissionModal?.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {commissionModal?.businessName || commissionModal?.email}
            </p>
            <p className="text-xs text-primary-600 mt-1 font-medium">
              Current rate: {commissionModal?.commissionRate}%
            </p>
          </div>

          <Input
            label="New Commission Rate (%)"
            type="number"
            min="0"
            max="100"
            placeholder="10"
            value={newRate}
            onChange={(e) => setNewRate(e.target.value)}
            hint="Enter percentage between 0-100"
          />

          {newRate && (
            <div className="bg-primary-50 rounded-xl p-3">
              <p className="text-xs text-primary-700">
                Example: For a booking of ₹1200 avg cost, 2 guests →
                Est. bill ₹1200 → Commission:{" "}
                <strong>
                  {formatPrice((1200 * Number(newRate)) / 100)}
                </strong>
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AdminOwnersPage;