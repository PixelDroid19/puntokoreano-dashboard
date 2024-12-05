import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from "react-router-dom";
import Login from "../pages/auth/Login.component";
import ProtectedRoutes from "../utils/ProtectedRoutes";
import PublicRoutes from "../utils/PublicRoutes";
import Dashboard from "../pages/dashboard/Dashboard.page";
import Products from "../pages/products/Products.page";
import AddProduct from "../pages/products/components/AddProduct.component";
import Images from "../pages/images/Images.page";
import AddImages from "../pages/images/components/AddImages.component";
import Filters from "../pages/filters/filters.page";
import AddFilters from "../pages/filters/components/AddFilters.component";
import Users from "../pages/users/Users.page";
import Orders from "../pages/orders/Orders.page";
import Blog from "../pages/blog/Blog.page";
import Reviews from "../pages/Reviews/Reviews.page";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public routes */}
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Private routes */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/add" element={<AddProduct />} />
        <Route path="/images" element={<Images />} />
        <Route path="/images/add" element={<AddImages />} />
        <Route path="/filters" element={<Filters />} />
        <Route path="/filters/add" element={<AddFilters />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/blogs" element={<Blog />} />
        
        {/* Rutas de usuarios */}
        <Route path="/users" element={<Users />} />
        <Route path="/reviews" element={<Reviews />} /> 
      </Route>

      {/* Redirect */}
      <Route path="*" element={<Navigate to="/login" />} />
    </>
  )
);
export default router;
