import {
  Button,
  Card,
  Image,
  Popconfirm,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Select,
  Table,
} from "antd";
import {
  SearchOutlined,
  EyeInvisibleOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import {
  http,
  uploadFile,
  fetchData,
  trimData,
} from "../../../modules/modules";
import useSWR, { mutate } from "swr";

const { Item } = Form;

const NewAccount = () => {
  // lấy thông tin người dùng từ sessionStorage
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const [accountForm] = Form.useForm();
  const [messageApi, contex] = message.useMessage();

  // state quản lý
  const [accountModal, setAccountModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [signature, setSignature] = useState(null);
  const [document, setDocument] = useState(null);
  const [allCustomer, setAllCustomer] = useState(null);
  const [finalCustomer, setFinalCustomer] = useState(null);
  const [edit, setEdit] = useState(null);
  const [no, setNo] = useState(0);

  // lấy danh sách branding
  const { data: brandings } = useSWR("/api/branding", fetchData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 1200000,
  });

  // lấy danh sách khách hàng
  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/customers");
        setAllCustomer(
          data?.data?.filter((item) => item.branch == userInfo.branch)
        );
        setFinalCustomer(
          data?.data?.filter((item) => item.branch == userInfo.branch)
        );
      } catch (err) {
        messageApi.error("Không thể tải dữ liệu!");
      }
    };
    fetcher();
  }, [no]);

  const onSelectBranding = (brandingId) => {
    const branding = brandings?.data?.find((b) => b._id === brandingId);
    if (!branding) return;

    const newAccountNo = Number(branding.bankAccountNo) + 1;
    accountForm.setFieldsValue({
      brandingId,
      accountNo: newAccountNo,
    });
  };

  // tạo tài khoản mới
  const onFinish = async (values) => {
    try {
      setLoading(true);
      let finalObj = trimData(values);
      finalObj.profile = photo ? photo : "bankImages/dummy.png";
      finalObj.signature = signature ? signature : "bankImages/dummy.png";
      finalObj.document = document ? document : "bankImages/dummy.png";
      finalObj.key = finalObj.email;
      finalObj.userType = "customer";
      finalObj.branch = userInfo?.branch;
      finalObj.createdBy = userInfo?.email;

      const httpReq = http();
      const { data } = await httpReq.post(`/api/users`, finalObj);
      finalObj.customerLoginId = data?.data?._id;

      await httpReq.post("/api/customers", finalObj);
      await httpReq.post(`/api/send-email`, {
        email: finalObj.email,
        password: finalObj.password,
      });
      await httpReq.put(`/api/branding/${values.brandingId}`, {
        bankAccountNo: values.accountNo,
      });

      accountForm.resetFields();
      mutate("/api/branding");
      setPhoto(null);
      setSignature(null);
      setDocument(null);
      setNo(no + 1);
      setAccountModal(false);
      messageApi.success("Tạo tài khoản thành công!");
    } catch (err) {
      if (err?.response?.data?.error?.code === 11000) {
        accountForm.setFields([
          { name: "bankCardNo", errors: ["Số thẻ đã tồn tại!"] },
          { name: "email", errors: ["Email đã tồn tại!"] },
        ]);
      } else {
        messageApi.error("Vui lòng thử lại sau!");
      }
    } finally {
      setLoading(false);
    }
  };

  // cập nhật trạng thái hoạt động
  const updateIsActive = async (id, isActive, loginId) => {
    try {
      const obj = { isActive: !isActive };
      const httpReq = http();
      await httpReq.put(`/api/users/${loginId}`, obj);
      await httpReq.put(`/api/customers/${id}`, obj);
      messageApi.success("Cập nhật trạng thái thành công!");
      setNo(no + 1);
    } catch {
      messageApi.error("Không thể cập nhật trạng thái!");
    }
  };

  // tìm kiếm
  const onSearh = (e) => {
    const value = e.target.value.trim().toLowerCase();
    if (!value) return setAllCustomer(finalCustomer);

    setAllCustomer(
      finalCustomer.filter(
        (cust) =>
          cust?.fullname?.toLowerCase().includes(value) ||
          cust?.email?.toLowerCase().includes(value) ||
          cust?.mobile?.toLowerCase().includes(value)
      )
    );
  };

  // cột bảng
  const columns = [
    {
      title: "Ảnh",
      render: (_, o) => (
        <Image
          src={`${import.meta.env.VITE_BASEURL}/${o.profile}`}
          width={40}
        />
      ),
    },
    { title: "Chi nhánh", dataIndex: "branch" },
    { title: "Loại tài khoản", dataIndex: "userType" },
    { title: "Số tài khoản", dataIndex: "accountNo" },
    { title: "Số thẻ", dataIndex: "bankCardNo" },
    { title: "Số dư", dataIndex: "finalBalance" },
    { title: "Họ tên", dataIndex: "fullname" },
    { title: "Email", dataIndex: "email" },
    { title: "SĐT", dataIndex: "mobile" },
    {
      title: "Thao tác",
      render: (_, obj) => (
        <Popconfirm
          title="Xác nhận?"
          description="Bạn có chắc chắn muốn thay đổi trạng thái?"
          onConfirm={() =>
            updateIsActive(obj._id, obj.isActive, obj.customerLoginId)
          }
        >
          <Button
            icon={obj.isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card
      title="Danh sách tài khoản"
      extra={
        <div className="flex gap-2">
          <Input placeholder="Tìm kiếm..." onChange={onSearh} />
          <Button onClick={() => setAccountModal(true)} type="primary">
            Thêm tài khoản
          </Button>
        </div>
      }
    >
      {contex}
      <Table columns={columns} dataSource={allCustomer} />
    </Card>
  );
};

export default NewAccount;
