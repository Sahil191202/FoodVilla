import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Users, Check, X,
  IndianRupee, Phone, Mail,
  Clock, ShieldCheck, ShieldX,
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
import { formatDate } from "../../utils/formatters.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import BackButton from "../../components/common/BackButton.jsx";

// ✅ Updated OwnerCard with proper approve/reject toggle
const OwnerCard = ({ owner, onApprove, onReject, onCommission }) => {
  const isPending = owner.ownerStatus === "pending_approval";
  const isApproved = owner.ownerStatus === "approved";
  const isRejected = owner.ownerStatus === "rejected";

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
              {owner.businessName || "No business name set"}
            </p>
          </div>
        </div>
        {/* ✅ Status badge based on ownerStatus */}
        <Badge
          variant={
            isApproved ? "success"
            : isRejected ? "danger"
            : "warning"
          }
          dot
          size="sm"
        >
          {isApproved ? "Approved"
           : isRejected ? "Rejected"
           : "Pending"}
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
          Plan:{" "}
          <span className="capitalize font-medium text-gray-700">
            {owner.currentPlan || "none"}
          </span>
        </div>
      </div>

      {/* ✅ Actions — Approve + Reject always visible */}
      <div className="flex gap-2">
        <Button
          variant={isApproved ? "outline" : "primary"}
          size="sm"
          fullWidth
          leftIcon={<ShieldCheck size={14} />}
          onClick={() => onApprove(owner)}
          disabled={isApproved}
          className={isApproved ? "opacity-50 cursor-not-allowed" : ""}
        >
          {isApproved ? "Approved ✅" : "Approve"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          leftIcon={<ShieldX size={14} />}
          onClick={() => onReject(owner)}
          disabled={isRejected}
          className={
            isRejected
              ? "opacity-50 cursor-not-allowed"
              : "text-red-500 border-red-200 hover:bg-red-50"
          }
        >
          {isRejected ? "Rejected ❌" : "Reject"}
        </Button>
      </div>
    </motion.div>
  );
};

const AdminOwnersPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const debouncedSearch = useDebounce(search, 400);

  const { data: owners, isLoading } = useAdminOwners();
  const { mutate: approveOwner, isPending: isApproving } = useApproveOwner();

  const filtered = owners?.filter((o) => {
    const matchSearch =
      !debouncedSearch ||
      o.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      o.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      o.businessName?.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchFilter =
      filter === "all" ||
      (filter === "approved" && o.ownerStatus === "approved") ||
      (filter === "pending" && o.ownerStatus === "pending_approval") ||
      (filter === "rejected" && o.ownerStatus === "rejected");

    return matchSearch && matchFilter;
  });

  const handleApprove = (owner) => {
    approveOwner({ id: owner._id, isApproved: true });
  };

  const handleReject = (owner) => {
    approveOwner({ id: owner._id, isApproved: false });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
      <BackButton to="home" label="Back to App" className="mb-6" />
        <h1 className="text-2xl font-bold text-gray-900">
          Restaurant Owners
        </h1>
        <p className="text-gray-500 mt-1">
          {owners?.length || 0} owners registered •{" "}
          {owners?.filter((o) => o.ownerStatus === "pending_approval").length || 0}{" "}
          pending approval
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
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "approved", "rejected"].map((f) => (
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
              {/* Count badges */}
              {f !== "all" && owners && (
                <span className="ml-1.5 text-xs">
                  ({owners.filter((o) =>
                    f === "pending"
                      ? o.ownerStatus === "pending_approval"
                      : o.ownerStatus === f
                  ).length})
                </span>
              )}
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
              onCommission={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOwnersPage;