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

      if (data?.isLoged && data?.userType === "admin") {
        cookies.set("authToken", data.token, { path: "/", expires });
        navigate("/admin");
      } else if (data?.isLoged && data?.userType === "employee") {
        cookies.set("authToken", data.token, { path: "/", expires });
        navigate("/employee");
      } else if (data?.isLoged && data?.userType === "customer") {
        cookies.set("authToken", data.token, { path: "/", expires });
        navigate("/customer");
      } else {
        message.warning("Sai thông tin đăng nhập!");
      }
    } catch (err) {
      messageApi.error("Đăng nhập thất bại. Vui lòng thử lại!");
    }
  };

  return (
    <div className="min-h-screen flex">
      {context}

      {/* LEFT SIDE - BRANDING */}
      <div className="w-1/2 hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10">
        <h1 className="text-4xl font-extrabold tracking-wide mb-4">
          VLU Digital Bank
        </h1>

        <p className="text-lg italic mb-6 text-center">
          Uy tín – Nhanh chóng – An toàn
        </p>

        <div className="w-24 h-1 bg-white rounded-full mb-6"></div>

        <p className="text-center text-sm opacity-90 max-w-md">
          Nền tảng ngân hàng số hiện đại, hỗ trợ quản lý tài chính, giao dịch
          nhanh chóng và an toàn cho mọi khách hàng.
        </p>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <Card className="w-full max-w-sm shadow-2xl rounded-xl">
          <h2 className="text-2xl font-bold text-center mb-2">
            Đăng nhập hệ thống
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Vui lòng đăng nhập để tiếp tục
          </p>

          <Form layout="vertical" onFinish={onFinish}>
            <Item
              name="email"
              label="Tên đăng nhập"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập tên đăng nhập"
              />
            </Item>

            <Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu"
              />
            </Item>

            <Item>
              <Button
                htmlType="submit"
                block
                className="!bg-blue-600 hover:!bg-blue-700 !text-white !font-semibold !h-10"
              >
                Đăng nhập
              </Button>
            </Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
