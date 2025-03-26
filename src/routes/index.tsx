import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from "react-router-dom";

// Page Components
import Login from "../pages/auth/Login.component";
import Dashboard from "../pages/dashboard/Dashboard.page";
import Products from "../pages/products/Products.page";
import AddProduct from "../pages/products/components/AddProduct.component";
import Images from "../pages/images/Images.page";
import AddImages from "../pages/images/components/AddImages.component";
import Filters from "../pages/filters/filters.page";
import AddFilters from "../pages/filters/components/AddFilters.component";
import Users from "../pages/users/Users.page";
import Orders from "../pages/orders/Orders.page";
//import Blog from "../pages/blog/Blog.page";
import Reviews from "../pages/Reviews/Reviews.page";
import ShippingSettings from "../pages/shipping/ShippingSettings.page";

// Route Components
import ProtectedRoutes from "../utils/ProtectedRoutes";
import PublicRoutes from "../utils/PublicRoutes";
import RouteError from "./RouteError";
import BillingSettingsPage from "../pages/settings/BillingSettings";
import AboutSettingsPage from "../pages/settings/AboutSettings";
import CategoriesManagement from "../pages/categoriesManagement/CategoriesManagement";
import DevelopmentView from "../components/DevelopmentView/DevelopmentView";
import HighlightedServicesSettings from "../pages/settings/HighlightedServicesSettings";
import VehicleManagerPages from "../pages/vehicle-manager/vehicle-management-page";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public routes */}
      <Route element={<PublicRoutes />} errorElement={<RouteError />}>
        <Route
          path="/login"
          element={<Login />}
          errorElement={<RouteError />}
        />
      </Route>

      {/* Brands */}
      <Route element={<ProtectedRoutes />} errorElement={<RouteError />}>
        <Route
          path="/brands"
          element={<DevelopmentView />} // element={<BrandManagement />}
          errorElement={<RouteError />}
        />
      </Route>

      {/* Brands */}
      <Route element={<ProtectedRoutes />} errorElement={<RouteError />}>
        <Route
          path="/categoriesManagement"
          element={<CategoriesManagement />}
          errorElement={<RouteError />}
        />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoutes />} errorElement={<RouteError />}>
        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
          errorElement={<RouteError />}
        />

        {/* Products */}
        <Route path="/products">
          <Route index element={<Products />} errorElement={<RouteError />} />
          <Route
            path="add"
            element={<AddProduct />}
            errorElement={<RouteError />}
          />
        </Route>

        {/* Images */}
        <Route path="/image-manager">
          <Route index element={<Images />} errorElement={<RouteError />} />
          <Route
            path="add"
            element={<AddImages />}
            errorElement={<RouteError />}
          />
        </Route>

        {/* Filters */}
        <Route path="/filters">
          <Route index element={<Filters />} errorElement={<RouteError />} />
          <Route
            path="add"
            element={<AddFilters />}
            errorElement={<RouteError />}
          />
        </Route>

        {/* Orders */}
        <Route
          path="/orders"
          element={<Orders />}
          errorElement={<RouteError />}
        />

        {/* Blog */}
        <Route
          path="/blogs"
          element={<DevelopmentView />} //element={<Blog />} 
          errorElement={<RouteError />}
        />

        {/* Users */}
        <Route
          path="/users"
          element={<Users />}
          errorElement={<RouteError />}
        />

        {/* Reviews */}
        <Route
          path="/reviews"
          element={<Reviews />}
          errorElement={<RouteError />}
        />

        {/*shipping settings route */}
        <Route
          path="/shipping-settings"
          element={<ShippingSettings />}
          errorElement={<RouteError />}
        />

        {/* Billing Settings */}
        <Route
          path="/settings-billing"
          element={<BillingSettingsPage />}
          errorElement={<RouteError />}
        />

        <Route
          path="/settings-about"
          element={<AboutSettingsPage />}
          errorElement={<RouteError />}
        />
         <Route
          path="/highlighted-services"
          element={<HighlightedServicesSettings />}
          errorElement={<RouteError />}
        />

        {/* Vehicle Families */}
        <Route
          path="/vehicle-families"
          element={<VehicleManagerPages />}
          errorElement={<RouteError />}
        />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
        errorElement={<RouteError />}
      />
    </>
  )
);

export default router;
