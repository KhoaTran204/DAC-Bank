import Employeelayout from "../Layout/Employeelayout";
import Dashboard from "../Shared/Dashboard";
import AccountTable from "../Shared/AccountTable";
import TransactionTable from "../Shared/TransactionTable";

import useSWR from "swr";
import { fetchData } from "../../modules/modules";
import { Card } from "antd";

const EmployeeDashboard = () => {
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

  const { data: trData } = useSWR(
    userInfo?.branch
      ? `/api/transaction/summary?branch=${userInfo.branch}`
      : null,
    fetchData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 1200000,
    }
  );

  /* ===== NORMALIZE DATA ===== */
  const dashboardData = {
    totalTransactions: trData?.totalTransactions || 0,
    totalCredit: trData?.totalCredit || 0,
    totalDebit: trData?.totalDebit || 0,
    balance: trData?.balance || 0,
  };

  return (
    <Employeelayout>
      <Dashboard data={dashboardData} />

      <div className="mt-8">
        <Card title="Recently Created Accounts">
          <AccountTable query={{ branch: userInfo?.branch }} />
        </Card>
      </div>

      <div className="mt-8">
        <Card title="Transactions history">
          <TransactionTable query={{ branch: userInfo?.branch }} />
        </Card>
      </div>
    </Employeelayout>
  );
};

export default EmployeeDashboard;
