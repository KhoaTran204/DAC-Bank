import {
  Button,
  Card,
  Form,
  Image,
  Input,
  message,
  Popconfirm,
  Select,
  Table,
} from "antd";
import Adminlayout from "../../Layout/Adminlayout";
import {
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  trimData,
  http,
  fetchData,
  uploadFile,
} from "../../../modules/modules";

import swal from "sweetalert";
import { useState } from "react";
import { useEffect } from "react";
import useSWR from "swr";

const { Item } = Form;

const NewEmployee = () => {
  // state collection
  const [empForm] = Form.useForm();
  const [messageApi, contex] = message.useMessage();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allEmployee, setAllEmployee] = useState([]);
  const [finalEmployee, setFinalEmployee] = useState([]);
  const [allBranch, setAllBranch] = useState([]);
  const [edit, setEdit] = useState(null);
  const [no, setNo] = useState(0);

  // lấy dữ liệu chi nhánh
  const { data: branches } = useSWR("/api/branch", fetchData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 1200000,
  });

  useEffect(() => {
    if (branches) {
      let filter = branches?.data.map((item) => ({
        label: item.branchName,
        value: item.branchName,
        key: item.key,
      }));
      setAllBranch(filter);
    }
  }, [branches]);

  // lấy danh sách nhân viên
  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/users");
        setAllEmployee(
          data?.data.filter((item) => item.userType != "customer")
        );
        setFinalEmployee(data.data);
      } catch (err) {
        messageApi.error("Không thể tải dữ liệu !");
      }
    };
    fetcher();
  }, [no]);

  // tạo nhân viên mới
  const onFinish = async (values) => {
    try {
      setLoading(true);
      let finalObj = trimData(values);
      finalObj.profile = photo ? photo : "bankImages/dummy.png";
      finalObj.key = finalObj.email;
      finalObj.userType = "employee";
      const httpReq = http();
      await httpReq.post(`/api/users`, finalObj);

      const obj = {
        email: finalObj.email,
        password: finalObj.password,
      };
      await httpReq.post(`/api/send-email`, obj);

      messageApi.success("Tạo nhân viên thành công !");
      empForm.resetFields();
      setPhoto(null);
      setNo(no + 1);
    } catch (err) {
      if (err?.response?.data?.error?.code === 11000) {
        empForm.setFields([
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

  // cập nhật trạng thái hoạt động
  const updateIsActive = async (id, isActive) => {
    try {
      const obj = { isActive: !isActive };
      const httpReq = http();
      await httpReq.put(`/api/users/${id}`, obj);
      messageApi.success("Cập nhật trạng thái thành công !");
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Không thể cập nhật trạng thái !");
    }
  };

  // chỉnh sửa nhân viên
  const onEditUser = async (obj) => {
    setEdit(obj);
    empForm.setFieldsValue(obj);
  };

  const onUpdate = async (values) => {
    try {
      setLoading(true);
      let finalObj = trimData(values);
      delete finalObj.password;
      if (photo) finalObj.profile = photo;

      const httpReq = http();
      await httpReq.put(`/api/users/${edit._id}`, finalObj);

      messageApi.success("Cập nhật nhân viên thành công !");
      setNo(no + 1);
      setEdit(null);
      setPhoto(null);
      empForm.resetFields();
    } catch (err) {
      messageApi.error("Không thể cập nhật nhân viên !");
    } finally {
      setLoading(false);
    }
  };

  // xoá nhân viên
  const onDeleteUser = async (id) => {
    try {
      const httpReq = http();
      await httpReq.delete(`/api/users/${id}`);
      messageApi.success("Xoá thành công !");
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Không thể xoá nhân viên !");
    }
  };

  // upload ảnh
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const folderName = "employeePhoto";

    try {
      const result = await uploadFile(file, folderName);
      setPhoto(result.filePath);
    } catch (err) {
      messageApi.error("Tải ảnh thất bại !");
    }
  };

  // tìm kiếm
  const onSearh = (e) => {
    let value = e.target.value.trim().toLowerCase();
    let filter = finalEmployee?.filter(
      (emp) =>
        emp?.fullname.toLowerCase().includes(value) ||
        emp?.userType.toLowerCase().includes(value) ||
        emp?.email.toLowerCase().includes(value) ||
        emp?.branch.toLowerCase().includes(value) ||
        emp?.mobile.toLowerCase().includes(value) ||
        emp?.address.toLowerCase().includes(value)
    );
    setAllEmployee(filter);
  };

  // cột bảng
  const columns = [
    {
      title: "Ảnh đại diện",
      key: "profile",
      render: (src, obj) => (
        <Image
          src={`${import.meta.env.VITE_BASEURL}/${obj.profile}`}
          className="rounded-full"
          width={40}
          height={40}
        />
      ),
    },
    {
      title: "Loại tài khoản",
      dataIndex: "userType",
      key: "userType",
      render: (text) => {
        if (text === "admin")
          return <span className="capitalize text-indigo-500">Quản trị</span>;
        if (text === "employee")
          return <span className="capitalize text-green-500">Nhân viên</span>;
        return <span className="capitalize text-red-500">Khách hàng</span>;
      },
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
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      render: (_, obj) => (
        <div className="flex gap-1">
          <Popconfirm
            title="Bạn có chắc chắn không ?"
            description="Bạn có thể cập nhật lại sau."
            onCancel={() => messageApi.info("Không có thay đổi nào !")}
            onConfirm={() => updateIsActive(obj._id, obj.isActive)}
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

          <Popconfirm
            title="Bạn có chắc chắn không ?"
            description="Bạn có thể chỉnh sửa lại sau."
            onConfirm={() => onEditUser(obj)}
          >
            <Button
              type="text"
              className="!bg-green-100 !text-green-500"
              icon={<EditOutlined />}
            />
          </Popconfirm>

          <Popconfirm
            title="Bạn có chắc chắn muốn xoá ?"
            description="Sau khi xoá sẽ không thể khôi phục."
            onCancel={() => messageApi.info("Dữ liệu của bạn vẫn an toàn !")}
            onConfirm={() => onDeleteUser(obj._id)}
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

  return (
    <Adminlayout>
      {contex}
      <div className="grid md:grid-cols-3 gap-3">
        <Card title="Thêm nhân viên mới">
          <Form
            form={empForm}
            onFinish={edit ? onUpdate : onFinish}
            layout="vertical"
          >
            <Item
              name="branch"
              label="Chọn chi nhánh"
              rules={[{ required: true }]}
            >
              <Select placeholder="Chọn chi nhánh" options={allBranch} />
            </Item>

            <Item label="Ảnh đại diện" name="xyz">
              <Input onChange={handleUpload} type="file" />
            </Item>

            <div className="grid md:grid-cols-2 gap-x2">
              <Item
                name="fullname"
                label="Họ và tên"
                rules={[{ required: true }]}
              >
                <Input />
              </Item>

              <Item
                name="mobile"
                label="Số điện thoại"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Item>

              <Item name="email" label="Email" rules={[{ required: true }]}>
                <Input disabled={!!edit} />
              </Item>

              <Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true }]}
              >
                <Input disabled={!!edit} />
              </Item>

              <Item name="address" label="Địa chỉ">
                <Input.TextArea />
              </Item>
            </div>

            <Item>
              <Button
                loading={loading}
                type="text"
                htmlType="submit"
                className={`${
                  edit ? "!bg-rose-500" : "!bg-blue-500"
                } !text-white !font-bold !w-full`}
              >
                {edit ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Item>
          </Form>
        </Card>

        <Card
          className="md:col-span-2"
          title="Danh sách nhân viên"
          style={{ overflowX: "auto" }}
          extra={
            <Input
              placeholder="Tìm kiếm tất cả"
              prefix={<SearchOutlined />}
              onChange={onSearh}
            />
          }
        >
          <Table
            columns={columns}
            dataSource={allEmployee}
            scroll={{ x: "max-content" }}
          />
        </Card>
      </div>
    </Adminlayout>
  );
};

export default NewEmployee;
