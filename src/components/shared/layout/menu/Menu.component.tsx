import { Menu } from "antd";
import "/src/components/shared/layout/menu/Menu.styles.css";
import {
  AlignLeftOutlined,
  CarOutlined,
  FileImageOutlined,
  PieChartOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  UserOutlined,
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
    key: "/filters",
    label: <Link to={"/filters"}>Filtros</Link>,
    icon: <CarOutlined />,
    title: "FIltros",
  },
  {
    key: "/images",
    label: <Link to={"/images"}>Imagenes</Link>,
    icon: <FileImageOutlined />,
    title: "Marcas",
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
