import { Button, Card, Form, Input, message } from "antd";
import Adminlayout from "../../Layout/Adminlayout";
import { http, trimData } from "../../../modules/modules";
import { useState } from "react";

const { Item } = Form;

const Branding = () => {
  const [bankForm] = Form.useForm();
  const [messageApi, context] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);

  // tao moi thong tin ngan hang
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

      messageApi.success("Luu thong tin thanh cong!");
      bankForm.resetFields();
      setPhoto(null);
    } catch (err) {
      messageApi.error("Khong the luu thong tin!");
    } finally {
      setLoading(false);
    }
  };

  // upload logo
  const handleUpload = async (e) => {
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("photo", file);

      const httpReq = http();
      const { data } = await httpReq.post("/api/upload", formData);
      setPhoto(data.filePath);
    } catch (err) {
      messageApi.error("Khong the tai anh len!");
    }
  };

  return (
    <Adminlayout>
      {context}
      <Card title="Thong tin ngan hang">
        <Form form={bankForm} layout="vertical" onFinish={onFinish}>
          <div className="grid md:grid-cols-3 gap-x-3">
            <Item
              label="Ten ngan hang"
              name="bankName"
              rules={[
                { required: true, message: "Vui long nhap ten ngan hang!" },
              ]}
            >
              <Input />
            </Item>

            <Item
              label="Khau hieu ngan hang"
              name="bankTagline"
              rules={[{ required: true, message: "Vui long nhap khau hieu!" }]}
            >
              <Input />
            </Item>

            <Item label="Logo ngan hang">
              <Input type="file" onChange={handleUpload} />
            </Item>

            <Item
              label="So tai khoan ngan hang"
              name="bankAccountNo"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>

            <Item
              label="Ma giao dich ngan hang"
              name="bankTransactionId"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>

            <Item
              label="Dia chi ngan hang"
              name="bankAddress"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>

            <Item
              label="Ho ten quan tri vien"
              name="fullname"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>

            <Item
              label="Email quan tri vien"
              name="email"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>

            <Item
              label="Mat khau quan tri vien"
              name="password"
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Item>

            <Item label="LinkedIn ngan hang" name="bankLinkedIn">
              <Input type="url" />
            </Item>

            <Item label="Twitter ngan hang" name="bankTwitter">
              <Input type="url" />
            </Item>

            <Item label="Facebook ngan hang" name="bankFacebook">
              <Input type="url" />
            </Item>
          </div>

          <Item label="Mo ta ngan hang" name="bankDesc">
            <Input.TextArea />
          </Item>

          <Item className="flex justify-end items-center">
            <Button
              loading={loading}
              type="text"
              htmlType="submit"
              className="!bg-blue-500 !text-white !font-bold"
            >
              Luu thong tin
            </Button>
          </Item>
        </Form>
      </Card>
    </Adminlayout>
  );
};

export default Branding;
