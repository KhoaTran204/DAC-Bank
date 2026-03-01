import { Button, Card, Form, Input, message, Popconfirm, Table } from "antd";
import Adminlayout from "../../Layout/Adminlayout";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { trimData, http } from "../../../modules/modules";

import { useState, useEffect } from "react";

const { Item } = Form;

const Branch = () => {
  // state collection
  const [branchForm] = Form.useForm();
  const [messageApi, contex] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [allBranch, setAllBranch] = useState([]);
  const [edit, setEdit] = useState(null);
  const [no, setNo] = useState(0);

  // lấy danh sách chi nhánh
  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/branch");
        setAllBranch(data.data);
      } catch (err) {
        messageApi.error("Không thể tải dữ liệu!");
      }
    };
    fetcher();
  }, [no]);

  // tạo chi nhánh mới
  const onFinish = async (values) => {
    try {
      setLoading(true);
      let finalObj = trimData(values);
      finalObj.key = finalObj.branchName;

      const httpReq = http();
      await httpReq.post(`/api/branch`, finalObj);

      messageApi.success("Tạo chi nhánh thành công!");
      branchForm.resetFields();
      setNo(no + 1);
    } catch (err) {
      if (err?.response?.data?.error?.code === 11000) {
        branchForm.setFields([
          {
            name: "branchName",
            errors: ["Chi nhánh đã tồn tại!"],
          },
        ]);
      } else {
        messageApi.error("Vui lòng thử lại sau!");
      }
    } finally {
      setLoading(false);
    }
  };

  // xóa chi nhánh
  const onDeleteBranch = async (id) => {
    try {
      const httpReq = http();
      await httpReq.delete(`/api/branch/${id}`);
      messageApi.success("Xóa chi nhánh thành công!");
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Không thể xóa chi nhánh!");
    }
  };

  // chỉnh sửa chi nhánh
  const onEditBranch = (obj) => {
    setEdit(obj);
    branchForm.setFieldsValue(obj);
  };

  const onUpdate = async (values) => {
    try {
      setLoading(true);
      let finalObj = trimData(values);

      const httpReq = http();
      await httpReq.put(`/api/branch/${edit._id}`, finalObj);

      messageApi.success("Cập nhật chi nhánh thành công!");
      setNo(no + 1);
      setEdit(null);
      branchForm.resetFields();
    } catch (err) {
      messageApi.error("Không thể cập nhật chi nhánh!");
    } finally {
      setLoading(false);
    }
  };

  // cột bảng
  const columns = [
    {
      title: "Tên chi nhánh",
      dataIndex: "branchName",
      key: "branchName",
    },
    {
      title: "Địa chỉ chi nhánh",
      dataIndex: "branchAddress",
      key: "branchAddress",
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right",
      render: (_, obj) => (
        <div className="flex gap-1">
          {/* Cập nhật */}
          <Popconfirm
            title="Bạn có chắc không?"
            description="Sau khi cập nhật, bạn vẫn có thể chỉnh sửa lại."
            onCancel={() => messageApi.info("Không có thay đổi nào xảy ra!")}
            onConfirm={() => onEditBranch(obj)}
          >
            <Button
              type="text"
              className="!bg-green-100 !text-green-500"
              icon={<EditOutlined />}
            />
          </Popconfirm>

          {/* Xóa */}
          <Popconfirm
            title="Bạn có chắc không?"
            description="Sau khi xóa, dữ liệu sẽ không thể khôi phục."
            onCancel={() => messageApi.info("Dữ liệu của bạn vẫn an toàn!")}
            onConfirm={() => onDeleteBranch(obj._id)}
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
        <Card title="Thêm chi nhánh mới">
          <Form
            form={branchForm}
            onFinish={edit ? onUpdate : onFinish}
            layout="vertical"
          >
            <Item
              name="branchName"
              label="Tên chi nhánh"
              rules={[
                { required: true, message: "Vui lòng nhập tên chi nhánh!" },
              ]}
            >
              <Input />
            </Item>

            <Item name="branchAddress" label="Địa chỉ chi nhánh">
              <Input.TextArea />
            </Item>

            <Item>
              {edit ? (
                <Button
                  loading={loading}
                  type="text"
                  htmlType="submit"
                  className="!bg-rose-500 !text-white !font-bold !w-full"
                >
                  Cập nhật
                </Button>
              ) : (
                <Button
                  loading={loading}
                  type="text"
                  htmlType="submit"
                  className="!bg-blue-500 !text-white !font-bold !w-full"
                >
                  Thêm mới
                </Button>
              )}
            </Item>
          </Form>
        </Card>

        <Card
          className="md:col-span-2"
          title="Danh sách chi nhánh"
          style={{ overflowX: "auto" }}
        >
          <Table
            columns={columns}
            dataSource={allBranch}
            rowKey="_id"
            scroll={{ x: "max-content" }}
          />
        </Card>
      </div>
    </Adminlayout>
  );
};

export default Branch;
