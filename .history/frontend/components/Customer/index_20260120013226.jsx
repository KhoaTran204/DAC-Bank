import Customerlayout from "../Layout/Customerlayout";
import Dashboard from "../Shared/Dashboard";
import useSWR from "swr";
import { fetchData } from "../../modules/modules";
import { Card } from "antd";

import TransactionTable from "../Shared/TransactionTable";
import DashboardCustomer from "../Shared/DashboardCustomer";

const CustomerDashboard = () => {
  //get userInfo
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const { data: trData, error: trError } = useSWR(
    `/api/transaction/summary?accountNo=${userInfo.accountNo}`,
    fetchData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 1200000,
    },
  );
  console.log("userInfo:", userInfo);

  return (
    <Customerlayout>
      <DashboardCustomer data={trData && trData} />
      <div className="mt-8">
        <Card title="Các giao dịch gần đây">
          <TransactionTable
            query={{ accountNo: userInfo?.accountNo, branch: userInfo?.branch }}
          />
        </Card>
      </div>
    </Customerlayout>
  );
};
export default CustomerDashboard;
