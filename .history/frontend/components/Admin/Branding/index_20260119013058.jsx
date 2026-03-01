import { Button, Card, Form, Input, message } from "antd";
import Adminlayout from "../../Layout/Adminlayout";
import { EditFilled } from "@ant-design/icons";
import { http, trimData } from "../../../modules/modules";
import { useState, useEffect } from "react";

const { Item } = Form;

const Branding = () => {
  const [bankForm] = Form.useForm();
  const [messageApi, contex] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [brandings, setBrandings] = useState(null);
  const [no, setNo] = useState(0);
  const [edit, setEdit] = useState(false);

  // lấy thông tin thương hiệu ngân hàng
  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/branding");
        bankForm.setFieldValue(data?.data[0]);
        setBrandings(data?.data[0]);
        setEdit(true);
      } catch (err) {
        messageApi.error("Không thể tải dữ liệu!");
      }
    };
    fetcher();
  }, [no]);

  // tạo mới thông tin ngân hàng
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

      messageApi.success("Tạo thông tin thương hiệu thành công!");
      bankForm.resetFields();
      setPhoto(null);
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Không thể lưu thông tin thương hiệu!");
    } finally {
      setLoading(false);
    }
  };

  // cập nhật thông tin ngân hàng
  const onUpdate = async (values) => {
    try {
      setLoading(true);
      const finalObj = trimData(values);

      if (photo) {
        finalObj.bankLogo = photo;
      }

      const httpReq = http();
      await httpReq.put(`/api/branding/${brandings._id}`, finalObj);

      messageApi.success("Cập nhật thương hiệu thành công!");
      bankForm.resetFields();
      setPhoto(null);
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Không thể cập nhật thông tin thương hiệu!");
    } finally {
      setLoading(false);
    }
  };

  // xử lý upload logo
  const handleUpload = async (e) => {
    try {
      let file = e.target.files[0];
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
      {contex}
      <Card
        title="Thông tin ngân hàng"
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

            <Item label="Logo ngân hàng" name="xyz">
              <Input type="file" onChange={handleUpload} />
            </Item>

            <Item
              label="Số tài khoản ngân hàng"
              name="bankAccountNo"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>

            <Item
              label="Mã giao dịch ngân hàng"
              name="bankTransactionId"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>

            <Item
              label="Địa chỉ ngân hàng"
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
                label="Họ tên quản trị viên"
                name="fullname"
                rules={[{ required: brandings ? false : true }]}
              >
                <Input />
              </Item>

              <Item
                label="Email quản trị viên"
                name="email"
                rules={[{ required: brandings ? false : true }]}
              >
                <Input />
              </Item>

              <Item
                label="Mật khẩu quản trị viên"
                name="password"
                rules={[{ required: brandings ? false : true }]}
              >
                <Input.Password />
              </Item>
            </div>

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

          {brandings ? (
            <Item className="flex justify-end items-center">
              <Button
                loading={loading}
                type="text"
                htmlType="submit"
                className="!bg-rose-500 !text-white !font-bold"
              >
                Cập nhật
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
                Lưu thông tin
              </Button>
            </Item>
          )}
        </Form>
      </Card>
    </Adminlayout>
  );
};

export default Branding;
