// CustomerLayout.jsx
import { Layout, Menu, Avatar } from "antd";
import {
  HomeOutlined,
  HistoryOutlined,
  SwapOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const CustomerLayout = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

  return (
    <Layout style={{ minHeight: "100vh", background: "#F5F7FB" }}>
      {/* SIDEBAR */}
      <Sider
        width={240}
        style={{
          background: "linear-gradient(180deg,#6366F1,#8B5CF6)",
          paddingTop: 20,
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: 600,
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          DAC BANK
        </div>

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          style={{
            background: "transparent",
            borderRight: 0,
            fontSize: 15,
          }}
          items={[
            {
              key: "1",
              icon: <HomeOutlined />,
              label: "Trang chủ",
              onClick: () => navigate("/customer"),
            },
            {
              key: "2",
              icon: <HistoryOutlined />,
              label: "Lịch sử giao dịch",
              onClick: () => navigate("/customer/history"),
            },
            {
              key: "3",
              icon: <SwapOutlined />,
              label: "Chuyển tiền",
              onClick: () => navigate("/customer/transfer"),
            },
            {
              key: "4",
              icon: <LogoutOutlined />,
              label: "Đăng xuất",
              onClick: () => {
                sessionStorage.clear();
                navigate("/");
              },
            },
          ]}
        />
      </Sider>

      {/* MAIN */}
      <Layout>
        {/* HEADER */}
        <Header
          style={{
            background: "#FFFFFF",
            padding: "0 30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600 }}>Nova Digital Bank</div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 500 }}>{userInfo?.fullName}</div>
              <div style={{ fontSize: 12, color: "#888" }}>
                STK: ****{userInfo?.accountNumber?.slice(-4)}
              </div>
            </div>

            <Avatar
              size={40}
              style={{
                background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              }}
            >
              {userInfo?.fullName?.charAt(0)}
            </Avatar>
          </div>
        </Header>

        {/* CONTENT */}
        <Content
          style={{
            margin: 30,
            padding: 30,
            background: "#FFFFFF",
            borderRadius: 20,
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default CustomerLayout;
