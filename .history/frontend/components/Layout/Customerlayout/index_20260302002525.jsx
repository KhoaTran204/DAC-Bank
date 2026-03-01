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
        {/* ================= HEADER CHUYÊN NGHIỆP ================= */}
        <Header
          className="flex items-center justify-between px-8 shadow-lg"
          style={{
            height: 70,
            background: "linear-gradient(90deg, #0B3C5D 0%, #1E5F8C 100%)",
          }}
        >
          {/* LEFT */}
          <div className="flex items-center gap-6">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, color: "#fff" }}
            />

            {/* BRAND */}
            <div className="flex items-center gap-3">
              <img
                src="/dacbanklogo.png"
                alt="Nova Bank"
                className="h-11 w-11 object-contain drop-shadow-md"
              />
              <div className="leading-tight">
                <div className="text-white font-semibold text-lg tracking-wide">
                  Nova Digital Bank
                </div>
                <div className="text-blue-200 text-xs">
                  Ngân hàng số thế hệ mới
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-6">
            {/* Thông báo */}
            <div className="relative cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white hover:text-cyan-300 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405C18.79 15.79 18 14.42 18 13V9a6 6 0 10-12 0v4c0 1.42-.79 2.79-1.595 3.595L3 17h5m4 0a3 3 0 11-6 0"
                />
              </svg>
              <span className="absolute -top-1 -right-2 bg-cyan-400 text-xs text-white px-1 rounded-full">
                2
              </span>
            </div>

            {/* Thông tin người dùng */}
            <div className="flex items-center gap-3 cursor-pointer hover:bg-white/10 px-3 py-2 rounded-lg transition">
              <Avatar
                size={42}
                src={
                  userInfo?.profile
                    ? `http://localhost:8080/${userInfo.profile}`
                    : undefined
                }
                className="border-2 border-white shadow-md"
              >
                {!userInfo?.profile &&
                  userInfo?.fullname?.charAt(0).toUpperCase()}
              </Avatar>

              <div className="text-white hidden md:block leading-tight">
                <div className="text-sm font-semibold">
                  {userInfo?.fullname || "Khách hàng"}
                </div>
                <div className="text-xs text-blue-200">
                  STK: ****{String(userInfo?.accountNo || "").slice(-4)}
                </div>
              </div>
            </div>
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
