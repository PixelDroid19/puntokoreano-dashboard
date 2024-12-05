import { LoadingOutlined } from "@ant-design/icons";
import '/src/components/shared/loading/Loading.styles.css'

const Loading = () => {

    return (
        <div className="container-loading" >
            <LoadingOutlined style={{ fontSize: 100 }} />
        </div>
    )
}
export default Loading;