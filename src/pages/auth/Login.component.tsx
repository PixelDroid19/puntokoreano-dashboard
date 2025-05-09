import { useEffect } from "react";
import { Button, Form, Input, Card, Typography, Divider, Checkbox } from "antd";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";

import { loginSuccess } from "../../redux/reducers/userSlice";
import AuthService from "../../services/auth.service";
import { NOTIFICATIONS } from "../../enums/contants.notifications";
import { COMMON_ATTRIBUTES } from "../../enums/contants.common";
import { LOGIN_TEXT } from "../../enums/constants.login";
import { FORM_PROPS } from "../../enums/contants.ant";

import Logo from "/src/assets/logo-2.png";
import "/src/pages/auth/Login.styles.css";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../../api";

const { Title, Text, Link } = Typography;

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
    <div className="flex min-h-screen items-center justify-center  p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-white p-2 shadow-md">
            <img
              src={Logo}
              alt="Logo"
              className="h-16 w-16 object-contain"
            />
          </div>
        </div>

        <Card className="overflow-hidden shadow-lg">
          <div className="p-2">
            <Title level={3} className="text-center mb-1">{LOGIN_TEXT.LOGIN || "Iniciar Sesión"}</Title>
            <Text className="text-center block mb-6 text-gray-500">
              Ingresa tus credenciales para acceder al sistema
            </Text>

            <Form
              name={COMMON_ATTRIBUTES.LOGIN}
              onFinish={onFinish}
              layout={FORM_PROPS.VERTICAL}
              autoComplete="off"
              requiredMark={false}
            >
              <Form.Item
                name={COMMON_ATTRIBUTES.EMAIL}
                label={LOGIN_TEXT.EMAIL}
                rules={[
                  {
                    required: true,
                    message: LOGIN_TEXT.REQUIRED_EMAIL,
                    type: COMMON_ATTRIBUTES.EMAIL
                  }
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="nombre@ejemplo.com"
                  size="large"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                name={COMMON_ATTRIBUTES.PASSWORD}
                label={
                  <div className="flex justify-between w-full">
                    <span>{LOGIN_TEXT.PASSWORD}</span>
                    <Link href="/forgot-password" className="text-[#9b87f5]">
                      {LOGIN_TEXT.FORGOT_PASSWORD}
                    </Link>
                  </div>
                }
                rules={[{ required: true, message: LOGIN_TEXT.REQUIRED_PASSWORD }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="••••••••"
                  size="large"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item name="remember" valuePropName="checked">
                <Checkbox>Recordarme</Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={mutation.isPending}
                  block
                  size="large"
               
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Iniciando sesión..." : LOGIN_TEXT.LOGIN || "Iniciar Sesión"}
                </Button>
              </Form.Item>
            </Form>

       {/*      <Divider plain>
              <Text className="text-gray-400 text-xs">O continúa con</Text>
            </Divider>

            <div className="flex space-x-4 mb-4">
              <Button block icon={<img src="https://cdn.jsdelivr.net/npm/simple-icons@v7/icons/google.svg" alt="Google" className="h-5 w-5 mr-2" />}>
                Google
              </Button>
              <Button block icon={<img src="https://cdn.jsdelivr.net/npm/simple-icons@v7/icons/microsoft.svg" alt="Microsoft" className="h-5 w-5 mr-2" />}>
                Microsoft
              </Button>
            </div> */}

            <div className="text-center mt-4">
              <Text className="text-gray-500">
                ¿No tienes una cuenta? <Link href="/register" className="text-[#9b87f5] font-medium hover:underline">Regístrate</Link>
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;