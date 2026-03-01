import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import { trimData, http } from "../../../modules/modules";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";

const { Item } = Form;

const Login = () => {
  const cookies = new Cookies();
  const expires = new Date();
  expires.setDate(expires.getDate() + 3);

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

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
    <div className="flex items-center justify-center min-h-[75vh]">
      {contextHolder}

      {/* CARD CHÍNH */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* FORM ĐĂNG NHẬP */}
        <div className="p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng nhập</h1>
          <p className="text-gray-500 mb-8">
            Chào mừng bạn quay trở lại Nova Bank
          </p>

          <Form layout="vertical" onFinish={onFinish}>
            <Item
              name="email"
              label="Tên đăng nhập"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập" },
              ]}
            >
              <Input
                size="large"
                prefix={<UserOutlined />}
                placeholder="Email hoặc tên người dùng"
                className="rounded-lg"
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
                className="rounded-lg"
              />
            </Item>

            <Button
              htmlType="submit"
              size="large"
              block
              className="!bg-blue-600 hover:!bg-blue-700 !text-white !font-semibold !rounded-xl mt-4"
            >
              Đăng nhập
            </Button>
          </Form>

          <p className="text-xs text-gray-400 text-center mt-6">
            © 2025 Nova Digital Banking
          </p>
        </div>

        {/* ẢNH BÊN PHẢI */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 relative">
          <img
            src="/bank-img.jpg"
            alt="Nova Bank"
            className="w-3/4 max-w-sm drop-shadow-2xl rounded-2xl"
          />

          {/* HÌNH TRANG TRÍ */}
          <div className="absolute top-6 left-6 w-14 h-14 bg-white/20 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 bg-white/10 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
