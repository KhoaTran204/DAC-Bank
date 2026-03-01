import React, { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  HistoryOutlined,
  SwapOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { Layout, Menu, Avatar, Dropdown } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import Chatbot from "../../Shared/Chatbot";

const { Header, Sider, Content, Footer } = Layout;
const cookies = new Cookies();

const Customerlayout = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "{}");

  const logoutFunc = () => {
    sessionStorage.removeItem("userInfo");
    cookies.remove("authToken");
    navigate("/");
  };

  const menuItems = [
    {
      key: "/customer",
      icon: <DashboardOutlined />,
      label: <Link to="/customer">Trang chủ</Link>,
    },
    {
      key: "/customer/transaction",
      icon: <HistoryOutlined />,
      label: <Link to="/customer/transaction">Lịch sử giao dịch</Link>,
    },
    {
      key: "/customer/transfer",
      icon: <SwapOutlined />,
      label: <Link to="/customer/transfer">Chuyển tiền</Link>,
    },
  ];

  const dropdownItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: logoutFunc,
      danger: true,
    },
  ];

  return (
    <Layout className="min-h-screen bg-[#F4F7FA]">
      {/* SIDEBAR */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="!bg-[#0B1F3A] shadow-2xl"
      >
        <div className="h-16 flex items-center justify-center text-white font-bold text-xl tracking-wide">
          {collapsed ? "DAC" : "DAC BANK"}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          className="!bg-[#0B1F3A]"
        />
      </Sider>

      {/* MAIN */}
      <Layout>
        {/* HEADER */}
        <Header className="!bg-white !px-6 flex items-center justify-between shadow-md relative z-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-xl text-[#0B1F3A]"
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>

            <div className="flex items-center gap-3">
              <img
                src="/dacbanklogo.png"
                alt="logo"
                className="h-10 w-10 object-contain"
              />
              <span className="font-bold text-[#0B1F3A] text-lg">
                Ngân hàng số DAC
              </span>
            </div>
          </div>
          <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block leading-tight">
                <div className="text-sm font-semibold text-[#0B1F3A] tracking-normal">
                  {userInfo?.fullname || "Khách hàng"}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 tracking-wide">
                  STK: ****{String(userInfo?.accountNo || "").slice(-4)}
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
                className="shadow-md"
              />
            </div>
          </Dropdown>
        </Header>

        <Content className="m-6">{children}</Content>

        <Footer className="text-center text-gray-500 bg-transparent text-sm">
          © 2026 DAC Bank · Hotline 1900 9999 · support@dacbank.vn
        </Footer>
      </Layout>

      <Chatbot />
    </Layout>
  );
};

export default Customerlayout;
