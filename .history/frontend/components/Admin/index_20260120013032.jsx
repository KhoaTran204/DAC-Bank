import Adminlayout from "../Layout/Adminlayout";
import Dashboard from "../Shared/Dashboard";
import AccountTable from "../Shared/AccountTable";
import TransactionTable from "../Shared/TransactionTable";

import { fetchData } from "../../modules/modules";
import useSWR from "swr";
import { Card } from "antd";

const AdminDashboard = () => {
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
    },
  );

  /* ===== NORMALIZE DATA FOR DASHBOARD ===== */
  const dashboardData = {
    totalTransactions: trData?.totalTransactions || 0,
    totalCredit: trData?.totalCredit || 0,
    totalDebit: trData?.totalDebit || 0,
    balance: trData?.balance || 0,
  };

  return (
    <Adminlayout>
      <Dashboard data={dashboardData} />

      <div className="mt-8">
        <Card title="Danh sách tài khoản mới tạo">
          <AccountTable query={{ branch: userInfo?.branch }} />
        </Card>
      </div>

      <div className="mt-8">
        <Card title="Lịch sử giao dịch">
          <TransactionTable query={{ branch: userInfo?.branch }} />
        </Card>
      </div>
    </Adminlayout>
  );
};

export default AdminDashboard;
