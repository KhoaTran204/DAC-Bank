import { Button, Card, Form, Input, message, Popconfirm, Table } from "antd";
import Adminlayout from "../../Layout/Adminlayout";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { trimData, http } from "../../../modules/modules";
import { useState, useEffect } from "react";

const { Item } = Form;

const Currency = () => {
  // state collection
  const [currencyForm] = Form.useForm();
  const [messageApi, contex] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [allCurrency, setAllCurrency] = useState([]);
  const [edit, setEdit] = useState(null);
  const [no, setNo] = useState(0);

  // lấy danh sách tiền tệ
  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/currency");
        setAllCurrency(data.data);
      } catch (err) {
        messageApi.error("Không thể tải dữ liệu!");
      }
    };
    fetcher();
  }, [no]);

  // tạo mới tiền tệ
  const onFinish = async (values) => {
    try {
      setLoading(true);
      let finalObj = trimData(values);
      finalObj.key = finalObj.currencyName;

      const httpReq = http();
      await httpReq.post(`/api/currency`, finalObj);

      messageApi.success("Tạo loại tiền tệ thành công!");
      currencyForm.resetFields();
      setNo(no + 1);
    } catch (err) {
      if (err?.response?.data?.error?.code === 11000) {
        currencyForm.setFields([
          {
            name: "currencyName",
            errors: ["Loại tiền tệ đã tồn tại!"],
          },
        ]);
      } else {
        messageApi.error("Vui lòng thử lại sau!");
      }
    } finally {
      setLoading(false);
    }
  };

  // xoá tiền tệ
  const onDeleteCurrency = async (id) => {
    try {
      const httpReq = http();
      await httpReq.delete(`/api/currency/${id}`);
      messageApi.success("Xoá thành công!");
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Không thể xoá loại tiền tệ!");
    }
  };

  // chỉnh sửa tiền tệ
  const onEditCurrency = async (obj) => {
    setEdit(obj);
    currencyForm.setFieldsValue(obj);
  };

  // cập nhật tiền tệ
  const onUpdate = async (values) => {
    try {
      setLoading(true);
      let finalObj = trimData(values);

      const httpReq = http();
      await httpReq.put(`/api/currency/${edit._id}`, finalObj);

      messageApi.success("Cập nhật loại tiền tệ thành công!");
      setNo(no + 1);
      setEdit(null);
      currencyForm.resetFields();
    } catch (err) {
      messageApi.error("Không thể cập nhật loại tiền tệ!");
    } finally {
      setLoading(false);
    }
  };

  // cột bảng
  const columns = [
    {
      title: "Tên loại tiền tệ",
      dataIndex: "currencyName",
      key: "currencyName",
    },
    {
      title: "Mô tả",
      dataIndex: "currencyDesc",
      key: "currencyDesc",
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right",
      render: (_, obj) => (
        <div className="flex gap-1">
          <Popconfirm
            title="Bạn có chắc chắn không?"
            description="Sau khi chỉnh sửa, bạn vẫn có thể chỉnh sửa lại."
            onCancel={() => messageApi.info("Không có thay đổi nào xảy ra!")}
            onConfirm={() => onEditCurrency(obj)}
          >
            <Button
              type="text"
              className="!bg-green-100 !text-green-500"
              icon={<EditOutlined />}
            />
          </Popconfirm>

          <Popconfirm
            title="Bạn có chắc chắn không?"
            description="Sau khi xoá, dữ liệu sẽ không thể khôi phục."
            onCancel={() => messageApi.info("Dữ liệu của bạn vẫn an toàn!")}
            onConfirm={() => onDeleteCurrency(obj._id)}
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
        <Card title="Thêm loại tiền tệ mới">
          <Form
            form={currencyForm}
            onFinish={edit ? onUpdate : onFinish}
            layout="vertical"
          >
            <Item
              name="currencyName"
              label="Tên loại tiền tệ"
              rules={[
                { required: true, message: "Vui lòng nhập tên tiền tệ!" },
              ]}
            >
              <Input />
            </Item>

            <Item name="currencyDesc" label="Mô tả loại tiền tệ">
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
          title="Danh sách loại tiền tệ"
          style={{ overflowX: "auto" }}
        >
          <Table
            columns={columns}
            dataSource={allCurrency}
            scroll={{ x: "max-content" }}
          />
        </Card>
      </div>
    </Adminlayout>
  );
};

export default Currency;
