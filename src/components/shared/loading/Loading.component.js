import { jsx as _jsx } from "react/jsx-runtime";
import { LoadingOutlined } from "@ant-design/icons";
import '/src/components/shared/loading/Loading.styles.css';
const Loading = () => {
    return (_jsx("div", { className: "container-loading", children: _jsx(LoadingOutlined, { style: { fontSize: 100 } }) }));
};
export default Loading;
