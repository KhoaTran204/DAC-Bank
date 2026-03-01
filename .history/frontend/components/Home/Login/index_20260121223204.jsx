import { Button, Form, Input } from "antd";

const Login = () => {
  const onFinish = (values) => {
    console.log("Dữ liệu đăng nhập:", values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-[45%_55%]">
        
        {/* ===== CỘT TRÁI: FORM ĐĂNG NHẬP ===== */}
        <div className="flex flex-col justify-center px-14 py-16">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Đăng nhập
          </h1>
          <p className="text-gray-500 mb-8">
            Chào mừng bạn quay trở lại Nova Bank
          </p>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập" },
              ]}
            >
              <Input
                size="large"
                placeholder="Nhập tên đăng nhập"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Nhập mật khẩu"
                className="rounded-lg"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="w-full mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-700"
            >
              Đăng nhập
            </Button>
          </Form>

          <p className="text-xs text-gray-400 mt-10 text-center">
            © 2025 Nova Digital Banking
          </p>
        </div>

        {/* ===== CỘT PHẢI: HÌNH MINH HỌA ===== */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-indigo-
