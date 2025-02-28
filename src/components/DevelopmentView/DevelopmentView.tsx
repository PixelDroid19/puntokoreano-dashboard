import { useEffect, useRef } from "react";
import lottie from "lottie-web";
import { Result } from "antd";
import animationData from "./lottie.json"; 

const DevelopmentView = () => {
  const container = useRef(null);

  useEffect(() => {
    let animationInstance;
    if (container.current) {
      animationInstance = lottie.loadAnimation({
        container: container.current,
        animationData: animationData,
        renderer: "svg",
        loop: true,
        autoplay: true,
      });
    }
  
    return () => {
      if (animationInstance) {
        animationInstance.destroy();
      }
    };
  }, []);
  

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Result
        status="warning"
        title="Esta vista está en desarrollo"
        subTitle="Estamos trabajando en ello. Vuelve pronto para ver la versión final."
      />
      <div ref={container} style={{ width: "300px", height: "300px" }} />
    </div>
  );
};

export default DevelopmentView;
