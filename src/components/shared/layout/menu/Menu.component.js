import { jsx as _jsx } from "react/jsx-runtime";
import { Menu } from "antd";
import "/src/components/shared/layout/menu/Menu.styles.css";
import { AlignLeftOutlined, CarOutlined, FileImageOutlined, PieChartOutlined, ShopOutlined, ShoppingCartOutlined, StarOutlined, UserOutlined, } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { setDrawer, setRoute } from "../../../../redux/reducers/navSlice";
const menuItems = [
    {
        key: "/dashboard",
        label: _jsx(Link, { to: "/dashboard", children: "Resumen" }),
        icon: _jsx(PieChartOutlined, {}),
        title: "Resumen",
    },
    {
        key: "/products",
        label: _jsx(Link, { to: "/products", children: "Productos" }),
        icon: _jsx(ShopOutlined, {}),
        title: "Productos",
    },
    {
        key: "/filters",
        label: _jsx(Link, { to: "/filters", children: "Filtros" }),
        icon: _jsx(CarOutlined, {}),
        title: "FIltros",
    },
    {
        key: "/images",
        label: _jsx(Link, { to: "/images", children: "Imagenes" }),
        icon: _jsx(FileImageOutlined, {}),
        title: "Marcas",
    },
    {
        key: "/orders",
        label: _jsx(Link, { to: "/orders", children: "Pedidos" }),
        icon: _jsx(ShoppingCartOutlined, {}),
        title: "Pedidos",
    },
    {
        key: "/users",
        label: _jsx(Link, { to: "/users", children: "Usuarios" }),
        icon: _jsx(UserOutlined, {}),
        title: "Usuarios",
    },
    {
        key: "/blogs",
        label: _jsx(Link, { to: "/blogs", children: "Blogs" }),
        icon: _jsx(AlignLeftOutlined, {}),
        title: "Blogs",
    },
    {
        key: "/reviews",
        label: _jsx(Link, { to: "/reviews", children: "Rese\u00F1as" }),
        icon: _jsx(StarOutlined, {}),
        title: "Reseñas",
    },
];
const MenuCollapsed = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const nav = useSelector((state) => state.nav);
    const handleSelect = () => {
        dispatch(setRoute({ pathname: location.pathname }));
        dispatch(setDrawer({ open: false }));
    };
    return (_jsx(Menu, { className: "menuCollapsed", items: menuItems, mode: "inline", selectedKeys: [nav?.pathname], onSelect: handleSelect, theme: "light" }));
};
export default MenuCollapsed;
