// src/pages/filters/components/HeaderTable.component.tsx
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";

const HeaderTable = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">Filtros</h1>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => navigate("/filters/add")}
      >
        Agregar Filtro
      </Button>
    </div>
  );
};

export default HeaderTable;