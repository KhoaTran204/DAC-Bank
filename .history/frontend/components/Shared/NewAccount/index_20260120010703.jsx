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
  // get userInfo from sessionStorage
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const [accountForm] = Form.useForm();
  const [messageApi, contex] = message.useMessage();

  // states collections
  const [accountModal, setAccountModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [signature, setSignature] = useState(null);
  const [document, setDocument] = useState(null);
  const [allCustomer, setAllCustomer] = useState(null);
  const [finalCustomer, setFinalCustomer] = useState(null);
  const [edit, setEdit] = useState(null);

  const [no, setNo] = useState(0);

  // get branding details
  const { data: brandings, error: bError } = useSWR(
    "/api/branding",
    fetchData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 1200000,
    },
  );
  //get customer data
  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/customers");
        setAllCustomer(
          data?.data?.filter((item) => item.branch == userInfo.branch),
        );
        setFinalCustomer(
          data?.data?.filter((item) => item.branch == userInfo.branch),
        );
      } catch (err) {
        messageApi.error("Không thể tải dữ liệu khách hàng!");
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

  // create new account
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
      console.log(finalObj);
      const { data } = await httpReq.post(`/api/users`, finalObj);
      finalObj.customerLoginId = data?.data?._id;
      const obj = {
        email: finalObj.email,
        password: finalObj.password,
      };
      await httpReq.post("/api/customers", finalObj);
      await httpReq.post(`/api/send-email`, obj);
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

  //handle photo
  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    const folderName = "customerPhoto";

    try {
      const result = await uploadFile(file, folderName);
      setPhoto(result.filePath);
    } catch (err) {
      messageApi.error("Tải thất bại!");
    }
  };
  //handle Signature
  const handleSignature = async (e) => {
    const file = e.target.files[0];
    const folderName = "customerSignature";

    try {
      const result = await uploadFile(file, folderName);
      setSignature(result.filePath);
    } catch (err) {
      messageApi.error("Tải thất bại!");
    }
  };
  //handle Document
  const handleDocument = async (e) => {
    const file = e.target.files[0];
    const folderName = "customerDocument";

    try {
      const result = await uploadFile(file, folderName);
      setDocument(result.filePath);
    } catch (err) {
      messageApi.error("Tải thất bại!");
    }
  };

  //update is active
  const updateIsActive = async (id, isActive, loginId) => {
    try {
      const obj = {
        isActive: !isActive,
      };
      const httpReq = http();
      await httpReq.put(`/api/users/${loginId}`, obj);
      await httpReq.put(`/api/customers/${id}`, obj);
      messageApi.success("Cập nhật trạng thái thành công!");
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Không thể cập nhật trạng thái!");
    }
  };

  // search coding
  const onSearh = (e) => {
    const value = e.target.value.trim().toLowerCase();

    // nếu không nhập gì → trả lại dữ liệu gốc
    if (!value) {
      setAllCustomer(finalCustomer);
      return;
    }

    const filter =
      finalCustomer &&
      finalCustomer.filter((cust) => {
        return (
          cust?.fullname?.toLowerCase().includes(value) ||
          cust?.userType?.toLowerCase().includes(value) ||
          cust?.email?.toLowerCase().includes(value) ||
          cust?.branch?.toLowerCase().includes(value) ||
          cust?.mobile?.toLowerCase().includes(value) ||
          cust?.address?.toLowerCase().includes(value) ||
          cust?.createdBy?.toLowerCase().includes(value) ||
          cust?.accountNo?.toString().includes(value) ||
          cust?.finalBalance?.toString().includes(value) ||
          cust?.bankCardNo?.toString().includes(value)
        );
      });

    setAllCustomer(filter);
  };

  // update customer
  const onEditCustomer = async (obj) => {
    setEdit(obj);
    setAccountModal(true);
    accountForm.setFieldsValue(obj);
  };
  const onUpdate = async (values) => {
    try {
      setLoading(true);
      let finalObj = trimData(values);
      delete finalObj.password;
      delete finalObj.email;
      delete finalObj.accountNo;
      if (photo) {
        finalObj.profile = photo;
      }
      if (signature) {
        finalObj.signature = signature;
      }
      if (document) {
        finalObj.document = document;
      }
      const httpReq = http();
      await httpReq.put(`/api/customers/${edit._id}`, finalObj);
      messageApi.success("Cập nhật người dùng thành công");
      setNo(no + 1);
      setEdit(null);
      setPhoto(null);
      setSignature(null);
      setDocument(null);
      setAccountModal(false);
      accountForm.resetFields();
    } catch (err) {
      messageApi.error("Cập nhật người dùng thành công");
    } finally {
      setLoading(false);
    }
  };
  // delete customer
  const onDeleteCustomer = async (id, loginId) => {
    try {
      const httpReq = http();
      await httpReq.delete(`/api/users/${loginId}`);
      await httpReq.delete(`/api/customers/${id}`);
      messageApi.success("Xoá khách hàng thành công!");
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Không thể xoá khách hàng!");
    }
  };

  // columns for table
  const columns = [
    {
      title: "Ảnh đại diện",
      key: "photo",
      render: (src, obj) => (
        <Image
          src={`${import.meta.env.VITE_BASEURL}/${obj?.profile}`}
          className="rounded-full"
          width={40}
          height={40}
        />
      ),
    },
    {
      title: "Chữ ký",
      key: "signature",
      render: (src, obj) => (
        <Image
          src={`${import.meta.env.VITE_BASEURL}/${obj?.signature}`}
          className="rounded-full"
          width={40}
          height={40}
        />
      ),
    },
    {
      title: "Tài liệu",
      key: "document",
      render: (src, obj) => (
        <Button
          type="text"
          shape="circle"
          className="!bg-blue-100 !text-blue-500"
          icon={<DownloadOutlined />}
          onClick={() =>
            window.open(
              `${import.meta.env.VITE_BASEURL}/${obj?.document}`,
              "_blank",
            )
          }
        />
      ),
    },
    {
      title: "Chi nhánh",
      dataIndex: "branch",
      key: "branch",
    },
    {
      title: "Loại người dùng",
      dataIndex: "userType",
      key: "userType",
      render: (text) => {
        if (text === "admin") {
          return <span className="capitalize text-indigo-500">{text}</span>;
        } else if (text === "employee") {
          return <span className="capitalize text-green-500">{text}</span>;
        } else {
          return <span className="capitalize text-red-500">{text}</span>;
        }
      },
    },
    {
      title: "STT",
      dataIndex: "accountNo",
      key: "accountNo",
    },

    // ✅ CỘT MỚI – BANK CARD NUMBER
    {
      title: "Số thẻ ngân hàng",
      dataIndex: "bankCardNo",
      key: "bankCardNo",
    },
    {
      title: "Số CDCD",
      dataIndex: "fathername",
      key: "fathername",
    },

    {
      title: "Số dư",
      dataIndex: "finalBalance",
      key: "finalBalance",
    },
    {
      title: "Họ và tên",
      dataIndex: "fullname",
      key: "fullname",
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      key: "dob",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "SDT",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Tạo bởi",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Trạng thái",
      key: "action",
      fixed: "right",
      render: (_, obj) => (
        <div className="flex gap-1">
          {/* ===== KÍCH HOẠT / VÔ HIỆU HOÁ ===== */}
          <Popconfirm
            title="Bạn có chắc chắn không?"
            description="Sau khi cập nhật, bạn vẫn có thể thay đổi lại."
            onCancel={() => messageApi.info("Không có thay đổi nào xảy ra!")}
            onConfirm={() =>
              updateIsActive(obj._id, obj.isActive, obj.customerLoginId)
            }
          >
            <Button
              type="text"
              className={`${
                obj.isActive
                  ? "!bg-indigo-100 !text-indigo-500"
                  : "!bg-pink-100 !text-pink-500"
              }`}
              icon={obj.isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            />
          </Popconfirm>

          {/* ===== CHỈNH SỬA ===== */}
          <Popconfirm
            title="Bạn có chắc chắn không?"
            description="Bạn có thể chỉnh sửa lại thông tin sau đó."
            onCancel={() => messageApi.info("Không có thay đổi nào xảy ra!")}
            onConfirm={() => onEditCustomer(obj)}
          >
            <Button
              type="text"
              className="!bg-green-100 !text-green-500"
              icon={<EditOutlined />}
            />
          </Popconfirm>

          {/* ===== XOÁ ===== */}
          <Popconfirm
            title="Bạn có chắc chắn không?"
            description="Sau khi xoá, dữ liệu sẽ không thể khôi phục!"
            onCancel={() => messageApi.info("Dữ liệu của bạn vẫn an toàn!")}
            onConfirm={() => onDeleteCustomer(obj._id, obj.customerLoginId)}
          >
            <Button
              type="text"
              className="!bg-rose-100 !text-rose-500"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const onCloseModal = () => {
    setAccountModal(false);
    setEdit(null);
    accountForm.resetFields();
  };

  return (
    <div>
      {contex}
      <div className="grid">
        <Card
          title="Danh sách tài khoản"
          style={{ overflowX: "auto" }}
          extra={
            <div className="flex gap-x-3">
              <Input
                placeholder="Tìm kiếm theo tất cả"
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
          <Table
            columns={columns}
            dataSource={allCustomer}
            scroll={{ x: "max-content" }}
          />
        </Card>
      </div>

      <Modal
        open={accountModal}
        onCancel={onCloseModal}
        width={820}
        footer={null}
        title="Mở tài khoản mới"
      >
        <Form
          layout="vertical"
          onFinish={edit ? onUpdate : onFinish}
          form={accountForm}
        >
          {/* ===== PHẦN THÊM MỚI – KHÔNG ẢNH HƯỞNG FORM GỐC ===== */}
          {!edit && (
            <div className="grid md:grid-cols-3 gap-x-3">
              <Item
                label="Ngân hàng"
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
                <Input placeholder="Nhập số thẻ ngân hàng" />
              </Item>
            </div>
          )}

          {/* ===== FORM GỐC – GIỮ NGUYÊN ===== */}
          {!edit && (
            <div className="grid md:grid-cols-3 gap-x-3">
              <Item
                label="Số tài khoản"
                name="accountNo"
                rules={[{ required: true }]}
              >
                <Input disabled placeholder="Số tài khoản" />
              </Item>

              <Item label="Email" name="email" rules={[{ required: true }]}>
                <Input
                  disabled={edit ? true : false}
                  placeholder="Nhập email"
                />
              </Item>

              <Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: edit ? false : true }]}
              >
                <Input
                  disabled={edit ? true : false}
                  placeholder="Nhập mật khẩu"
                />
              </Item>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-x-3">
            <Item
              label="Họ và tên"
              name="fullname"
              rules={[{ required: true }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Item>

            <Item
              label="Số điện thoại"
              name="mobile"
              rules={[{ required: true }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Item>

            <Item label="CDCD" name="fathername" rules={[{ required: true }]}>
              <Input placeholder="Nhập số CDCD" />
            </Item>

            <Item label="Ngày sinh" name="dob" rules={[{ required: true }]}>
              <Input type="date" />
            </Item>

            <Item label="Giới tính" name="gender" rules={[{ required: true }]}>
              <Select
                placeholder="Chọn giới tính"
                options={[
                  { label: "Nam", value: "male" },
                  { label: "Nữ", value: "female" },
                ]}
              />
            </Item>

            <Item
              label="Loại tiền tệ"
              name="currency"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Chọn loại tiền tệ"
                options={[
                  { label: "VND", value: "vnd" },
                  { label: "USD", value: "usd" },
                ]}
              />
            </Item>

            <Item label="Ảnh cá nhân" name="xyz">
              <Input type="file" onChange={handlePhoto} />
            </Item>

            <Item label="Chữ ký" name="dfr">
              <Input type="file" onChange={handleSignature} />
            </Item>

            <Item label="Tài liệu" name="hus">
              <Input type="file" onChange={handleDocument} />
            </Item>
          </div>

          <Item label="Địa chỉ" name="address" rules={[{ required: true }]}>
            <Input.TextArea />
          </Item>

          <Item className="flex justify-end items-center">
            <Button
              loading={loading}
              type="text"
              htmlType="submit"
              className="!font-semibold !text-white !bg-blue-500"
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
