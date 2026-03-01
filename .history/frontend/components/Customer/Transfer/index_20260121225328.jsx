import { Button, Card, Form, Input, InputNumber, message, Select } from "antd";
import { BankOutlined, SafetyOutlined } from "@ant-design/icons";
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
    if (!bankCardNo) return setReceiverName("");

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
    } catch {
      messageApi.error("Gửi OTP thất bại");
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

      <div className="flex justify-center items-start py-6">
        <div className="w-full max-w-md">
          {/* HEADER GỌN */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-2xl px-5 py-4 text-white">
            <h2 className="text-lg font-semibold">Chuyển tiền</h2>
            <p className="text-xs opacity-90">
              Giao dịch an toàn & nhanh chóng
            </p>
          </div>

          <Card
            bordered={false}
            className="rounded-b-2xl shadow-lg"
            bodyStyle={{ padding: 20 }}
          >
            <Form layout="vertical" form={form} onFinish={onFinish}>
              {/* NGƯỜI NHẬN */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <BankOutlined /> Người nhận
                </h3>

                <Item
                  name="brandingId"
                  rules={[{ required: true, message: "Chọn ngân hàng" }]}
                >
                  <Select size="middle" placeholder="Ngân hàng thụ hưởng">
                    {(brandings?.data || brandings || []).map((b) => (
                      <Select.Option key={b._id} value={b._id}>
                        {b.bankName}
                      </Select.Option>
                    ))}
                  </Select>
                </Item>

                <Item
                  name="bankCardNo"
                  rules={[{ required: true, message: "Nhập số thẻ" }]}
                >
                  <Input
                    placeholder="Số thẻ người nhận"
                    onBlur={(e) => handleCheckReceiver(e.target.value)}
                  />
                </Item>

                {receiverName && (
                  <Input
                    value={receiverName}
                    disabled
                    size="small"
                    className="!bg-gray-50"
                  />
                )}
              </div>

              {/* SỐ TIỀN */}
              <div className="mb-4">
                <Item
                  name="amount"
                  rules={[{ required: true, message: "Nhập số tiền" }]}
                >
                  <InputNumber
                    className="w-full"
                    min={1}
                    placeholder="Số tiền cần chuyển"
                  />
                </Item>
              </div>

              {/* OTP */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <SafetyOutlined /> Xác thực
                </h3>

                {!otpSent ? (
                  <Button
                    block
                    type="dashed"
                    loading={sendingOTP}
                    onClick={handleSendOTP}
                  >
                    Gửi mã OTP
                  </Button>
                ) : (
                  <Item
                    name="otp"
                    rules={[{ required: true, message: "Nhập OTP" }]}
                  >
                    <Input placeholder="Nhập mã OTP" />
                  </Item>
                )}
              </div>

              {/* CTA */}
              <Button
                htmlType="submit"
                block
                loading={loading}
                disabled={!otpSent}
                className="!bg-blue-600 hover:!bg-blue-700 !text-white !font-semibold !rounded-lg h-10"
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
