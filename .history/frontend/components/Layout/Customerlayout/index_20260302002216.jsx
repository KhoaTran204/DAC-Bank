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
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  /* ================= ĐĂNG XUẤT ================= */
  const logoutFunc = () => {
    sessionStorage.removeItem("userInfo");
    cookies.remove("authToken");
    navigate("/");
  };

  /* ================= MENU ================= */
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
        <Button
          type="text"
          className="!text-gray-300 !font-semibold hover:!text-red-400"
          onClick={logoutFunc}
        >
          Đăng xuất
        </Button>
      ),
    },
  ];

  const last4 = String(userInfo?.accountNo || "").slice(-4);
  const firstLetter = userInfo?.fullname
    ? userInfo.fullname.charAt(0).toUpperCase()
    : "K";

  return (
    <Layout className="!min-h-screen bg-gray-100">
      {/* ================= SIDEBAR ================= */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="shadow-lg"
        width={230}
      >
        <div className="h-16 flex items-center justify-center text-white font-bold text-lg tracking-wide border-b border-gray-700">
          {!collapsed ? "DAC BANK" : "DAC"}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={items}
          className="mt-2"
        />
      </Sider>

      {/* ================= MAIN ================= */}
      <Layout>
        {/* ================= HEADER ================= */}
        <Header
          className="flex items-center justify-between px-6 shadow-md"
          style={{
            background: colorBgContainer,
            height: 60,
            lineHeight: "60px",
          }}
        >
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18 }}
            />

            {/* BRAND */}
            <div className="flex items-center gap-3">
              <img
                src="/dacbanklogo.png"
                alt="Nova Bank"
                className="h-10 w-10 object-contain drop-shadow-sm"
              />
              <span className="font-semibold text-gray-800 text-base">
                Ngân hàng số Nova
              </span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block leading-tight">
              <div className="text-sm font-semibold text-gray-700">
                {userInfo?.fullname || "Khách hàng"}
              </div>
              <div className="text-xs text-gray-400">
                STK: ****{last4 || "0000"}
              </div>
            </div>

            <Avatar
              size={40}
              src={
                userInfo?.profile
                  ? `http://localhost:8080/${userInfo.profile}`
                  : undefined
              }
              icon={!userInfo?.profile && <UserOutlined />}
              className="border border-gray-200 shadow-sm bg-blue-500 text-white font-semibold"
            >
              {!userInfo?.profile && firstLetter}
            </Avatar>
          </div>
        </Header>

        {/* ================= CONTENT ================= */}
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#ffffff",
            borderRadius: borderRadiusLG,
            minHeight: 360,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          {children}
        </Content>

        {/* ================= FOOTER ================= */}
        <Footer className="text-center text-sm text-gray-500 bg-gray-50 border-t">
          <div className="font-semibold text-gray-700">
            © 2026 Nova Digital Bank
          </div>
          <div>
            Hotline: 1900 9999 · Email: support@novabank.vn · www.novabank.vn
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Giao dịch được bảo mật theo tiêu chuẩn ngân hàng số hiện đại
          </div>
        </Footer>
      </Layout>

      {/* ================= CHATBOT ================= */}
      <Chatbot />
    </Layout>
  );
};

export default Customerlayout;
