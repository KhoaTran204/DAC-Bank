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
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { trimData, http } from "../../../modules/modules";

import swal from "sweetalert";
import { useState } from "react";
import { useEffect } from "react";
import { data } from "react-router-dom";

// import Item from "antd/es/list/Item";

const { Item } = Form;

const Currency = () => {
  // state collection
  const [currencyForm] = Form.useForm();
  const [messageApi, contex] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [allCurrency, setAllCurrency] = useState([]);
  const [edit, setEdit] = useState(null);
  const [no, setNo] = useState(0);

  //get app employee data
  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/currency");
        setAllCurrency(data.data);
      } catch (err) {
        messageApi.error("Unable to fetch data !");
      }
    };
    fetcher();
  }, [no]);

  // create new employee
  const onFinish = async (values) => {
    try {
      setLoading(true);
      let finalObj = trimData(values);
      finalObj.key = finalObj.currencyName;
      const httpReq = http();
      const { data } = await httpReq.post(`/api/currency`, finalObj);

      messageApi.success("Currency created !");
      currencyForm.resetFields();

      setNo(no + 1);
    } catch (err) {
      if (err?.response?.data?.error?.code === 11000) {
        currencyForm.setFields([
          {
            name: "currencyName",
            errors: ["Currency already exists !"],
          },
        ]);
      } else {
        messageApi.error("Try again later !");
      }
    } finally {
      setLoading(false);
    }
  };

  // delete employee
  const onDeleteCurrency = async (id) => {
    try {
      const httpReq = http();
      await httpReq.delete(`/api/currency/${id}`);
      messageApi.success("Delete successfully !");
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Unable to delete currency !");
    }
  };

  //update employee
  const onEditCurrency = async (obj) => {
    setEdit(obj);
    currencyForm.setFieldsValue(obj);
  };

  const onUpdate = async (values) => {
    try {
      setLoading(true);

      let finalObj = trimData(values);
      const httpReq = http();
      await httpReq.put(`/api/currency/${edit._id}`, finalObj);
      messageApi.success("Currency update successfully !");
      setNo(no + 1);
      setEdit(null);
      currencyForm.resetFields();
    } catch (err) {
      messageApi.error("Unable to update currency");
    } finally {
      setLoading(false);
    }
  };

  // columns for table
  const columns = [
    {
      title: "Currency Name",
      dataIndex: "currencyName",
      key: "currencyName",
    },
    {
      title: "Currency Description",
      dataIndex: "currencyDesc",
      key: "currencyDesc",
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_, obj) => (
        <div className="flex gap-1">
          <Popconfirm
            title="Are you sure ?"
            description="Once you update, you can also re-update !"
            onCancel={() => messageApi.info("No chances occur  !")}
            onConfirm={() => onEditCurrency(obj)}
          >
            <Button
              type="text"
              className="!bg-green-100 !text-green-500"
              icon={<EditOutlined />}
            />
          </Popconfirm>
          <Popconfirm
            title="Are you sure ?"
            description="Once you delete, you can't also re-update !"
            onCancel={() => messageApi.info("Your data is safe !")}
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
        <Card title="Add new Currency">
          <Form
            form={currencyForm}
            onFinish={edit ? onUpdate : onFinish}
            layout="vertical"
          >
            <Item
              name="currencyName"
              label="Currency Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>
            <Item name="currencyDesc" label="Currency Description">
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
                  Update
                </Button>
              ) : (
                <Button
                  loading={loading}
                  type="text"
                  htmlType="submit"
                  className="!bg-blue-500 !text-white !font-bold !w-full"
                >
                  Submit
                </Button>
              )}
            </Item>
          </Form>
        </Card>
        <Card
          className="md:col-span-2"
          title="Currency list"
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
