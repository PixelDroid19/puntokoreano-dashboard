// src/pages/auth/Login.component.tsx
// @ts-nocheck
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
import { useEffect } from "react";

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (values: LoginFormData) => AuthService.login(values),
    onSuccess: ({ data }) => {
      dispatch(
        login({
          ...data.data,
          auth: true,
        })
      );
      navigate("/dashboard", { replace: true });
    },
    onError: () => {
      toast.error(NOTIFICATIONS.EMAIL_PASSWORD_INCORRECT);
    },
  });

  const onFinish = async (values: LoginFormData) => {
    mutation.mutate(values);
  };

  useEffect(() => {
    // Obtener el entorno actual
    const currentEnv = import.meta.env.MODE;
    const apiUrl = import.meta.env.VITE_API_REST_URL;

    // Estilizar el log según el entorno
    const styles = {
      development: "color: #2ecc71; font-weight: bold; font-size: 12px;",
      production: "color: #e74c3c; font-weight: bold; font-size: 12px;",
    };

    // Mostrar el log solo en consola
    console.log(
      `%c🌎 Environment: ${currentEnv.toUpperCase()}\n📡 API URL: ${apiUrl}`,
      styles[currentEnv as keyof typeof styles] ||
        "color: #3498db; font-weight: bold;"
    );
  }, []);

  return (
    <div className="container w-full md:max-w-[500px]">
      <img className="logo" src={Logo} alt="logo" />
      <Form
        name={COMMON_ATTRIBUTES.LOGIN}
        onFinish={onFinish}
        layout={FORM_PROPS.VERTICAL}
        className="form"
      >
        <Form.Item
          name={COMMON_ATTRIBUTES.EMAIL}
          label={LOGIN_TEXT.EMAIL}
          rules={[
            {
              required: true,
              message: LOGIN_TEXT.REQUIRED_EMAIL,
              type: COMMON_ATTRIBUTES.EMAIL,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name={COMMON_ATTRIBUTES.PASSWORD}
          label={LOGIN_TEXT.PASSWORD}
          rules={[{ required: true, message: LOGIN_TEXT.REQUIRED_PASSWORD }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <a className="login-form-forgot" href="">
            {LOGIN_TEXT.FORGOT_PASSWORD}
          </a>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <LoadingOutlined /> : LOGIN_TEXT.LOGIN}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
