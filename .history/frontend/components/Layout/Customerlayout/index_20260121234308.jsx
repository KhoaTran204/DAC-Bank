import React, { useState } from "react";
import {
  DashOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  BranchesOutlined,
  SafetyCertificateOutlined,
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

  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

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
          className="!text-gray-300 !font-semibold"
          onClick={logoutFunc}
        >
          Đăng xuất
        </Button>
      ),
    },
  ];

  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className="!min-h-screen">
      {/* ================= SIDEBAR ================= */}
      <Sider trigger={null} collapsible collapsed={collapsed}>
        {/* LOGO SIDEBAR */}
        <div className="h-16 flex items-center justify-center text-white font-bold text-lg">
          {!collapsed ? "NOVA BANK" : "NB"}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={items}
        />
      </Sider>

      {/* ================= MAIN ================= */}
      <Layout>
        {/* ================= HEADER ================= */}
        <Header
          className="flex items-center justify-between px-4 shadow-sm"
          style={{ background: colorBgContainer }}
        >
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16 }}
            />

            {/* LOGO + TEXT */}
            <div className="flex items-center gap-2">
              <SafetyCertificateOutlined className="text-blue-600 text-xl" />
              <span className="font-semibold text-gray-700 hidden md:block">
                Ngân hàng số Nova
              </span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="font-semibold text-gray-700">
                {userInfo?.fullName || "Khách hàng"}
              </div>
              <div className="text-xs text-gray-400">
                STK: ****{String(userInfo?.accountNo || "").slice(-4)}
              </div>
            </div>

            <Avatar
              icon={<UserOutlined />}
              className="bg-blue-600 cursor-pointer"
            />
          </div>
        </Header>

        {/* ================= CONTENT ================= */}
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>

        {/* ================= FOOTER ================= */}
        <Footer className="text-center text-sm text-gray-400">
          <div className="font-semibold text-gray-600">
            © 2026 Nova Digital Bank
          </div>
          <div>
            Hotline: 1900 9999 · Email: support@novabank.vn · www.novabank.vn
          </div>
          <div className="mt-1">
            Giao dịch được bảo mật theo tiêu chuẩn ngân hàng số
          </div>
        </Footer>
      </Layout>

      {/* ================= CHATBOT ================= */}
      <Chatbot />
    </Layout>
  );
};

export default Customerlayout;
