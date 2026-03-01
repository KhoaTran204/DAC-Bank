import { Button, Card, Form, Input, message } from "antd";
import Adminlayout from "../../Layout/Adminlayout";
import { EditFilled } from "@ant-design/icons";
import { http, trimData } from "../../../modules/modules";
import { useState, useEffect } from "react";
import Password from "antd/es/input/Password";

const { Item } = Form;

const Branding = () => {
  const [bankForm] = Form.useForm();
  const [messageApi, contex] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [brandings, setBrandings] = useState(null);
  const [no, setNo] = useState(0);
  const [edit, setEdit] = useState(false);

  //get app branding data
  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/branding");
        bankForm.setFieldValue(data?.data[0]);
        setBrandings(data?.data[0]);
        setEdit(true);
      } catch (err) {
        messageApi.error("Unable to fetch data !");
      }
    };
    fetcher();
  }, [no]);

  // store bank betails in database
  const onFinish = async (values) => {
    try {
      setLoading(true);
      const finalObj = trimData(values);
      finalObj.bankLogo = photo ? photo : "bankImages/dummy.png";
      let userInfo = {
        fullname: finalObj.fullname,
        email: finalObj.email,
        password: finalObj.password,
        userType: "admin",
        isActive: true,
        profile: "bankImages/dummy.png",
      };

      const httpReq = http();
      await httpReq.post("/api/branding", finalObj);
      await httpReq.post("/api/users", userInfo);
      messageApi.success("Branding created sussessful !");
      bankForm.resetFields();
      setPhoto(null);
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Unable to store branding!");
    } finally {
      setLoading(false);
    }
  };

  // update bank betails in database
  const onUpdate = async (values) => {
    try {
      setLoading(true);
      const finalObj = trimData(values);
      if (photo) {
        finalObj.bankLogo = photo;
      }

      const httpReq = http();
      await httpReq.put(`/api/branding/${brandings._id}`, finalObj);
      messageApi.success("Branding update sussessful !");
      bankForm.resetFields();
      setPhoto(null);
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Unable to update branding!");
    } finally {
      setLoading(false);
    }
  };

  //handle upload
  const handleUpload = async (e) => {
    try {
      let file = e.target.files[0];
      const formData = new FormData();
      formData.append("photo", file);
      const httpReq = http();
      const { data } = await httpReq.post("/api/upload", formData);
      setPhoto(data.filePath);
    } catch (err) {
      messageApi.error("Unable to upload !");
    }
  };

  return (
    <Adminlayout>
      {contex}
      <Card
        title="Bank Details"
        extra={<Button onClick={() => setEdit(!edit)} icon={<EditFilled />} />}
      >
        <Form
          form={bankForm}
          layout="vertical"
          onFinish={brandings ? onUpdate : onFinish}
          disabled={edit}
        >
          <div className="grid md:grid-cols-3 gap-x-3">
            <Item
              label="Bank Name"
              name="bankName"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>
            <Item
              label="Bank Tagline"
              name="bankTagline"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>
            <Item label="Bank Logo" name="xyz">
              <Input type="file" onChange={handleUpload} />
            </Item>
            <Item
              label="Bank Acount No"
              name="bankAccountNo"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>
            <Item
              label="Bank Acount Transaction Id"
              name="bankTransactionId"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>
            <Item
              label="Bank Address"
              name="bankAddress"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>
            <div
              className={`${
                brandings
                  ? "hidden"
                  : "md:col-span-3 grid md:grid-cols-3 gap-x-3"
              }`}
            >
              <Item
                label="Admin Fullname"
                name="fullname"
                rules={[{ required: brandings ? false : true }]}
              >
                <Input />
              </Item>
              <Item
                label="Admin Email"
                name="email"
                rules={[{ required: brandings ? false : true }]}
              >
                <Input />
              </Item>
              <Item
                label="Admin Password"
                name="password"
                rules={[{ required: brandings ? false : true }]}
              >
                <Input.Password />
              </Item>
            </div>
            <Item label="Bank LinkedIn" name="bankLinkedIn">
              <Input type="url" />
            </Item>
            <Item label="Bank Twitter" name="bankTwitter">
              <Input type="url" />
            </Item>
            <Item label="Bank Facebook" name="bankFacebook">
              <Input type="url" />
            </Item>
          </div>
          <Item label="Bank description" name="bankDesc">
            <Input.TextArea />
          </Item>
          {brandings ? (
            <Item className="flex justify-end items-center">
              <Button
                loading={loading}
                type="text"
                htmlType="submit"
                className="!bg-rose-500 !text-white !font-bold"
              >
                Update
              </Button>
            </Item>
          ) : (
            <Item className="flex justify-end items-center">
              <Button
                loading={loading}
                type="text"
                htmlType="submit"
                className="!bg-blue-500 !text-white !font-bold"
              >
                Submit
              </Button>
            </Item>
          )}
        </Form>
      </Card>
    </Adminlayout>
  );
};
export default Branding;
