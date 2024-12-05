import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Flex } from "antd";
import MenuCollapsed from "../menu/Menu.component";
import Sider from "antd/es/layout/Sider";
import Logo from "/src/assets/logo-2.png";
const SiderMenu = () => {
    return (_jsxs(Sider, { theme: 'light', style: { overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }, children: [_jsx(Flex, { justify: 'center', children: _jsx("img", { src: Logo, width: 100, style: { marginTop: 10 } }) }), _jsx(MenuCollapsed, {})] }));
};
export default SiderMenu;
