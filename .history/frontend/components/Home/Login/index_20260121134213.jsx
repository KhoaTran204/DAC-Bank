import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message } from "antd";
import { trimData, http } from "../../../modules/modules";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";

const { Item } = Form;

const Login = () => {
  const cookies = new Cookies();
  const expires = new Date();
  expires.setDate(expires.getDate() + 3);

  const navigate = useNavigate();
  const [messageApi, context] = message.useMessage();

  const onFinish = async (values) => {
    try {
      const finalObj = trimData(values);
      const httpReq = http();
      const { data } = await httpReq.post("/api/login", finalObj);

      if (data?.isLoged) {
        cookies.set("authToken", data.token, {
          path: "/",
          expires,
        });

        if (data.userType === "admin") navigate("/admin");
        if (data.userType === "employee") navigate("/employee");
        if (data.userType === "customer") navigate("/customer");
      } else {
        message.warning("Sai thông tin đăng nhập");
      }
    } catch (err) {
      messageApi.error("Đăng nhập thất bại");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {context}

      <Card className="w-full max-w-md rounded-2xl shadow-xl px-2">
        {/* BRANDING */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-wide text-blue-600">
            VLU Bank
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ngân hàng số • An toàn • Nhanh chóng
          </p>
        </div>

        {/* FORM */}
        <Form layout="vertical" onFinish={onFinish}>
          <Item
            name="email"
            label="Tên đăng nhập"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="Nhập email hoặc username"
            />
          </Item>

          <Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
            />
          </Item>

          <Button
            htmlType="submit"
            block
            size="large"
            className="!bg-blue-600 hover:!bg-blue-700 !text-white !font-semibold !rounded-lg mt-2"
          >
            Đăng nhập
          </Button>
        </Form>

        {/* FOOTER */}
        <div className="text-center text-xs text-gray-400 mt-6">
          © 2025 VLU Digital Banking
        </div>
      </Card>
    </div>
  );
};

export default Login;
