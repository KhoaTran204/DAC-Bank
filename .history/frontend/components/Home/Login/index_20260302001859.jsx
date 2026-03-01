import {
  LockOutlined,
  UserOutlined,
  CameraOutlined,
  ScanOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, message, Divider } from "antd";
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

  /* =========================
     ĐĂNG NHẬP BẰNG MẬT KHẨU
  ========================= */
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

  /* =========================
     XÁC THỰC BẰNG KHUÔN MẶT
     (CHUẨN BỊ SẴN – CHƯA CODE AI)
  ========================= */
  const handleFaceLogin = () => {
    messageApi.info("Chức năng xác thực bằng khuôn mặt đang được phát triển");

    // 👉 Sau này bạn code:
    // 1. Mở camera
    // 2. Chụp ảnh khuôn mặt
    // 3. Gửi ảnh lên backend / AI
    // 4. Backend trả về token + userType
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
      {contextHolder}

      {/* CARD CHÍNH */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* FORM ĐĂNG NHẬP */}
        <div className="px-14 py-16 flex flex-col justify-center">
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

          {/* PHÂN CÁCH */}
          <Divider className="!my-6">Hoặc</Divider>

          {/* ĐĂNG NHẬP BẰNG KHUÔN MẶT */}
          <Button
            size="large"
            block
            icon={<ScanOutlined />}
            onClick={handleFaceLogin}
            className="!rounded-xl !border-blue-500 !text-blue-600 hover:!bg-blue-50"
          >
            Xác thực bằng khuôn mặt
          </Button>

          <p className="text-xs text-gray-400 text-center mt-10">
            © 2025 Nova Digital Banking
          </p>
        </div>

        {/* ẢNH BÊN PHẢI */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 relative">
          <img
            src="/dacbanklogo.png"
            alt="Nova Bank"
            className="w-[75%] max-w-sm drop-shadow-2xl rounded-2xl"
          />

          {/* HÌNH TRANG TRÍ */}
          <div className="absolute top-8 left-8 w-14 h-14 bg-white/20 rounded-full"></div>
          <div className="absolute bottom-12 right-12 w-20 h-20 bg-white/10 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
