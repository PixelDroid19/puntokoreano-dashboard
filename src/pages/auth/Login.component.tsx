// src/pages/auth/Login.component.tsx

import { useEffect } from "react";
import { Button, Form, Input } from "antd";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { loginSuccess } from "../../redux/reducers/userSlice";
import AuthService from "../../services/auth.service";
import { NOTIFICATIONS } from "../../enums/contants.notifications";
import { COMMON_ATTRIBUTES } from "../../enums/contants.common";
import { LOGIN_TEXT } from "../../enums/constants.login";
import { FORM_PROPS } from "../../enums/contants.ant";

import Logo from "/src/assets/logo-2.png";
import "/src/pages/auth/Login.styles.css";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../../api";

// Definir interfaces para los datos esperados
interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface LoginApiResponseData {
  user: UserData;
  token: string;
  expiresAt: number;
  refreshToken: string;
  refreshTokenExpiresAt: number | string;
}

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (values: LoginFormData) => AuthService.login(values),
    onSuccess: (response) => {
      const responseData = response?.data?.data as
        | LoginApiResponseData
        | undefined;

      if (
        responseData?.token &&
        responseData?.refreshToken &&
        responseData?.user
      ) {
        // 1. Guardar tokens en localStorage
        localStorage.setItem(ACCESS_TOKEN_KEY, responseData.token);
        localStorage.setItem(REFRESH_TOKEN_KEY, responseData.refreshToken);
        if (responseData.refreshTokenExpiresAt) {
          localStorage.setItem(
            "refreshTokenExpiresAt",
            responseData.refreshTokenExpiresAt.toString()
          );
        }

        // 2. Despachar a Redux usando loginSuccess
        dispatch(
          loginSuccess({
            user: responseData.user,
            token: responseData.token,
            expiresAt: responseData.expiresAt,
            auth: true,
          })
        );

        toast.success(NOTIFICATIONS.LOGIN_SUCCESS);
        navigate("/dashboard", { replace: true });
      } else {
        console.error(
          "Login success response missing expected data:",
          responseData
        );
        toast.error(NOTIFICATIONS.LOGIN_ERROR_UNEXPECTED);
      }
    },
    onError: (error: any) => {
      let message = NOTIFICATIONS.LOGIN_ERROR_GENERIC;
      const errorCode = error?.response?.data?.code;
      const errorMessageFromServer = error?.response?.data?.message;

      // Usar códigos de error del backend
      if (errorCode === "INVALID_CREDENTIALS")
        message = NOTIFICATIONS.EMAIL_PASSWORD_INCORRECT;
      else if (errorCode === "ACCOUNT_LOCKED")
        message = errorMessageFromServer || NOTIFICATIONS.ACCOUNT_LOCKED;
      else if (errorCode === "ACCOUNT_DISABLED")
        message = NOTIFICATIONS.ACCOUNT_DISABLED;
      else if (errorCode === "USER_NOT_FOUND")
        message = NOTIFICATIONS.EMAIL_PASSWORD_INCORRECT;
      else if (errorMessageFromServer) message = errorMessageFromServer;

      toast.error(message);
    },
  });

  const onFinish = (values: LoginFormData) => {
    // Enviar email y password en texto plano
    mutation.mutate(values);
  };

  useEffect(() => {
    // Log de entorno (sin cambios)
    const currentEnv = import.meta.env.MODE;
    const apiUrl = import.meta.env.VITE_API_REST_URL;
    const styles = {
      development: "color: #2ecc71;...",
      production: "color: #e74c3c;...",
    };
    console.log(
      `%c🌎 Env: ${currentEnv.toUpperCase()}\n📡 API: ${apiUrl}`,
      styles[currentEnv] || styles.development
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
        autoComplete="off"
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
          <Input placeholder="email@example.com" autoComplete="username" />
        </Form.Item>

        <Form.Item
          name={COMMON_ATTRIBUTES.PASSWORD}
          label={LOGIN_TEXT.PASSWORD}
          rules={[{ required: true, message: LOGIN_TEXT.REQUIRED_PASSWORD }]}
        >
          <Input.Password
            placeholder="********"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item>
          <a className="login-form-forgot" href="/forgot-password">
            {LOGIN_TEXT.FORGOT_PASSWORD}
          </a>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
            disabled={mutation.isPending}
            loading={mutation.isPending}
          >
            {LOGIN_TEXT.LOGIN}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
