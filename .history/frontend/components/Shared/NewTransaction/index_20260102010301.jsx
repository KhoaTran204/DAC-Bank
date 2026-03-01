import { SearchOutlined } from "@ant-design/icons";
import { Card, Form, Image, Input, Select, Button, Empty, message } from "antd";
import { useState, useEffect } from "react";
import { http, trimData } from "../../../modules/modules";

const NewTransaction = () => {
  //get userinfo from sessionStorage
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

  // form info
  const [transactionForm] = Form.useForm();
  const [messageApi, contexHolder] = message.useMessage();

  // state collection
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
      messageApi.success("Transaction created successfully!");
      transactionForm.resetFields();
      setAccountDetail(null);
    } catch (error) {
      messageApi.error("Unable to process transaction !");
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
        messageApi.warning("There is no record of this account");
        setAccountDetail(null);
      }
    } catch (error) {
      messageApi.error("Unable to find account details");
    }
  };

  return (
    <div>
      {contexHolder}
      <Card
        title="New Transaction"
        extra={
          <Input
            onChange={(e) => setAccountNo(e.target.value)}
            placeholder="Enter account number"
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
                  <b>Name: </b> <b>{accountDetail?.fullname}</b>
                </div>
                <div className="flex justify-between items-center">
                  <b>Mobile: </b> <b>{accountDetail?.mobile}</b>
                </div>
                <div className="flex justify-between items-center">
                  <b>Balance: </b>
                  <b>
                    {accountDetail?.currency === "VND " ? "R " : "$ "}
                    {accountDetail?.finalBalance}
                  </b>
                </div>
                <div className="flex justify-between items-center">
                  <b>DOB: </b> <b>{accountDetail?.dob}</b>
                </div>
                <div className="flex justify-between items-center">
                  <b>Currency: </b> <b>{accountDetail?.currency}</b>
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
                    label="Transaction Type"
                    rules={[{ required: true }]}
                    name="transactionType"
                  >
                    <Select
                      placeholder="Transaction Type"
                      className="w-full"
                      options={[
                        { value: "cr", label: "CR" },
                        { value: "dr", label: "DR" },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Transaction Amount"
                    rules={[{ required: true }]}
                    name="transactionAmount"
                  >
                    <Input placeholder="500.00" type="number" />
                  </Form.Item>
                </div>
                <Form.Item label="Refrence" name="refrence">
                  <Input.TextArea />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="text"
                    htmlType="submit"
                    className="!font-semibold !text-white !bg-blue-500 !w-full"
                  >
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        ) : (
          <Empty />
        )}
      </Card>
    </div>
  );
};
export default NewTransaction;
