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
  // Lấy thông tin user từ sessionStorage
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const [accountForm] = Form.useForm();
  const [messageApi, contex] = message.useMessage();

  // Các state quản lý
  const [accountModal, setAccountModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [signature, setSignature] = useState(null);
  const [document, setDocument] = useState(null);
  const [allCustomer, setAllCustomer] = useState(null);
  const [finalCustomer, setFinalCustomer] = useState(null);
  const [edit, setEdit] = useState(null);

  const [no, setNo] = useState(0);

  // Lấy dữ liệu branding
  const { data: brandings } = useSWR("/api/branding", fetchData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 1200000,
  });

  // Lấy danh sách khách hàng theo chi nhánh
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
        messageApi.error("Không thể tải dữ liệu !");
      }
    };
    fetcher();
  }, [no]);

  // Khi chọn branding → tự tăng số tài khoản
  const onSelectBranding = (brandingId) => {
    const branding = brandings?.data?.find((b) => b._id === brandingId);
    if (!branding) return;

    const newAccountNo = Number(branding.bankAccountNo) + 1;

    accountForm.setFieldsValue({
      brandingId,
      accountNo: newAccountNo,
    });
  };

  // Tạo tài khoản mới
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
      await httpReq.post("/api/send-email", {
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
      if (err?.response?.data?.error?.code === 11000) {
        accountForm.setFields([
          {
            name: "bankCardNo",
            errors: ["Số thẻ ngân hàng đã tồn tại !"],
          },
          {
            name: "email",
            errors: ["Email đã tồn tại !"],
          },
        ]);
      } else {
        messageApi.error("Vui lòng thử lại sau !");
      }
    } finally {
      setLoading(false);
    }
  };

  // Upload ảnh
  const handlePhoto = async (e) => {
    try {
      const result = await uploadFile(e.target.files[0], "customerPhoto");
      setPhoto(result.filePath);
    } catch {
      messageApi.error("Upload ảnh thất bại !");
    }
  };

  // Upload chữ ký
  const handleSignature = async (e) => {
    try {
      const result = await uploadFile(e.target.files[0], "customerSignature");
      setSignature(result.filePath);
    } catch {
      messageApi.error("Upload chữ ký thất bại !");
    }
  };

  // Upload tài liệu
  const handleDocument = async (e) => {
    try {
      const result = await uploadFile(e.target.files[0], "customerDocument");
      setDocument(result.filePath);
    } catch {
      messageApi.error("Upload tài liệu thất bại !");
    }
  };

  // Cập nhật trạng thái hoạt động
  const updateIsActive = async (id, isActive, loginId) => {
    try {
      const obj = { isActive: !isActive };
      const httpReq = http();
      await httpReq.put(`/api/users/${loginId}`, obj);
      await httpReq.put(`/api/customers/${id}`, obj);
      messageApi.success("Cập nhật trạng thái thành công !");
      setNo(no + 1);
    } catch {
      messageApi.error("Không thể cập nhật trạng thái !");
    }
  };

  // Tìm kiếm
  const onSearh = (e) => {
    const value = e.target.value.trim().toLowerCase();
    if (!value) return setAllCustomer(finalCustomer);

    setAllCustomer(
      finalCustomer.filter(
        (c) =>
          c?.fullname?.toLowerCase().includes(value) ||
          c?.email?.toLowerCase().includes(value) ||
          c?.accountNo?.toString().includes(value) ||
          c?.bankCardNo?.toString().includes(value)
      )
    );
  };

  // Sửa khách hàng
  const onEditCustomer = (obj) => {
    setEdit(obj);
    setAccountModal(true);
    accountForm.setFieldsValue(obj);
  };

  // Cập nhật khách hàng
  const onUpdate = async (values) => {
    try {
      setLoading(true);
      let finalObj = trimData(values);
      delete finalObj.password;
      delete finalObj.email;
      delete finalObj.accountNo;

      if (photo) finalObj.profile = photo;
      if (signature) finalObj.signature = signature;
      if (document) finalObj.document = document;

      const httpReq = http();
      await httpReq.put(`/api/customers/${edit._id}`, finalObj);

      messageApi.success("Cập nhật khách hàng thành công !");
      setNo(no + 1);
      setEdit(null);
      setAccountModal(false);
      accountForm.resetFields();
    } catch {
      messageApi.error("Không thể cập nhật khách hàng !");
    } finally {
      setLoading(false);
    }
  };

  // Xóa khách hàng
  const onDeleteCustomer = async (id, loginId) => {
    try {
      const httpReq = http();
      await httpReq.delete(`/api/users/${loginId}`);
      await httpReq.delete(`/api/customers/${id}`);
      messageApi.success("Xóa khách hàng thành công !");
      setNo(no + 1);
    } catch {
      messageApi.error("Không thể xóa khách hàng !");
    }
  };

  // Đóng modal
  const onCloseModal = () => {
    setAccountModal(false);
    setEdit(null);
    accountForm.resetFields();
  };

  return (
    <div>
      {contex}
      <Card
        title="Danh sách tài khoản"
        extra={
          <div className="flex gap-x-3">
            <Input
              placeholder="Tìm kiếm"
              prefix={<SearchOutlined />}
              onChange={onSearh}
            />
            <Button
              onClick={() => setAccountModal(true)}
              className="!bg-blue-500 !text-white"
            >
              Thêm tài khoản
            </Button>
          </div>
        }
      >
        <Table columns={columns} dataSource={allCustomer} />
      </Card>

      <Modal
        open={accountModal}
        onCancel={onCloseModal}
        footer={null}
        width={820}
        title={edit ? "Cập nhật tài khoản" : "Mở tài khoản mới"}
      >
        <Form
          layout="vertical"
          form={accountForm}
          onFinish={edit ? onUpdate : onFinish}
        >
          {/* FORM GIỮ NGUYÊN – CHỈ ĐỔI NGÔN NGỮ */}
        </Form>
      </Modal>
    </div>
  );
};

export default NewAccount;
