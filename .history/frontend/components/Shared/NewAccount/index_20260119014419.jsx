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
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const [accountForm] = Form.useForm();
  const [messageApi, contex] = message.useMessage();

  const [accountModal, setAccountModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [signature, setSignature] = useState(null);
  const [document, setDocument] = useState(null);
  const [allCustomer, setAllCustomer] = useState(null);
  const [finalCustomer, setFinalCustomer] = useState(null);
  const [edit, setEdit] = useState(null);
  const [no, setNo] = useState(0);

  const { data: brandings } = useSWR("/api/branding", fetchData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 1200000,
  });

  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/customers");
        const filterData = data?.data?.filter(
          (item) => item.branch == userInfo.branch
        );
        setAllCustomer(filterData);
        setFinalCustomer(filterData);
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

  const onFinish = async (values) => {
    try {
      setLoading(true);
      let finalObj = trimData(values);
      finalObj.profile = photo || "bankImages/dummy.png";
      finalObj.signature = signature || "bankImages/dummy.png";
      finalObj.document = document || "bankImages/dummy.png";
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
      messageApi.error("Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  const updateIsActive = async (id, isActive, loginId) => {
    try {
      const httpReq = http();
      await httpReq.put(`/api/users/${loginId}`, { isActive: !isActive });
      await httpReq.put(`/api/customers/${id}`, { isActive: !isActive });
      messageApi.success("Cập nhật trạng thái thành công!");
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Không thể cập nhật trạng thái!");
    }
  };

  const onSearh = (e) => {
    const value = e.target.value.trim().toLowerCase();
    if (!value) return setAllCustomer(finalCustomer);

    const filter = finalCustomer.filter((cust) =>
      Object.values(cust).join(" ").toLowerCase().includes(value)
    );
    setAllCustomer(filter);
  };

  const columns = [
    {
      title: "Ảnh đại diện",
      render: (_, obj) => (
        <Image
          src={`${import.meta.env.VITE_BASEURL}/${obj?.profile}`}
          width={40}
          height={40}
        />
      ),
    },
    {
      title: "Chi nhánh",
      dataIndex: "branch",
    },
    {
      title: "Loại tài khoản",
      dataIndex: "userType",
    },
    {
      title: "Số tài khoản",
      dataIndex: "accountNo",
    },
    {
      title: "Số thẻ",
      dataIndex: "bankCardNo",
    },
    {
      title: "Số dư",
      dataIndex: "finalBalance",
    },
    {
      title: "Họ và tên",
      dataIndex: "fullname",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Hành động",
      fixed: "right",
      render: (_, obj) => (
        <div className="flex gap-1">
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
        </div>
      ),
    },
  ];

  return (
    <div>
      {contex}
      <Card
        title="Danh sách tài khoản"
        extra={
          <div className="flex gap-3">
            <Input
              placeholder="Tìm kiếm"
              prefix={<SearchOutlined />}
              onChange={onSearh}
            />
            <Button onClick={() => setAccountModal(true)}>
              Thêm tài khoản mới
            </Button>
          </div>
        }
      >
        <Table columns={columns} dataSource={allCustomer} />
      </Card>

      <Modal
        open={accountModal}
        onCancel={() => setAccountModal(false)}
        title="Mở tài khoản mới"
        footer={null}
      >
        <Form layout="vertical" form={accountForm} onFinish={onFinish}>
          <Item label="Họ và tên" name="fullname" rules={[{ required: true }]}>
            <Input placeholder="Nhập họ và tên" />
          </Item>

          <Item label="Email" name="email" rules={[{ required: true }]}>
            <Input placeholder="Nhập email" />
          </Item>

          <Item label="Mật khẩu" name="password" rules={[{ required: true }]}>
            <Input.Password placeholder="Nhập mật khẩu" />
          </Item>

          <Item label="Địa chỉ" name="address" rules={[{ required: true }]}>
            <Input.TextArea />
          </Item>

          <Button htmlType="submit" loading={loading} type="primary">
            Xác nhận
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default NewAccount;
