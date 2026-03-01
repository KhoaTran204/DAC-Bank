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

  // Lấy thông tin người dùng
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

  // Lấy danh sách ngân hàng
  const { data: brandings } = useSWR("/api/branding", fetchData, {
    revalidateOnFocus: false,
  });

  // ===== KIỂM TRA NGƯỜI NHẬN =====
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
      setReceiverName(res.data.fullName);
    } catch (err) {
      setReceiverName("");
    }
  };

  // ===== GỬI OTP =====
  const handleSendOTP = async () => {
    try {
      setSendingOTP(true);
      const httpReq = http();

      await httpReq.post("/api/transfer/send-otp", {
        accountNo: userInfo.accountNo,
      });

      messageApi.success("OTP đã được gửi qua email");
      setOtpSent(true);
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Gửi OTP thất bại");
    } finally {
      setSendingOTP(false);
    }
  };

  // ===== CHUYỂN TIỀN =====
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

      messageApi.success("Chuyển tiền thành công!");
      form.resetFields();
      setReceiverName("");
      setOtpSent(false);
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Chuyển tiền thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Customerlayout>
      {context}

      {/* WRAPPER CĂN GIỮA */}
      <div className="flex justify-center items-start py-10">
        <Card
          title={
            <div className="text-xl font-semibold text-gray-800">
              Chuyển tiền
            </div>
          }
          extra={
            <span className="text-gray-500 text-sm">
              Chuyển tiền đến tài khoản ngân hàng khác
            </span>
          }
          className="w-full max-w-xl rounded-2xl shadow-lg"
        >
          <Form layout="vertical" form={form} onFinish={onFinish}>
            {/* ===== NGÂN HÀNG ===== */}
            <Item
              label="Ngân hàng"
              name="brandingId"
              rules={[{ required: true, message: "Vui lòng chọn ngân hàng" }]}
            >
              <Select placeholder="Chọn ngân hàng" size="large">
                {(brandings?.data || brandings || []).map((b) => (
                  <Select.Option key={b._id} value={b._id}>
                    {b.bankName}
                  </Select.Option>
                ))}
              </Select>
            </Item>

            {/* ===== SỐ THẺ NGƯỜI NHẬN ===== */}
            <Item
              label="Số thẻ ngân hàng người nhận"
              name="bankCardNo"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số thẻ ngân hàng",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Nhập số thẻ ngân hàng người nhận"
                onBlur={(e) => handleCheckReceiver(e.target.value)}
              />
            </Item>

            {/* ===== TÊN NGƯỜI NHẬN ===== */}
            {receiverName && (
              <Item label="Tên người nhận">
                <Input size="large" value={receiverName} disabled />
              </Item>
            )}

            {/* ===== SỐ TIỀN ===== */}
            <Item
              label="Số tiền"
              name="amount"
              rules={[{ required: true, message: "Vui lòng nhập số tiền" }]}
            >
              <InputNumber
                size="large"
                className="w-full"
                min={1}
                placeholder="Nhập số tiền cần chuyển"
              />
            </Item>

            {/* ===== OTP ===== */}
            {otpSent && (
              <Item
                label="Mã OTP"
                name="otp"
                rules={[{ required: true, message: "Vui lòng nhập mã OTP" }]}
              >
                <Input
                  size="large"
                  placeholder="Nhập mã OTP được gửi qua email"
                />
              </Item>
            )}

            {/* ===== GỬI OTP ===== */}
            {!otpSent && (
              <Button
                type="dashed"
                block
                size="large"
                loading={sendingOTP}
                onClick={handleSendOTP}
                className="mb-4 rounded-xl"
              >
                Gửi OTP
              </Button>
            )}

            {/* ===== XÁC NHẬN CHUYỂN TIỀN ===== */}
            <Button
              loading={loading}
              type="primary"
              htmlType="submit"
              size="large"
              block
              disabled={!otpSent}
              className="!rounded-xl !font-semibold"
            >
              Xác nhận chuyển tiền
            </Button>
          </Form>
        </Card>
      </div>
    </Customerlayout>
  );
};

export default Transfer;
