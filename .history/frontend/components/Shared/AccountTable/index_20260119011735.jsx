import React, { useEffect, useState } from "react";
import { Table, Image } from "antd";
import { http, formatDate } from "../../../modules/modules";

const AccountTable = ({ query = {} }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 trạng thái phân trang (GIỐNG TransactionTable)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 3,
  });

  // 🔹 lấy thông tin người dùng đang đăng nhập
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const httpReq = http();
      const res = await httpReq.get("/api/users");

      let filtered = res.data.data || [];

      // 🔥 PHÂN QUYỀN
      if (userInfo?.userType === "admin") {
        filtered = filtered.filter((u) => u.userType === "employee");
      }

      if (userInfo?.userType === "employee") {
        filtered = filtered.filter((u) => u.userType === "customer");
      }

      if (userInfo?.userType === "customer") {
        filtered = filtered.filter((u) => u.customerLoginId === userInfo._id);
      }

      // 🔹 lọc theo chi nhánh
      if (query.branch) {
        filtered = filtered.filter((u) => u.branch === query.branch);
      }

      // 🔹 sắp xếp mới nhất
      filtered = filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setData(filtered);
    } catch (err) {
      console.error("Không thể tải danh sách tài khoản", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [query]);

  const columns = [
    {
      title: "Ảnh đại diện",
      key: "profile",
      render: (_, obj) => (
        <Image
          src={`${import.meta.env.VITE_BASEURL}/${obj.profile}`}
          width={40}
          height={40}
          className="rounded-full"
        />
      ),
    },
    {
      title: "Loại người dùng",
      dataIndex: "userType",
      key: "userType",
      render: (text) => (
        <span
          className={`capitalize ${
            text === "admin"
              ? "text-indigo-500"
              : text === "employee"
              ? "text-green-500"
              : "text-red-500"
          }`}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Chi nhánh",
      dataIndex: "branch",
      key: "branch",
    },
    {
      title: "Họ và tên",
      dataIndex: "fullname",
      key: "fullname",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d) => formatDate(d),
    },
  ];

  return (
    <Table
      rowKey="_id"
      columns={columns}
      dataSource={data}
      loading={loading}
      scroll={{ x: "max-content" }}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: data.length,
        onChange: (page) =>
          setPagination((prev) => ({ ...prev, current: page })),
      }}
    />
  );
};

export default AccountTable;
