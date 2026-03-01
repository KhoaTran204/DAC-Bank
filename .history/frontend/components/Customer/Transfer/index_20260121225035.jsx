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

      <div className="flex justify-center py-10">
        <div className="w-full max-w-lg">
          {/* ===== HEADER GRADIENT ===== */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-3xl px-6 py-6 text-white shadow-lg">
            <h2 className="text-2xl font-bold">Chuyển tiền</h2>
            <p className="text-sm opacity-90 mt-1">
              Chuyển tiền an toàn đến ngân hàng khác
            </p>
          </div>

          {/* ===== FORM CARD ===== */}
          <Card
            bordered={false}
            className="rounded-b-3xl shadow-xl"
            bodyStyle={{ padding: "28px" }}
          >
            <Form layout="vertical" form={form} onFinish={onFinish}>
              {/* KHỐI 1 */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <BankOutlined /> Thông tin người nhận
                </h3>

                <Item
                  label="Ngân hàng thụ hưởng"
                  name="brandingId"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngân hàng" },
                  ]}
                >
                  <Select size="large" placeholder="Chọn ngân hàng">
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
                      message: "Vui lòng nhập số thẻ người nhận",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Nhập số thẻ"
                    onBlur={(e) => handleCheckReceiver(e.target.value)}
                  />
                </Item>

                {receiverName && (
                  <Item label="Tên người nhận">
                    <Input
                      value={receiverName}
                      size="large"
                      disabled
                      className="!bg-gray-50"
                    />
                  </Item>
                )}
              </div>

              {/* KHỐI 2 */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Số tiền giao dịch
                </h3>

                <Item
                  label="Số tiền cần chuyển"
                  name="amount"
                  rules={[{ required: true, message: "Vui lòng nhập số tiền" }]}
                >
                  <InputNumber
                    size="large"
                    className="w-full"
                    min={1}
                    placeholder="Ví dụ: 500.000"
                  />
                </Item>
              </div>

              {/* KHỐI 3 */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <SafetyOutlined /> Xác thực giao dịch
                </h3>

                {!otpSent && (
                  <Button
                    block
                    size="large"
                    type="dashed"
                    loading={sendingOTP}
                    onClick={handleSendOTP}
                    className="rounded-xl"
                  >
                    Gửi mã OTP
                  </Button>
                )}

                {otpSent && (
                  <Item
                    label="Mã OTP"
                    name="otp"
                    rules={[
                      { required: true, message: "Vui lòng nhập mã OTP" },
                    ]}
                  >
                    <Input size="large" placeholder="Nhập mã OTP" />
                  </Item>
                )}
              </div>

              {/* CTA */}
              <Button
                htmlType="submit"
                size="large"
                block
                loading={loading}
                disabled={!otpSent}
                className="!bg-blue-600 hover:!bg-blue-700 !text-white !font-semibold !rounded-xl h-12 shadow-md"
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
