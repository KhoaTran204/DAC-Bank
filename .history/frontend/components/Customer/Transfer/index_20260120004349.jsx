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

  // Lấy danh sách ngân hàng (branding)
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

      <Card
        title="Chuyển tiền"
        className="max-w-lg"
        extra={
          <span className="text-gray-500 text-sm">
            Chuyển tiền đến tài khoản ngân hàng khác
          </span>
        }
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          {/* ===== NGÂN HÀNG ===== */}
          <Item
            label="Ngân hàng"
            name="brandingId"
            rules={[{ required: true, message: "Vui lòng chọn ngân hàng" }]}
          >
            <Select placeholder="Chọn ngân hàng">
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
              placeholder="Nhập số thẻ ngân hàng người nhận"
              onBlur={(e) => handleCheckReceiver(e.target.value)}
            />
          </Item>

          {/* ===== TÊN NGƯỜI NHẬN ===== */}
          {receiverName && (
            <Item label="Tên người nhận">
              <Input value={receiverName} disabled />
            </Item>
          )}

          {/* ===== SỐ TIỀN ===== */}
          <Item
            label="Số tiền"
            name="amount"
            rules={[{ required: true, message: "Vui lòng nhập số tiền" }]}
          >
            <InputNumber
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
              <Input placeholder="Nhập mã OTP được gửi qua email" />
            </Item>
          )}

          {/* ===== NÚT GỬI OTP ===== */}
          {!otpSent && (
            <Button
              type="dashed"
              block
              loading={sendingOTP}
              onClick={handleSendOTP}
              className="mb-3"
            >
              Gửi OTP
            </Button>
          )}

          {/* ===== XÁC NHẬN CHUYỂN TIỀN ===== */}
          <Button
            loading={loading}
            type="text"
            htmlType="submit"
            className="!font-semibold !text-white !bg-blue-500"
            block
            disabled={!otpSent}
          >
            Xác nhận chuyển tiền
          </Button>
        </Form>
      </Card>
    </Customerlayout>
  );
};

export default Transfer;
