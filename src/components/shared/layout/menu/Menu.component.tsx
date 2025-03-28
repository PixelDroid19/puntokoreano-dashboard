import { Menu } from "antd";
import "/src/components/shared/layout/menu/Menu.styles.css";
import {
  AlignLeftOutlined,
  CarOutlined,
  FileImageOutlined,
  PieChartOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  TagsOutlined,
  UnorderedListOutlined,
  UserOutlined,
  CarryOutOutlined,
} from "@ant-design/icons";
import { SelectEventHandler } from "rc-menu/lib/interface";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { setDrawer, setRoute } from "../../../../redux/reducers/navSlice";

const menuItems = [
  {
    key: "/dashboard",
    label: <Link to={"/dashboard"}>Resumen</Link>,
    icon: <PieChartOutlined />,
    title: "Resumen",
  },
  {
    key: "/products",
    label: <Link to={"/products"}>Productos</Link>,
    icon: <ShopOutlined />,
    title: "Productos",
  },
  {
    key: "/image-manager",
    label: <Link to={"/image-manager"}>Gestor de Imágenes</Link>,
    icon: <FileImageOutlined />,
    title: "Gestor de Imágenes",
},
  {
    key: "/brands",
    label: <Link to={"/brands"}>Marcas</Link>,
    icon: <TagsOutlined />,
    title: "Marcas",
  },
  {
    key: "/categoriesManagement",
    label: <Link to={"/categoriesManagement"}>Gestión de categorías</Link>,
    icon: <UnorderedListOutlined />,
    title: "Gestión de categorías",
  },
  {
    key: "/orders",
    label: <Link to={"/orders"}>Pedidos</Link>,
    icon: <ShoppingCartOutlined />,
    title: "Pedidos",
  },
  {
    key: "/users",
    label: <Link to={"/users"}>Usuarios</Link>,
    icon: <UserOutlined />,
    title: "Usuarios",
  },
  {
    key: "/blogs",
    label: <Link to={"/blogs"}>Blogs</Link>,
    icon: <AlignLeftOutlined />,
    title: "Blogs",
  },
  {
    key: "/reviews",
    label: <Link to={"/reviews"}>Reseñas</Link>,
    icon: <StarOutlined />,
    title: "Reseñas",
  },
  {
    key: "/vehicle-families",
    label: <Link to={"/vehicle-families"}>Familias de Vehículos</Link>,
    icon: <CarryOutOutlined />,
    title: "Familias de Vehículos",
  },
  {
    key: "settings",
    label: "Configuración",
    icon: <SettingOutlined />,
    title: "Configuración",
    children: [
      {
        key: "/shipping-settings",
        label: <Link to="/shipping-settings">Envíos</Link>,
        title: "Configuración de Envíos",
      },
      {
        key: "/settings-billing",
        label: <Link to="/settings-billing">Facturación</Link>,
        title: "Configuración de Facturación",
      },
      {
        key: "/settings-about",
        label: <Link to="/settings-about">Sobre nosotros</Link>,
        title: "Configuración Sobre nosotros",
      },
      {
        key: "/highlighted-services",
        label: <Link to="/highlighted-services">Servicios Destacados</Link>,
        title: "Configuración de Servicios Destacados",
      },
    ],
  },
];

const MenuCollapsed = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const nav = useSelector((state: Record<string, any>) => state.nav);

  const handleSelect: SelectEventHandler = () => {
    dispatch(setRoute({ pathname: location.pathname }));
    dispatch(setDrawer({ open: false }));
  };

  return (
    <Menu
      className="menuCollapsed"
      items={menuItems}
      mode="inline"
      selectedKeys={[nav?.pathname]}
      onSelect={handleSelect}
      theme="light"
    />
  );
};
export default MenuCollapsed;
