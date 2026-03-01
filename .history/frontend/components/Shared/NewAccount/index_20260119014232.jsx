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
        setAllCustomer(
          data?.data?.filter((item) => item.branch == userInfo.branch)
        );
        setFinalCustomer(
          data?.data?.filter((item) => item.branch == userInfo.branch)
        );
      } catch (err) {
        messageApi.error("Không thể tải dữ liệu khách hàng !");
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
      messageApi.success("Tạo tài khoản thành công !");
    } catch (err) {
      messageApi.error("Vui lòng thử lại sau !");
    } finally {
      setLoading(false);
    }
  };

  const onSearh = (e) => {
    const value = e.target.value.trim().toLowerCase();
    if (!value) return setAllCustomer(finalCustomer);

    setAllCustomer(
      finalCustomer.filter(
        (c) =>
          c.fullname?.toLowerCase().includes(value) ||
          c.email?.toLowerCase().includes(value) ||
          c.accountNo?.toString().includes(value) ||
          c.bankCardNo?.toString().includes(value)
      )
    );
  };

  const columns = [
    {
      title: "Ảnh",
      render: (_, obj) => (
        <Image
          src={`${import.meta.env.VITE_BASEURL}/${obj.profile}`}
          width={40}
          height={40}
        />
      ),
    },
    { title: "Chi nhánh", dataIndex: "branch" },
    { title: "Số tài khoản", dataIndex: "accountNo" },
    { title: "Số thẻ", dataIndex: "bankCardNo" },
    { title: "Số dư", dataIndex: "finalBalance" },
    { title: "Họ tên", dataIndex: "fullname" },
    { title: "Email", dataIndex: "email" },
    { title: "Số điện thoại", dataIndex: "mobile" },
    { title: "Địa chỉ", dataIndex: "address" },
    {
      title: "Hành động",
      fixed: "right",
      render: (_, obj) => (
        <div className="flex gap-1">
          <Popconfirm
            title="Xác nhận thao tác?"
            description="Bạn có chắc chắn muốn thay đổi trạng thái?"
            onConfirm={() =>
              updateIsActive(obj._id, obj.isActive, obj.customerLoginId)
            }
          >
            <Button
              type="text"
              icon={obj.isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            />
          </Popconfirm>

          <Popconfirm
            title="Chỉnh sửa khách hàng?"
            onConfirm={() => onEditCustomer(obj)}
          >
            <Button type="text" icon={<EditOutlined />} />
          </Popconfirm>

          <Popconfirm
            title="Xóa khách hàng?"
            description="Dữ liệu sẽ bị xóa vĩnh viễn"
            onConfirm={() => onDeleteCustomer(obj._id, obj.customerLoginId)}
          >
            <Button type="text" icon={<DeleteOutlined />} />
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
            <Button
              onClick={() => setAccountModal(true)}
              className="!bg-blue-500 !text-white"
            >
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
        width={820}
      >
        <Form form={accountForm} layout="vertical" onFinish={onFinish}>
          <Item
            label="Chọn ngân hàng"
            name="brandingId"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Chọn ngân hàng"
              onChange={onSelectBranding}
              options={brandings?.data?.map((b) => ({
                label: b.bankName,
                value: b._id,
              }))}
            />
          </Item>

          <Item
            label="Số thẻ ngân hàng"
            name="bankCardNo"
            rules={[{ required: true }]}
          >
            <Input placeholder="Nhập số thẻ" />
          </Item>

          <Item label="Số tài khoản" name="accountNo">
            <Input disabled />
          </Item>

          <Item label="Email" name="email" rules={[{ required: true }]}>
            <Input />
          </Item>

          <Item label="Mật khẩu" name="password" rules={[{ required: true }]}>
            <Input.Password />
          </Item>

          <Item label="Họ và tên" name="fullname" rules={[{ required: true }]}>
            <Input />
          </Item>

          <Item
            label="Số điện thoại"
            name="mobile"
            rules={[{ required: true }]}
          >
            <Input />
          </Item>

          <Item label="Địa chỉ" name="address" rules={[{ required: true }]}>
            <Input.TextArea />
          </Item>

          <Item className="text-right">
            <Button
              loading={loading}
              htmlType="submit"
              className="!bg-blue-500 !text-white"
            >
              Xác nhận
            </Button>
          </Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NewAccount;
