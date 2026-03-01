import React, { useState } from "react";
import {
  BranchesOutlined,
  DashOutlined,
  DollarCircleOutlined,
  GifOutlined,
  GiftOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserAddOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

const cookies = new Cookies();
const { Header, Sider, Content } = Layout;

const Adminlayout = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  console.log(pathname);

  // Hàm đăng xuất
  const logoutFunc = () => {
    sessionStorage.removeItem("userInfo");
    cookies.remove("authToken");
    navigate("/");
  };

  const items = [
    {
      key: "/admin",
      icon: <DashOutlined />,
      label: <Link to="/admin">Bảng điều khiển</Link>,
    },
    {
      key: "/admin/new-account",
      icon: <UserAddOutlined />,
      label: <Link to="/admin/new-account">Tạo tài khoản mới</Link>,
    },
    {
      key: "/admin/new-transaction",
      icon: <UserAddOutlined />,
      label: <Link to="/admin/new-transaction">Tạo giao dịch mới</Link>,
    },
    {
      key: "/admin/new-employee",
      icon: <UserOutlined />,
      label: <Link to="/admin/new-employee">Tạo nhân viên mới</Link>,
    },
    {
      key: "/admin/branding",
      icon: <GiftOutlined />,
      label: <Link to="/admin/branding">Ngân hàng</Link>,
    },
    {
      key: "/admin/branch",
      icon: <BranchesOutlined />,
      label: <Link to="/admin/branch">Chi nhánh</Link>,
    },
    {
      key: "/admin/currency",
      icon: <DollarCircleOutlined />,
      label: <Link to="/admin/currency">Tiền tệ</Link>,
    },
    {
      key: "/admin/logout",
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
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[pathname]}
          items={items}
        />
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Adminlayout;
