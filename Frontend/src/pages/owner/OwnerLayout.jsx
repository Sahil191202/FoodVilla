import { NavLink, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarDays,
  IndianRupee,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Crown,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import Avatar from "../../components/ui/Avatar.jsx";
import { cn } from "../../utils/cn.js";
import { BookOpen } from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Overview",
    href: "/owner",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "My Restaurants",
    href: "/owner/restaurants",
    icon: UtensilsCrossed,
  },
  { label: "Menu", href: "/owner/menu", icon: BookOpen },
  {
    label: "Reservations",
    href: "/owner/reservations",
    icon: CalendarDays,
  },
  { label: "Analytics", href: "/owner/analytics", icon: BarChart3 },
  { label: "Subscription", href: "/owner/subscription", icon: Crown },
];

const OwnerLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-gray-100",
        mobile
          ? "fixed inset-y-0 left-0 z-50 w-72 shadow-2xl"
          : "hidden lg:flex w-64 min-h-screen sticky top-0",
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <UtensilsCrossed size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">GoodFoods</p>
            <p className="text-xs text-gray-400">Owner Panel</p>
          </div>
        </div>
        {mobile && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            onClick={() => mobile && setIsSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary-50 text-primary-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight size={14} className="text-primary-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <Avatar name={user?.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-400">
              {user?.businessName || "Restaurant Owner"}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          <Sidebar mobile />
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <Avatar name={user?.name} size="sm" />
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;
