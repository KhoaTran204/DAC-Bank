import { Button, Card, Form, Input, InputNumber, message, Select } from "antd";
import { useState } from "react";
import { http, fetchData } from "../../../modules/modules";
import Customerlayout from "../../Layout/Customerlayout";
import useSWR from "swr";

const { Item } = Form;

const Transfer = () => {
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [receiverName, setReceiverName] = useState("");

  const [form] = Form.useForm();
  const [messageApi, context] = message.useMessage();

  // ===== LAY THONG TIN NGUOI DUNG =====
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

  // ===== LAY DANH SACH NGAN HANG (BRANDING) =====
  const { data: brandings } = useSWR("/api/branding", fetchData, {
    revalidateOnFocus: false,
  });

  // ===== KIEM TRA NGUOI NHAN =====
  const handleCheckReceiver = async (bankCardNo) => {
    if (!bankCardNo) {
      setReceiverName("");
      return;
    }

    try {
      const httpReq = http();
      const res = await httpReq.get(
        `/api/transfer/receiver?bankCardNo=${bankCardNo}`,
      );
      setReceiverName(res.data.fullname);
    } catch (err) {
      setReceiverName("");
    }
  };

  // ===== GUI MA OTP =====
  const handleSendOTP = async () => {
    try {
      setSendingOTP(true);
      const httpReq = http();

      await httpReq.post("/api/transfer/send-otp", {
        accountNo: userInfo.accountNo,
      });

      messageApi.success("Ma OTP da duoc gui qua email");
      setOtpSent(true);
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Gui OTP that bai");
    } finally {
      setSendingOTP(false);
    }
  };

  // ===== XAC NHAN CHUYEN TIEN =====
  const onFinish = async (values) => {
    try {
      setLoading(true);
      const httpReq = http();

      await httpReq.post("/api/transfer/confirm", {
        fromAccountNo: Number(userInfo.accountNo),
        toBrandingId: values.brandingId,
        toBankCardNo: values.bankCardNo,
        transactionAmount: Number(values.amount),
        otp: values.otp,
      });

      messageApi.success("Chuyen tien thanh cong!");
      form.resetFields();
      setReceiverName("");
      setOtpSent(false);
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Chuyen tien that bai");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Customerlayout>
      {context}

      <Card
        title="Chuyen tien"
        className="max-w-lg"
        extra={
          <span className="text-gray-500 text-sm">
            Chuyen tien den tai khoan ngan hang khac
          </span>
        }
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          {/* ===== CHON NGAN HANG ===== */}
          <Item
            label="Ngan hang"
            name="brandingId"
            rules={[{ required: true, message: "Vui long chon ngan hang" }]}
          >
            <Select placeholder="Chon ngan hang">
              {(brandings?.data || brandings || []).map((b) => (
                <Select.Option key={b._id} value={b._id}>
                  {b.bankName}
                </Select.Option>
              ))}
            </Select>
          </Item>

          {/* ===== SO THE NGUOI NHAN ===== */}
          <Item
            label="So the ngan hang nguoi nhan"
            name="bankCardNo"
            rules={[
              { required: true, message: "Vui long nhap so the ngan hang" },
            ]}
          >
            <Input
              placeholder="Nhap so the ngan hang nguoi nhan"
              onBlur={(e) => handleCheckReceiver(e.target.value)}
            />
          </Item>

          {/* ===== TEN NGUOI NHAN ===== */}
          {receiverName && (
            <Item label="Ten nguoi nhan">
              <Input value={receiverName} disabled />
            </Item>
          )}

          {/* ===== SO TIEN ===== */}
          <Item
            label="So tien"
            name="amount"
            rules={[{ required: true, message: "Vui long nhap so tien" }]}
          >
            <InputNumber
              className="w-full"
              min={1}
              placeholder="Nhap so tien can chuyen"
            />
          </Item>

          {/* ===== MA OTP ===== */}
          {otpSent && (
            <Item
              label="Ma OTP"
              name="otp"
              rules={[{ required: true, message: "Vui long nhap ma OTP" }]}
            >
              <Input placeholder="Nhap ma OTP duoc gui qua email" />
            </Item>
          )}

          {/* ===== NUT GUI OTP ===== */}
          {!otpSent && (
            <Button
              type="dashed"
              block
              loading={sendingOTP}
              onClick={handleSendOTP}
              className="mb-3"
            >
              Gui ma OTP
            </Button>
          )}

          {/* ===== NUT XAC NHAN ===== */}
          <Button
            loading={loading}
            type="text"
            htmlType="submit"
            className="!font-semibold !text-white !bg-blue-500"
            block
            disabled={!otpSent}
          >
            Xac nhan chuyen tien
          </Button>
        </Form>
      </Card>
    </Customerlayout>
  );
};

export default Transfer;
