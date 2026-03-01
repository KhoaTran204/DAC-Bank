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

      messageApi.success("Mã OTP đã được gửi qua email");
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

      {/* WRAPPER – CĂN GIỮA DESKTOP + MOBILE */}
      <div className="w-full flex justify-center px-4 py-6">
        <div className="w-full max-w-[420px] md:max-w-[480px]">
          <Card
            bordered={false}
            className="rounded-2xl shadow-md"
            bodyStyle={{ padding: 20 }}
          >
            {/* HEADER */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Chuyển tiền
              </h2>
              <p className="text-sm text-gray-500">
                Chuyển tiền an toàn đến ngân hàng khác
              </p>
            </div>

            <Form layout="vertical" form={form} onFinish={onFinish}>
              {/* ===== THÔNG TIN NGƯỜI NHẬN ===== */}
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Thông tin người nhận
                </p>

                <Item
                  label="Ngân hàng thụ hưởng"
                  name="brandingId"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngân hàng" },
                  ]}
                >
                  <Select placeholder="Chọn ngân hàng">
                    {(brandings?.data || brandings || []).map((b) => (
                      <Select.Option key={b._id} value={b._id}>
                        {b.bankName}
                      </Select.Option>
                    ))}
                  </Select>
                </Item>

                <Item
                  label="Số thẻ người nhận"
                  name="bankCardNo"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập số thẻ ngân hàng",
                    },
                  ]}
                >
                  <Input
                    placeholder="Nhập số thẻ ngân hàng"
                    onBlur={(e) => handleCheckReceiver(e.target.value)}
                  />
                </Item>

                {receiverName && (
                  <Item label="Tên người nhận">
                    <Input value={receiverName} disabled />
                  </Item>
                )}
              </div>

              {/* ===== THÔNG TIN GIAO DỊCH ===== */}
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Thông tin giao dịch
                </p>

                <Item
                  label="Số tiền cần chuyển"
                  name="amount"
                  rules={[{ required: true, message: "Vui lòng nhập số tiền" }]}
                >
                  <InputNumber
                    className="w-full"
                    min={1}
                    placeholder="Ví dụ: 500.000"
                  />
                </Item>

                {otpSent && (
                  <Item
                    label="Mã OTP"
                    name="otp"
                    rules={[
                      { required: true, message: "Vui lòng nhập mã OTP" },
                    ]}
                  >
                    <Input placeholder="Nhập mã OTP được gửi qua email" />
                  </Item>
                )}
              </div>

              {/* ===== NÚT GỬI OTP ===== */}
              {!otpSent && (
                <Button
                  type="dashed"
                  block
                  loading={sendingOTP}
                  onClick={handleSendOTP}
                  className="mb-3 rounded-xl"
                >
                  Gửi mã OTP
                </Button>
              )}

              {/* ===== XÁC NHẬN ===== */}
              <Button
                loading={loading}
                htmlType="submit"
                block
                disabled={!otpSent}
                className="!bg-blue-600 hover:!bg-blue-700 !text-white !font-semibold !rounded-xl h-11"
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
