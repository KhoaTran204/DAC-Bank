import { Button, Card, Form, Input, message } from "antd";
import Adminlayout from "../../Layout/Adminlayout";
import { EditFilled } from "@ant-design/icons";
import { http, trimData } from "../../../modules/modules";
import { useState, useEffect } from "react";

const { Item } = Form;

const Branding = () => {
  const [bankForm] = Form.useForm();
  const [messageApi, context] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [brandings, setBrandings] = useState(null);
  const [edit, setEdit] = useState(true);
  const [reload, setReload] = useState(0);

  // lay thong tin ngan hang (neu da ton tai)
  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/branding");

        if (data?.data?.length > 0) {
          bankForm.setFieldsValue(data.data[0]);
          setBrandings(data.data[0]);
          setEdit(true); // khoa form
        }
      } catch (err) {
        messageApi.error("Khong the tai thong tin ngan hang!");
      }
    };
    fetcher();
  }, [reload]);

  // TAO MOI
  const onCreate = async (values) => {
    try {
      setLoading(true);
      const finalObj = trimData(values);
      finalObj.bankLogo = photo ? photo : "bankImages/dummy.png";

      const userInfo = {
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
      setReload(reload + 1);
    } catch (err) {
      messageApi.error("Khong the luu thong tin!");
    } finally {
      setLoading(false);
    }
  };

  // CAP NHAT
  const onUpdate = async (values) => {
    try {
      setLoading(true);
      const finalObj = trimData(values);

      if (photo) {
        finalObj.bankLogo = photo;
      }

      const httpReq = http();
      await httpReq.put(`/api/branding/${brandings._id}`, finalObj);

      messageApi.success("Cap nhat thong tin thanh cong!");
      setEdit(true);
      setReload(reload + 1);
    } catch (err) {
      messageApi.error("Khong the cap nhat thong tin!");
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
      <Card
        title="Thong tin ngan hang"
        extra={
          brandings && (
            <Button icon={<EditFilled />} onClick={() => setEdit(false)}>
              Chinh sua
            </Button>
          )
        }
      >
        <Form
          form={bankForm}
          layout="vertical"
          disabled={edit}
          onFinish={brandings ? onUpdate : onCreate}
        >
          <div className="grid md:grid-cols-3 gap-x-3">
            <Item
              label="Ten ngan hang"
              name="bankName"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>

            <Item
              label="Khau hieu ngan hang"
              name="bankTagline"
              rules={[{ required: true }]}
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

            {/* Chi hien khi TAO MOI */}
            {!brandings && (
              <>
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
              </>
            )}

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

          {!edit && (
            <Item className="flex justify-end items-center">
              <Button
                loading={loading}
                type="text"
                htmlType="submit"
                className="!bg-blue-500 !text-white !font-bold"
              >
                {brandings ? "Cap nhat" : "Luu thong tin"}
              </Button>
            </Item>
          )}
        </Form>
      </Card>
    </Adminlayout>
  );
};

export default Branding;
