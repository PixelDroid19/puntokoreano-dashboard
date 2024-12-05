import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const HeaderTable = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/images/add');
    };

    return (
        <div className="flex justify-between">
            <h2 className="text-3xl font-bold">Imagenes</h2>
            <Button onClick={handleClick} type="primary">Añadir imagenes</Button>
        </div>
    )
};
export default HeaderTable;