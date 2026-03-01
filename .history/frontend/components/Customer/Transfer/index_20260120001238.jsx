import { Card } from "antd";
import {
  BarChartOutlined,
  PlusOutlined,
  MinusOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { http } from "../../../modules/modules";

const Dashboard = () => {
  const [totalAccount, setTotalAccount] = useState(0);
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    totalCredit: 0,
    totalDebit: 0,
    balance: 0,
  });

  /* ================= LOAD TOTAL ACCOUNT ================= */
  useEffect(() => {
    http
      .get("/dashboard/total-accounts")
      .then((response) => {
        // ✅ FIX LOI: dung response thay vi res
        setTotalAccount(response.data.totalAccounts);
      })
      .catch((err) => console.log(err));
  }, []);

  /* ================= LOAD SUMMARY ================= */
  useEffect(() => {
    http
      .get("/dashboard/summary")
      .then((response) => {
        setSummary(response.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="shadow">
          <div className="flex justify-around items-center">
            <div className="flex items-center flex-col gap-y-2">
              <BarChartOutlined className="text-xl" />
              <span>Total Accounts</span>
            </div>
            <h2 className="text-2xl font-bold">{totalAccount}</h2>
          </div>
        </Card>

        <Card className="shadow">
          <div className="flex justify-around items-center">
            <div className="flex items-center flex-col gap-y-2">
              <PlusOutlined className="text-xl text-green-600" />
              <span>Total Credit</span>
            </div>
            <h2 className="text-2xl font-bold">{summary.totalCredit}</h2>
          </div>
        </Card>

        <Card className="shadow">
          <div className="flex justify-around items-center">
            <div className="flex items-center flex-col gap-y-2">
              <MinusOutlined className="text-xl text-red-600" />
              <span>Total Debit</span>
            </div>
            <h2 className="text-2xl font-bold">{summary.totalDebit}</h2>
          </div>
        </Card>

        <Card className="shadow">
          <div className="flex justify-around items-center">
            <div className="flex items-center flex-col gap-y-2">
              <DollarOutlined className="text-xl text-blue-600" />
              <span>Balance</span>
            </div>
            <h2 className="text-2xl font-bold">{summary.balance}</h2>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
