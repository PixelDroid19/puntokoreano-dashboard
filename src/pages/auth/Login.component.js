import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/auth/Login.component.tsx
import { Button, Form, Input } from "antd";
import { useMutation } from "@tanstack/react-query";
import { LoadingOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../../redux/reducers/userSlice";
import { NOTIFICATIONS } from "../../enums/contants.notifications";
import { COMMON_ATTRIBUTES } from "../../enums/contants.common";
import { LOGIN_TEXT } from "../../enums/constants.login";
import { FORM_PROPS } from "../../enums/contants.ant";
import AuthService from "../../services/auth.service";
import Logo from "/src/assets/logo-2.png";
import "/src/pages/auth/Login.styles.css";
const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const mutation = useMutation({
        mutationFn: (values) => AuthService.login(values),
        onSuccess: ({ data }) => {
            dispatch(login({
                ...data.data,
                auth: true,
            }));
            navigate("/dashboard", { replace: true });
        },
        onError: () => {
            toast.error(NOTIFICATIONS.EMAIL_PASSWORD_INCORRECT);
        },
    });
    const onFinish = async (values) => {
        mutation.mutate(values);
    };
    return (_jsxs("div", { className: "container w-full md:max-w-[500px]", children: [_jsx("img", { className: "logo", src: Logo, alt: "logo" }), _jsxs(Form, { name: COMMON_ATTRIBUTES.LOGIN, onFinish: onFinish, layout: FORM_PROPS.VERTICAL, className: "form", children: [_jsx(Form.Item, { name: COMMON_ATTRIBUTES.EMAIL, label: LOGIN_TEXT.EMAIL, rules: [
                            {
                                required: true,
                                message: LOGIN_TEXT.REQUIRED_EMAIL,
                                type: COMMON_ATTRIBUTES.EMAIL,
                            },
                        ], children: _jsx(Input, {}) }), _jsx(Form.Item, { name: COMMON_ATTRIBUTES.PASSWORD, label: LOGIN_TEXT.PASSWORD, rules: [{ required: true, message: LOGIN_TEXT.REQUIRED_PASSWORD }], children: _jsx(Input.Password, {}) }), _jsx(Form.Item, { children: _jsx("a", { className: "login-form-forgot", href: "", children: LOGIN_TEXT.FORGOT_PASSWORD }) }), _jsx(Form.Item, { children: _jsx(Button, { type: "primary", htmlType: "submit", className: "login-form-button", disabled: mutation.isPending, children: mutation.isPending ? _jsx(LoadingOutlined, {}) : LOGIN_TEXT.LOGIN }) })] })] }));
};
export default Login;
