import React, { useState } from "react";
import {
  DashOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  BranchesOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { Button, Layout, Menu, theme, Avatar } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import Chatbot from "../../Shared/Chatbot";

const cookies = new Cookies();
const { Header, Sider, Content, Footer } = Layout;

const Customerlayout = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "{}");

  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const logoutFunc = () => {
    sessionStorage.removeItem("userInfo");
    cookies.remove("authToken");
    navigate("/");
  };

  const items = [
    {
      key: "/customer",
      icon: <DashOutlined />,
      label: <Link to="/customer">Trang chủ</Link>,
    },
    {
      key: "/customer/transaction",
      icon: <BranchesOutlined />,
      label: <Link to="/customer/transaction">Lịch sử giao dịch</Link>,
    },
    {
      key: "/customer/transfer",
      icon: <BranchesOutlined />,
      label: <Link to="/customer/transfer">Chuyển tiền</Link>,
    },
    {
      key: "/customer/logout",
      icon: <LogoutOutlined />,
      label: (
        <Button type="text" danger onClick={logoutFunc}>
          Đăng xuất
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#F5F7FB" }}>
      {/* SIDEBAR */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{
          background: "linear-gradient(180deg,#6366F1,#8B5CF6)",
          paddingTop: 20,
        }}
      >
        <div
          style={{
            height: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 600,
            color: "white",
            marginBottom: 20,
          }}
        >
          {collapsed ? "DAC" : "DAC BANK"}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={items}
          theme="dark"
          style={{
            background: "transparent",
            border: "none",
            fontSize: 15,
          }}
        />
      </Sider>

      {/* MAIN */}
      <Layout>
        {/* HEADER */}
        <Header
          style={{
            background: "#FFFFFF",
            height: 75,
            padding: "0 30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18 }}
            />

            <div>
              <div style={{ fontWeight: 600, fontSize: 17 }}>
                Nova Digital Bank
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>
                Ngân hàng số thế hệ mới
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 500 }}>
                {userInfo?.fullname || "Khách hàng"}
              </div>
              <div style={{ fontSize: 12, color: "#999" }}>
                STK: ****{String(userInfo?.accountNo || "").slice(-4)}
              </div>
            </div>

            <Avatar
              size={44}
              icon={<UserOutlined />}
              src={
                userInfo?.profile
                  ? `http://localhost:8080/${userInfo.profile}`
                  : undefined
              }
              style={{
                background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              }}
            />
          </div>
        </Header>

        {/* CONTENT */}
        <Content
          style={{
            margin: 30,
            padding: 30,
            background: "#FFFFFF",
            borderRadius: 20,
            boxShadow: "0 15px 40px rgba(0,0,0,0.05)",
          }}
        >
          {children}
        </Content>

        {/* FOOTER */}
        <Footer
          style={{
            textAlign: "center",
            background: "transparent",
            color: "#888",
          }}
        >
          © 2026 DAC Bank · Bảo mật theo tiêu chuẩn ngân hàng số
        </Footer>
      </Layout>

      <Chatbot />
    </Layout>
  );
};

export default Customerlayout;
