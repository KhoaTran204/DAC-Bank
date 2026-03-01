import { Layout, theme } from "antd";
import { useLocation } from "react-router-dom";

const { Header, Content } = Layout;

const Homelayout = ({ children }) => {
  const location = useLocation();

  // Trang đăng nhập
  const isLoginPage =
    location.pathname === "/" || location.pathname === "/login";

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      {/* Header chỉ hiện khi KHÔNG phải trang login */}
      {!isLoginPage && (
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        />
      )}

      <Content
        style={{
          margin: isLoginPage ? 0 : "24px 16px",
          padding: isLoginPage ? 0 : 24,
          minHeight: "100vh",
          background: "transparent",
          borderRadius: isLoginPage ? 0 : borderRadiusLG,
        }}
      >
        {children}
      </Content>
    </Layout>
  );
};

export default Homelayout;
