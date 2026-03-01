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

  // Tạo mới thông tin ngân hàng
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

      messageApi.success("Lưu thông tin thành công!");
      bankForm.resetFields();
      setPhoto(null);
    } catch (err) {
      messageApi.error("Không thể lưu thông tin!");
    } finally {
      setLoading(false);
    }
  };

  // Upload logo ngân hàng
  const handleUpload = async (e) => {
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("photo", file);

      const httpReq = http();
      const { data } = await httpReq.post("/api/upload", formData);
      setPhoto(data.filePath);
    } catch (err) {
      messageApi.error("Không thể tải ảnh lên!");
    }
  };

  return (
    <Adminlayout>
      {context}
      <Card title="Thông tin ngân hàng">
        <Form form={bankForm} layout="vertical" onFinish={onFinish}>
          <div className="grid md:grid-cols-3 gap-x-3">
            <Item
              label="Tên ngân hàng"
              name="bankName"
              rules={[
                { required: true, message: "Vui lòng nhập tên ngân hàng!" },
              ]}
            >
              <Input />
            </Item>

            <Item
              label="Khẩu hiệu ngân hàng"
              name="bankTagline"
              rules={[{ required: true, message: "Vui lòng nhập khẩu hiệu!" }]}
            >
              <Input />
            </Item>

            <Item label="Logo ngân hàng">
              <Input type="file" onChange={handleUpload} />
            </Item>

            <Item
              label="Số tài khoản ngân hàng"
              name="bankAccountNo"
              rules={[
                { required: true, message: "Vui lòng nhập số tài khoản!" },
              ]}
            >
              <Input />
            </Item>

            <Item
              label="Mã giao dịch ngân hàng"
              name="bankTransactionId"
              rules={[
                { required: true, message: "Vui lòng nhập mã giao dịch!" },
              ]}
            >
              <Input />
            </Item>

            <Item
              label="Địa chỉ ngân hàng"
              name="bankAddress"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            >
              <Input />
            </Item>

            <Item
              label="Họ tên quản trị viên"
              name="fullname"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input />
            </Item>

            <Item
              label="Email quản trị viên"
              name="email"
              rules={[{ required: true, message: "Vui lòng nhập email!" }]}
            >
              <Input />
            </Item>

            <Item
              label="Mật khẩu quản trị viên"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password />
            </Item>

            <Item label="LinkedIn ngân hàng" name="bankLinkedIn">
              <Input type="url" />
            </Item>

            <Item label="Twitter ngân hàng" name="bankTwitter">
              <Input type="url" />
            </Item>

            <Item label="Facebook ngân hàng" name="bankFacebook">
              <Input type="url" />
            </Item>
          </div>

          <Item label="Mô tả ngân hàng" name="bankDesc">
            <Input.TextArea />
          </Item>

          <Item className="flex justify-end items-center">
            <Button
              loading={loading}
              type="text"
              htmlType="submit"
              className="!bg-blue-500 !text-white !font-bold"
            >
              Lưu thông tin
            </Button>
          </Item>
        </Form>
      </Card>
    </Adminlayout>
  );
};

export default Branding;
