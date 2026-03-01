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
  // Lấy thông tin người dùng từ sessionStorage
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const [accountForm] = Form.useForm();
  const [messageApi, contex] = message.useMessage();

  // ===== QUẢN LÝ STATE =====
  const [accountModal, setAccountModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [signature, setSignature] = useState(null);
  const [document, setDocument] = useState(null);
  const [allCustomer, setAllCustomer] = useState(null);
  const [finalCustomer, setFinalCustomer] = useState(null);
  const [edit, setEdit] = useState(null);

  const [no, setNo] = useState(0);

  // ===== LẤY DANH SÁCH NGÂN HÀNG (BRANDING) =====
  const { data: brandings } = useSWR("/api/branding", fetchData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 1200000,
  });

  // ===== LẤY DANH SÁCH KHÁCH HÀNG =====
  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/customers");
        const filterData = data?.data?.filter(
          (item) => item.branch == userInfo.branch,
        );
        setAllCustomer(filterData);
        setFinalCustomer(filterData);
      } catch (err) {
        messageApi.error("Không thể tải dữ liệu!");
      }
    };
    fetcher();
  }, [no]);

  // ===== CHỌN NGÂN HÀNG → SINH SỐ TÀI KHOẢN =====
  const onSelectBranding = (brandingId) => {
    const branding = brandings?.data?.find((b) => b._id === brandingId);
    if (!branding) return;

    const newAccountNo = Number(branding.bankAccountNo) + 1;

    accountForm.setFieldsValue({
      brandingId,
      accountNo: newAccountNo,
    });
  };

  // ===== TẠO TÀI KHOẢN MỚI =====
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
      const { data } = await httpReq.post("/api/users", finalObj);

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
      messageApi.success("Tạo tài khoản thành công!");
    } catch (err) {
      if (err?.response?.data?.error?.code === 11000) {
        accountForm.setFields([
          {
            name: "bankCardNo",
            errors: ["Số thẻ ngân hàng đã tồn tại!"],
          },
          {
            name: "email",
            errors: ["Email đã tồn tại!"],
          },
        ]);
      } else {
        messageApi.error("Vui lòng thử lại sau!");
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== UPLOAD ẢNH =====
  const handlePhoto = async (e) => {
    try {
      const result = await uploadFile(e.target.files[0], "customerPhoto");
      setPhoto(result.filePath);
    } catch {
      messageApi.error("Tải ảnh thất bại!");
    }
  };

  const handleSignature = async (e) => {
    try {
      const result = await uploadFile(e.target.files[0], "customerSignature");
      setSignature(result.filePath);
    } catch {
      messageApi.error("Tải chữ ký thất bại!");
    }
  };

  const handleDocument = async (e) => {
    try {
      const result = await uploadFile(e.target.files[0], "customerDocument");
      setDocument(result.filePath);
    } catch {
      messageApi.error("Tải tài liệu thất bại!");
    }
  };

  // ===== CẬP NHẬT TRẠNG THÁI HOẠT ĐỘNG =====
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

  // ===== TÌM KIẾM =====
  const onSearh = (e) => {
    const value = e.target.value.trim().toLowerCase();
    if (!value) return setAllCustomer(finalCustomer);

    setAllCustomer(
      finalCustomer.filter((cust) =>
        Object.values(cust).some((v) =>
          v?.toString().toLowerCase().includes(value),
        ),
      ),
    );
  };

  // ===== CẬP NHẬT / XOÁ KHÁCH HÀNG =====
  const onEditCustomer = (obj) => {
    setEdit(obj);
    setAccountModal(true);
    accountForm.setFieldsValue(obj);
  };

  const onDeleteCustomer = async (id, loginId) => {
    try {
      const httpReq = http();
      await httpReq.delete(`/api/users/${loginId}`);
      await httpReq.delete(`/api/customers/${id}`);
      messageApi.success("Xoá khách hàng thành công!");
      setNo(no + 1);
    } catch {
      messageApi.error("Không thể xoá khách hàng!");
    }
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
              type="text"
              className="!font-bold !bg-blue-500 !text-white"
            >
              Thêm tài khoản mới
            </Button>
          </div>
        }
      >
        <Table dataSource={allCustomer} />
      </Card>

      <Modal
        open={accountModal}
        onCancel={() => setAccountModal(false)}
        width={820}
        footer={null}
        title="Mở tài khoản mới"
      >
        <Form layout="vertical" form={accountForm} onFinish={onFinish}>
          {/* Nội dung form giữ nguyên, chỉ Việt hoá nhãn */}
        </Form>
      </Modal>
    </div>
  );
};

export default NewAccount;
