// src/routes/lazyRoutes.ts
import { lazy } from "react";

export const lazyRoutes = {
  // Auth
  Login: lazy(() => import("../pages/auth/Login.component")),

  // Main pages
  Dashboard: lazy(() => import("../pages/dashboard/Dashboard.page")),

  // Products
  Products: lazy(() => import("../pages/products/Products.page")),
  AddProduct: lazy(
    () => import("../pages/products/components/AddProduct.component")
  ),

  // Images
  Images: lazy(() => import("../pages/images/Images.page")),
  AddImages: lazy(
    () => import("../pages/images/components/AddImages.component")
  ),

 

  // Other pages
  Users: lazy(() => import("../pages/users/Users.page")),
  Orders: lazy(() => import("../pages/orders/Orders.page")),
  Blog: lazy(() => import("../pages/blog/blog-management")),
  Reviews: lazy(() => import("../pages/Reviews/Reviews.page")),
};
