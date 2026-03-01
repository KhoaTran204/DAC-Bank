import { SearchOutlined } from "@ant-design/icons";
import { Card, Form, Image, Input, Select, Button, Empty, message } from "antd";
import { useState } from "react";
import { http, trimData } from "../../../modules/modules";

const NewTransaction = () => {
  // lấy userInfo từ sessionStorage
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

  // form
  const [transactionForm] = Form.useForm();
  const [messageApi, contexHolder] = message.useMessage();

  // state
  const [accountNo, setAccountNo] = useState(null);
  const [accountDetail, setAccountDetail] = useState(null);

  const onFinish = async (values) => {
    try {
      const finalObj = trimData(values);
      let balance = 0;

      if (finalObj.transactionType === "cr") {
        balance =
          Number(accountDetail.finalBalance) +
          Number(finalObj.transactionAmount);
      } else if (finalObj.transactionType === "dr") {
        balance =
          Number(accountDetail.finalBalance) -
          Number(finalObj.transactionAmount);
      }

      finalObj.currentBalance = accountDetail.finalBalance;
      finalObj.customerId = accountDetail._id;
      finalObj.accountNo = accountDetail.accountNo;
      finalObj.branch = userInfo.branch;

      const httpReq = http();
      await httpReq.post("/api/transaction", finalObj);
      await httpReq.put(`/api/customers/${accountDetail._id}`, {
        finalBalance: balance,
      });

      messageApi.success("Tạo giao dịch thành công!");
      transactionForm.resetFields();
      setAccountDetail(null);
    } catch (error) {
      messageApi.error("Không thể xử lý giao dịch!");
    }
  };

  const searchByAccountNo = async () => {
    try {
      const obj = {
        accountNo,
        branch: userInfo?.branch,
      };
      const httpReq = http();
      const { data } = await httpReq.post(`/api/find-by-account`, obj);

      if (data?.data) {
        setAccountDetail(data?.data);
      } else {
        messageApi.warning("Không tìm thấy tài khoản này");
        setAccountDetail(null);
      }
    } catch (error) {
      messageApi.error("Không thể tìm thông tin tài khoản");
    }
  };

  return (
    <div>
      {contexHolder}
      <Card
        title="Giao dịch mới"
        extra={
          <Input
            onChange={(e) => setAccountNo(e.target.value)}
            placeholder="Nhập số tài khoản"
            addonAfter={
              <SearchOutlined
                onClick={searchByAccountNo}
                style={{ cursor: "pointer" }}
              />
            }
          />
        }
      >
        {accountDetail ? (
          <div>
            <div className="flex items-center justify-start gap-2">
              <Image
                src={`${import.meta.env.VITE_BASEURL}/${
                  accountDetail?.profile
                }`}
                width={120}
                height={120}
                className="rounded-full"
              />
              <Image
                src={`${import.meta.env.VITE_BASEURL}/${
                  accountDetail?.signature
                }`}
                width={120}
                height={120}
                className="rounded-full"
              />
            </div>

            <div className="mt-5 grid md:grid-cols-3 gap-8">
              <div className="mt-3 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <b>Họ tên:</b> <b>{accountDetail?.fullname}</b>
                </div>
                <div className="flex justify-between items-center">
                  <b>Số điện thoại:</b> <b>{accountDetail?.mobile}</b>
                </div>
                <div className="flex justify-between items-center">
                  <b>Số dư:</b>
                  <b>
                    {accountDetail?.currency === "VND " ? "₫ " : "$ "}
                    {accountDetail?.finalBalance}
                  </b>
                </div>
                <div className="flex justify-between items-center">
                  <b>Ngày sinh:</b> <b>{accountDetail?.dob}</b>
                </div>
                <div className="flex justify-between items-center">
                  <b>Loại tiền:</b> <b>{accountDetail?.currency}</b>
                </div>
              </div>

              <div></div>

              <Form
                form={transactionForm}
                onFinish={onFinish}
                layout="vertical"
              >
                <div className="grid md:grid-cols-2 gap-x-3">
                  <Form.Item
                    label="Loại giao dịch"
                    rules={[{ required: true }]}
                    name="transactionType"
                  >
                    <Select
                      placeholder="Chọn loại giao dịch"
                      className="w-full"
                      options={[
                        { value: "cr", label: "Nạp tiền (CR)" },
                        { value: "dr", label: "Rút tiền (DR)" },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Số tiền giao dịch"
                    rules={[{ required: true }]}
                    name="transactionAmount"
                  >
                    <Input placeholder="500000" type="number" />
                  </Form.Item>
                </div>

                <Form.Item label="Nội dung giao dịch" name="refrence">
                  <Input.TextArea />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="text"
                    htmlType="submit"
                    className="!font-semibold !text-white !bg-blue-500 !w-full"
                  >
                    Xác nhận giao dịch
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        ) : (
          <Empty description="Chưa có dữ liệu tài khoản" />
        )}
      </Card>
    </div>
  );
};

export default NewTransaction;
