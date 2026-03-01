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

const Branch = () => {
  // state collection
  const [branchForm] = Form.useForm();
  const [messageApi, contex] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [allBranch, setAllBranch] = useState([]);
  const [edit, setEdit] = useState(null);
  const [no, setNo] = useState(0);

  //get app employee data
  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/branch");
        setAllBranch(data.data);
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
      finalObj.key = finalObj.branchName;
      const httpReq = http();
      const { data } = await httpReq.post(`/api/branch`, finalObj);

      messageApi.success("Branch created !");
      branchForm.resetFields();

      setNo(no + 1);
    } catch (err) {
      if (err?.response?.data?.error?.code === 11000) {
        branchForm.setFields([
          {
            name: "branchName",
            errors: ["Branch already exists !"],
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
  const onDeleteBranch = async (id) => {
    try {
      const httpReq = http();
      await httpReq.delete(`/api/branch/${id}`);
      messageApi.success("Delete successfully !");
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Unable to delete branch !");
    }
  };

  //update employee
  const onEditBranch = async (obj) => {
    setEdit(obj);
    branchForm.setFieldsValue(obj);
  };

  const onUpdate = async (values) => {
    try {
      setLoading(true);

      let finalObj = trimData(values);
      const httpReq = http();
      await httpReq.put(`/api/branch/${edit._id}`, finalObj);
      messageApi.success("Branch update successfully !");
      setNo(no + 1);
      setEdit(null);
      branchForm.resetFields();
    } catch (err) {
      messageApi.error("Unable to update branch");
    } finally {
      setLoading(false);
    }
  };

  // columns for table
  const columns = [
    {
      title: "Branch Name",
      dataIndex: "branchName",
      key: "branchName",
    },
    {
      title: "Branch Address",
      dataIndex: "branchAddress",
      key: "branchAddress",
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
            onConfirm={() => onEditBranch(obj)}
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
        <Card title="Add new branch">
          <Form
            form={branchForm}
            onFinish={edit ? onUpdate : onFinish}
            layout="vertical"
          >
            <Item
              name="branchName"
              label="Branch Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>
            <Item name="branchAddress" label="Branch Address">
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
          title="Branch list"
          style={{ overflowX: "auto" }}
        >
          <Table
            columns={columns}
            dataSource={allBranch}
            scroll={{ x: "max-content" }}
          />
        </Card>
      </div>
    </Adminlayout>
  );
};
export default Branch;
