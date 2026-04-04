import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Navbar from "../components/common/Navbar.jsx";
import Footer from "../components/common/Footer.jsx";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
import PublicRoute from "../components/common/PublicRoute.jsx";
import PageLoader from "../components/ui/PageLoader.jsx";
import ErrorBoundary from "../components/common/ErrorBoundary.jsx";

// Lazy load pages — faster initial load!
const HomePage = lazy(() => import("../pages/HomePage.jsx"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage.jsx"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage.jsx"));
const RestaurantsPage = lazy(() => import("../pages/RestaurantsPage.jsx"));
const RestaurantDetailPage = lazy(
  () => import("../pages/RestaurantDetailPage.jsx"),
);
const BookingPage = lazy(() => import("../pages/BookingPage.jsx"));
const MyReservationsPage = lazy(
  () => import("../pages/MyReservationsPage.jsx"),
);
const ChatPage = lazy(() => import("../pages/ChatPage.jsx"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage.jsx"));
import AdminRoute from "../components/common/AdminRoute.jsx";

// Lazy load admin pages
const AdminLayout = lazy(() => import("../pages/admin/AdminLayout.jsx"));
const AdminOverviewPage = lazy(
  () => import("../pages/admin/AdminOverviewPage.jsx"),
);
const AdminRestaurantsPage = lazy(
  () => import("../pages/admin/AdminRestaurantsPage.jsx"),
);
const AdminMenusPage = lazy(() => import("../pages/admin/AdminMenusPage.jsx"));
const AdminReservationsPage = lazy(
  () => import("../pages/admin/AdminReservationsPage.jsx"),
);

// Layout wrapper — Navbar + main content + Footer
const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Protected Routes — wrapped in Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <HomePage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/restaurants"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RestaurantsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/restaurants/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RestaurantDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/restaurants/:id/book"
              element={
                <ProtectedRoute>
                  <Layout>
                    <BookingPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reservations"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyReservationsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ChatPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminOverviewPage />} />
              <Route path="restaurants" element={<AdminRestaurantsPage />} />
              <Route path="menus" element={<AdminMenusPage />} />
              <Route path="reservations" element={<AdminReservationsPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppRoutes;
