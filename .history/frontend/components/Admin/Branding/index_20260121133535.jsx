import {
  Button,
  Card,
  Form,
  Image,
  Input,
  message,
  Popconfirm,
  Table,
} from "antd";
import Adminlayout from "../../Layout/Adminlayout";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { http, uploadFile } from "../../../modules/modules";

const { Item } = Form;

const Branding = () => {
  /* ================= STATE ================= */
  const [form] = Form.useForm();
  const [edit, setEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  /* ================= FETCH DATA ================= */
  const fetcher = async () => {
    const res = await http.get("/branding");
    return res.data;
  };

  const { data, mutate } = useSWR("/branding", fetcher);

  /* ================= CREATE ================= */
  const onCreate = async (values) => {
    setLoading(true);
    try {
      if (values.logo?.file) {
        values.logo = await uploadFile(values.logo.file);
      }
      await http.post("/branding/create", values);
      message.success("Them moi branding thanh cong");
      form.resetFields();
      mutate();
    } catch (err) {
      message.error("Them moi that bai");
    }
    setLoading(false);
  };

  /* ================= UPDATE ================= */
  const onUpdate = async (values) => {
    setLoading(true);
    try {
      if (values.logo?.file) {
        values.logo = await uploadFile(values.logo.file);
      }
      await http.put(`/branding/update/${edit.id}`, values);
      message.success("Cap nhat branding thanh cong");
      setEdit(null);
      form.resetFields();
      mutate();
    } catch (err) {
      message.error("Cap nhat that bai");
    }
    setLoading(false);
  };

  /* ================= DELETE ================= */
  const onDelete = async (id) => {
    try {
      await http.delete(`/branding/delete/${id}`);
      message.success("Xoa thanh cong");
      mutate();
    } catch (err) {
      message.error("Xoa that bai");
    }
  };

  /* ================= TABLE ================= */
  const columns = [
    {
      title: "Ten thuong hieu",
      dataIndex: "name",
    },
    {
      title: "Logo",
      dataIndex: "logo",
      render: (logo) => (logo ? <Image width={60} src={logo} /> : "Khong co"),
    },
    {
      title: "Trang thai",
      dataIndex: "status",
      render: (status) =>
        status ? (
          <EyeOutlined style={{ color: "green" }} />
        ) : (
          <EyeInvisibleOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "Hanh dong",
      render: (_, record) => (
        <div className="flex gap-2">
          {/* ===== CHINH SUA RIENG BIET ===== */}
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEdit(record);
              form.setFieldsValue(record);
            }}
          />

          {/* ===== XOA ===== */}
          <Popconfirm
            title="Ban co chac muon xoa?"
            onConfirm={() => onDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  /* ================= UI ================= */
  return (
    <Adminlayout>
      <Card title="Quan ly Branding">
        {showForm && (
          <Form
            form={form}
            layout="vertical"
            onFinish={edit ? onUpdate : onCreate}
          >
            <Item
              name="name"
              label="Ten thuong hieu"
              rules={[{ required: true }]}
            >
              <Input placeholder="Nhap ten branding" />
            </Item>

            <Item name="logo" label="Logo">
              <Input type="file" />
            </Item>

            <Item name="status" label="Trang thai">
              <Input placeholder="1 = hien, 0 = an" />
            </Item>

            <Item className="flex justify-end gap-2">
              {edit && (
                <Button
                  danger
                  onClick={() => {
                    setEdit(null);
                    form.resetFields();
                  }}
                >
                  Huy chinh sua
                </Button>
              )}

              <Button
                loading={loading}
                htmlType="submit"
                className={`${
                  edit ? "!bg-rose-500" : "!bg-blue-500"
                } !text-white !font-bold`}
              >
                {edit ? "Cap nhat" : "Luu thong tin"}
              </Button>
            </Item>
          </Form>
        )}
      </Card>

      <Card className="mt-6">
        <Table rowKey="id" columns={columns} dataSource={data || []} />
      </Card>
    </Adminlayout>
  );
};

export default Branding;
