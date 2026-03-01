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
        const { token } = data;
        cookies.set("authToken", token, {
          path: "/",
          expires,
        });
        navigate("/admin");
      } else if (data?.isLoged && data?.userType === "employee") {
        const { token } = data;
        cookies.set("authToken", token, {
          path: "/",
          expires,
        });
        navigate("/employee");
      } else if (data?.isLoged && data?.userType === "customer") {
        const { token } = data;
        cookies.set("authToken", token, {
          path: "/",
          expires,
        });
        navigate("/customer");
      } else {
        return message.warning("Wrong credencials");
      }
    } catch (err) {
      messageApi.error(err.response?.data?.message);
    }
  };

  return (
    <div className="flex">
      {context}
      <div className="w-1/2 hidden md:flex items-center justify-center">
        <img src="/bank-img.jpg" alt="Bank" className="w-4/5 object-contain" />
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white">
        <Card className="w-full max-w-sm shadow-xl">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Bank Login
          </h2>
          <Form name="login" onFinish={onFinish} layout="vertical">
            <Item name="email" label="Username" rules={[{ required: true }]}>
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your username"
              />
            </Item>
            <Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
              />
            </Item>
            <Item>
              <Button
                type="text"
                htmlType="submit"
                block
                className="!bg-blue-500 !text-white !font-bold"
              >
                Login
              </Button>
            </Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};
export default Login;
