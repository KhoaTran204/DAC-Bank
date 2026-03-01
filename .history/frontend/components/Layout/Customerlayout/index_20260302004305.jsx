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
    <Layout className="min-h-screen bg-[#F1F5F9]">
      {/* SIDEBAR */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={230}
        style={{
          background: "#FFFFFF",
          borderRight: "1px solid #E2E8F0",
        }}
      >
        <div className="h-16 flex items-center justify-center font-bold text-lg text-blue-600 border-b border-[#E2E8F0]">
          {!collapsed ? "DAC BANK" : "DAC"}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={items}
          style={{
            border: "none",
          }}
        />
      </Sider>

      {/* MAIN */}
      <Layout>
        {/* HEADER */}
        <Header
          className="flex items-center justify-between px-8 shadow-sm"
          style={{
            background: "#FFFFFF",
            borderBottom: "1px solid #E2E8F0",
            height: 70,
          }}
        >
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18 }}
            />

            <div className="flex items-center gap-3">
              <img
                src="/dacbanklogo.png"
                alt="Nova Bank"
                className="h-10 w-10 object-contain"
              />
              <div>
                <div className="font-semibold text-gray-800">
                  Nova Digital Bank
                </div>
                <div className="text-xs text-gray-500">
                  Ngân hàng số hiện đại
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-sm font-semibold text-gray-700">
                {userInfo?.fullname || "Khách hàng"}
              </div>
              <div className="text-xs text-gray-500">
                STK: ****{String(userInfo?.accountNo || "").slice(-4)}
              </div>
            </div>

            <Avatar
              size={42}
              src={
                userInfo?.profile
                  ? `http://localhost:8080/${userInfo.profile}`
                  : undefined
              }
              icon={<UserOutlined />}
              style={{
                backgroundColor: "#2563EB",
              }}
            />
          </div>
        </Header>

        {/* CONTENT */}
        <Content
          style={{
            margin: "24px",
            padding: 24,
            background: "#F1F5F9",
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>

        {/* FOOTER */}
        <Footer
          style={{
            textAlign: "center",
            background: "#FFFFFF",
            borderTop: "1px solid #E2E8F0",
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
