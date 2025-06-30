import { Flex } from "antd";
import MenuCollapsed from "../menu/Menu.component";
import Sider from "antd/es/layout/Sider";
import Logo from "/src/assets/logo-512x512.png";

const SiderMenu = () => {
  return (
    <Sider
      theme="light"
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <Flex justify="center" className="flex-col items-center">
        <img src={Logo} width={60} style={{ marginTop: 10 }} />
        <p style={{ fontFamily: "Karate", fontSize: 23 }}>Punto Koreano</p>
      </Flex>
      <MenuCollapsed />
    </Sider>
  );
};

export default SiderMenu;
