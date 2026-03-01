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

  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

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

      {/* NỀN TRANG */}
      <div className="flex justify-center py-12">
        <div className="w-full max-w-md">
          <Card
            bordered={false}
            className="rounded-3xl shadow-xl"
            bodyStyle={{ padding: "28px" }}
          >
            {/* HEADER */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">Chuyển tiền</h2>
              <p className="text-sm text-gray-500 mt-1">
                Chuyển tiền đến ngân hàng khác
              </p>
            </div>

            <Form layout="vertical" form={form} onFinish={onFinish}>
              {/* ===== NGÂN HÀNG ===== */}
              <Item
                label="Ngân hàng thụ hưởng"
                name="brandingId"
                rules={[{ required: true, message: "Vui lòng chọn ngân hàng" }]}
              >
                <Select size="large" placeholder="Chọn ngân hàng">
                  {(brandings?.data || brandings || []).map((b) => (
                    <Select.Option key={b._id} value={b._id}>
                      {b.bankName}
                    </Select.Option>
                  ))}
                </Select>
              </Item>

              {/* ===== SỐ THẺ ===== */}
              <Item
                label="Số thẻ người nhận"
                name="bankCardNo"
                rules={[
                  { required: true, message: "Vui lòng nhập số thẻ ngân hàng" },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Nhập số thẻ"
                  onBlur={(e) => handleCheckReceiver(e.target.value)}
                />
              </Item>

              {/* ===== TÊN NGƯỜI NHẬN ===== */}
              {receiverName && (
                <Item label="Người nhận">
                  <Input
                    size="large"
                    value={receiverName}
                    disabled
                    className="!bg-gray-50 !text-gray-700"
                  />
                </Item>
              )}

              {/* ===== SỐ TIỀN ===== */}
              <Item
                label="Số tiền cần chuyển"
                name="amount"
                rules={[{ required: true, message: "Vui lòng nhập số tiền" }]}
              >
                <InputNumber
                  size="large"
                  className="w-full"
                  min={1}
                  placeholder="VD: 500.000"
                />
              </Item>

              {/* ===== OTP ===== */}
              {otpSent && (
                <Item
                  label="Mã OTP"
                  name="otp"
                  rules={[{ required: true, message: "Vui lòng nhập mã OTP" }]}
                >
                  <Input size="large" placeholder="Nhập mã OTP" />
                </Item>
              )}

              {/* ===== GỬI OTP ===== */}
              {!otpSent && (
                <Button
                  type="dashed"
                  size="large"
                  block
                  loading={sendingOTP}
                  onClick={handleSendOTP}
                  className="mb-4 rounded-xl"
                >
                  Gửi mã OTP
                </Button>
              )}

              {/* ===== XÁC NHẬN ===== */}
              <Button
                htmlType="submit"
                size="large"
                block
                loading={loading}
                disabled={!otpSent}
                className="!bg-blue-600 hover:!bg-blue-700 !text-white !font-semibold !rounded-xl h-12"
              >
                Xác nhận chuyển tiền
              </Button>
            </Form>
          </Card>
        </div>
      </div>
    </Customerlayout>
  );
};

export default Transfer;
