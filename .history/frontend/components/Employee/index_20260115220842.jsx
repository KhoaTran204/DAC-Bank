import Employeelayout from "../Layout/Employeelayout";
import Dashboard from "../Shared/Dashboard";
import AccountTable from "../Shared/AccountTable";
import TransactionTable from "../Shared/TransactionTable";
import useSWR from "swr";
import { fetchData } from "../../modules/modules";
import { Card } from "antd";

const EmployeeDashboard = () => {
  // get userInfo
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

  const { data: trData } = useSWR(
    `/api/transaction/summary?branch=${userInfo.branch}`,
    fetchData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 1200000,
    }
  );

  return (
    <Employeelayout>
      <Dashboard data={trData && trData} />

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
