import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  UtensilsCrossed,
  Menu,
  X,
  MessageSquare,
  CalendarDays,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { useDispatch } from "react-redux";
import { toggleChat } from "../../features/chat/chatSlice.js";
import Avatar from "../ui/Avatar.jsx";
import Button from "../ui/Button.jsx";
import { cn } from "../../utils/cn.js";
import { useIsAdmin } from "../../hooks/useAdmin.js";
import { LayoutDashboard } from "lucide-react";

const navLinks = [
  { label: "Restaurants", href: "/restaurants" },
  { label: "My Bookings", href: "/my-reservations" },
];

const Navbar = () => {
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = useIsAdmin();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isActive = (href) => location.pathname === href;

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 glass border-b border-orange-100/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-linear-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md shadow-primary-200">
              <UtensilsCrossed size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900">
              Good<span className="text-primary-500">Foods</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-primary-50 text-primary-600 font-semibold"
                      : "text-gray-600 hover:bg-orange-50 hover:text-primary-600",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* AI Chat Button */}
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<MessageSquare size={16} />}
                  onClick={() => dispatch(toggleChat())}
                  className="hidden md:inline-flex"
                >
                  AI Assistant
                </Button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Avatar name={user?.name} size="sm" />
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "hidden md:block text-gray-400 transition-transform",
                        isProfileOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1 animate-fade-in">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">
                            {user?.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>

                        <Link
                          to="/my-reservations"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <CalendarDays size={16} className="text-gray-400" />
                          My Reservations
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <LayoutDashboard
                              size={16}
                              className="text-gray-400"
                            />
                            Admin Dashboard
                          </Link>
                        )}

                        <button
                          onClick={() => dispatch(toggleChat())}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <MessageSquare size={16} className="text-gray-400" />
                          AI Assistant
                        </button>

                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={16} />
                            {isLoggingOut ? "Logging out..." : "Logout"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/register")}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && isAuthenticated && (
          <div className="md:hidden border-t border-gray-100 py-3 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg mx-1 transition-colors",
                  isActive(link.href)
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-600 hover:bg-gray-100",
                )}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                dispatch(toggleChat());
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg mx-1 transition-colors"
            >
              <MessageSquare size={16} />
              AI Assistant
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
