import { Flex } from "antd";
import MenuCollapsed from "../menu/Menu.component";
import Sider from "antd/es/layout/Sider";
import Logo from "/src/assets/logo-2.png";

const SiderMenu = () => {

    return (
        <Sider theme='light' style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }} >
            <Flex justify='center'>
                <img src={Logo} width={100} style={{ marginTop: 10 }} />
            </Flex>
            <MenuCollapsed  />
        </Sider>
    )
}

export default SiderMenu;