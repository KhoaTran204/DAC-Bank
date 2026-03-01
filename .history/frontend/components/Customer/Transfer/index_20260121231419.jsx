import { Button, Form, Input, InputNumber, Select, message } from "antd";
import { useState } from "react";
import useSWR from "swr";
import Customerlayout from "../../Layout/Customerlayout";
import { http, fetchData } from "../../../modules/modules";

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
      messageApi.success("Mã OTP đã được gửi");
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

      messageApi.success("Chuyển tiền thành công");
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

      {/* NỀN APP */}
      <div className="min-h-screen bg-[#f6f7f9] flex justify-center px-4 py-6">
        <div className="w-full max-w-md">
          {/* HEADER */}
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-[#1f2937]">
              Chuyển tiền
            </h2>
            <p className="text-sm text-[#6b7280]">
              Chuyển tiền an toàn đến ngân hàng khác
            </p>
          </div>

          {/* CARD */}
          <div className="bg-white rounded-3xl p-5 shadow-sm space-y-6">
            <Form layout="vertical" form={form} onFinish={onFinish}>
              {/* NGƯỜI NHẬN */}
              <div>
                <p className="font-medium text-[#1f2937] mb-3">Người nhận</p>

                <Item
                  name="brandingId"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngân hàng" },
                  ]}
                >
                  <Select
                    size="large"
                    placeholder="Chọn ngân hàng"
                    className="rounded-xl"
                  />
                </Item>

                <Item
                  name="bankCardNo"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập số thẻ người nhận",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Số thẻ người nhận"
                    className="rounded-xl"
                    onBlur={(e) => handleCheckReceiver(e.target.value)}
                  />
                </Item>

                {receiverName && (
                  <div className="bg-[#fff1f7] text-[#d82d8b] rounded-xl px-4 py-3 text-sm font-semibold">
                    {receiverName}
                  </div>
                )}
              </div>

              {/* GIAO DỊCH */}
              <div>
                <p className="font-medium text-[#1f2937] mb-3">Giao dịch</p>

                <Item
                  name="amount"
                  rules={[{ required: true, message: "Vui lòng nhập số tiền" }]}
                >
                  <InputNumber
                    size="large"
                    className="!w-full rounded-xl"
                    placeholder="Nhập số tiền (VNĐ)"
                    min={1}
                  />
                </Item>

                {otpSent && (
                  <Item
                    name="otp"
                    rules={[
                      { required: true, message: "Vui lòng nhập mã OTP" },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="Nhập mã OTP"
                      className="rounded-xl"
                    />
                  </Item>
                )}
              </div>

              {!otpSent && (
                <Button
                  block
                  size="large"
                  loading={sendingOTP}
                  onClick={handleSendOTP}
                  className="rounded-xl border-[#d82d8b] text-[#d82d8b]"
                >
                  Gửi mã OTP
                </Button>
              )}

              <Button
                htmlType="submit"
                block
                size="large"
                loading={loading}
                disabled={!otpSent}
                className="!bg-[#d82d8b] hover:!bg-[#c2185b] !text-white !font-semibold rounded-xl h-12"
              >
                Xác nhận chuyển tiền
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </Customerlayout>
  );
};

export default Transfer;
