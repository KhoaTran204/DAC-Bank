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

  const [form] = Form.useForm();
  const [messageApi, context] = message.useMessage();

  // lay userInfo
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

  // lay branding
  const { data: brandings } = useSWR("/api/branding", fetchData, {
    revalidateOnFocus: false,
  });

  // ===== GUI OTP =====
  const handleSendOTP = async () => {
    try {
      setSendingOTP(true);
      const httpReq = http();

      await httpReq.post("/api/transfer/send-otp", {
        accountNo: userInfo.accountNo,
      });

      messageApi.success("OTP da duoc gui qua email");
      setOtpSent(true);
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Gui OTP that bai");
    } finally {
      setSendingOTP(false);
    }
  };

  // ===== CHUYEN TIEN =====
  const onFinish = async (values) => {
    try {
      setLoading(true);
      const httpReq = http();

      await httpReq.post("/api/transfer/confirm", {
        fromAccountNo: Number(userInfo.accountNo),
        toBrandingId: values.brandingId,
        toBankCardNo: values.bankCardNo,
        amount: Number(values.amount),
        otp: values.otp,
      });

      messageApi.success("Chuyen tien thanh cong!");
      form.resetFields();
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
        title="Transfer Money"
        className="max-w-lg"
        extra={
          <span className="text-gray-500 text-sm">
            Transfer money to another bank account
          </span>
        }
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          {/* ===== BRANDING ===== */}
          <Item
            label="Bank (Branding)"
            name="brandingId"
            rules={[{ required: true, message: "Please select bank" }]}
          >
            <Select placeholder="Select bank">
              {(brandings?.data || brandings || []).map((b) => (
                <Select.Option key={b._id} value={b._id}>
                  {b.bankName}
                </Select.Option>
              ))}
            </Select>
          </Item>

          {/* ===== BANK CARD NO ===== */}
          <Item
            label="Receiver Bank Card Number"
            name="bankCardNo"
            rules={[
              { required: true, message: "Please enter bank card number" },
            ]}
          >
            <Input placeholder="Enter receiver bank card number" />
          </Item>

          {/* ===== AMOUNT ===== */}
          <Item
            label="Amount"
            name="amount"
            rules={[{ required: true, message: "Please enter amount" }]}
          >
            <InputNumber
              className="w-full"
              min={1}
              placeholder="Enter transfer amount"
            />
          </Item>

          {/* ===== OTP ===== */}
          {otpSent && (
            <Item
              label="OTP"
              name="otp"
              rules={[{ required: true, message: "Please enter OTP" }]}
            >
              <Input placeholder="Enter OTP sent to your email" />
            </Item>
          )}

          {/* ===== BUTTON GUI OTP ===== */}
          {!otpSent && (
            <Button
              type="dashed"
              block
              loading={sendingOTP}
              onClick={handleSendOTP}
              className="mb-3"
            >
              Send OTP
            </Button>
          )}

          {/* ===== SUBMIT ===== */}
          <Button
            loading={loading}
            type="text"
            htmlType="submit"
            className="!font-semibold !text-white !bg-blue-500"
            block
            disabled={!otpSent}
          >
            Confirm Transfer
          </Button>
        </Form>
      </Card>
    </Customerlayout>
  );
};

export default Transfer;
