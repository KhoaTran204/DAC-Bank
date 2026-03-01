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
    } catch {
      setReceiverName("");
    }
  };

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

      <div className="flex justify-center px-4 py-8">
        <div className="w-full max-w-[420px]">
          {/* KHUNG NGOÀI */}
          <div className="rounded-3xl overflow-hidden shadow-lg bg-white">
            {/* HEADER */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
              <h2 className="text-white text-xl font-semibold">Chuyển tiền</h2>
              <p className="text-blue-100 text-sm">
                Giao dịch an toàn đến ngân hàng khác
              </p>
            </div>

            {/* BODY */}
            <div className="p-5 space-y-6">
              <Form layout="vertical" form={form} onFinish={onFinish}>
                {/* THÔNG TIN NGƯỜI NHẬN */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="font-semibold text-gray-700 mb-3">
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

                {/* THÔNG TIN GIAO DỊCH */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="font-semibold text-gray-700 mb-3">
                    Thông tin giao dịch
                  </p>

                  <Item
                    label="Số tiền cần chuyển"
                    name="amount"
                    rules={[
                      { required: true, message: "Vui lòng nhập số tiền" },
                    ]}
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
                      <Input placeholder="Nhập mã OTP" />
                    </Item>
                  )}
                </div>

                {!otpSent && (
                  <Button
                    type="dashed"
                    block
                    loading={sendingOTP}
                    onClick={handleSendOTP}
                    className="rounded-xl h-11"
                  >
                    Gửi mã OTP
                  </Button>
                )}

                <Button
                  loading={loading}
                  htmlType="submit"
                  block
                  disabled={!otpSent}
                  className="!bg-blue-600 hover:!bg-blue-700 !text-white !font-semibold !rounded-xl h-12"
                >
                  Xác nhận chuyển tiền
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </Customerlayout>
  );
};

export default Transfer;
