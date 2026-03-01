import { Card } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const DashboardCustomer = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* ===== TOP BALANCE ===== */}
      <Card className="shadow bg-gradient-to-r from-blue-600 to-blue-400 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-80">Tong so du</p>
            <h1 className="text-3xl font-bold mt-1">{data?.balance} VND</h1>
          </div>
          <DollarOutlined className="text-4xl opacity-70" />
        </div>
      </Card>

      {/* ===== STATISTICS ===== */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* TOTAL TRANSACTION */}
        <Card className="shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Giao dich</p>
              <h2 className="text-2xl font-semibold">
                {data?.totalTransactions}
              </h2>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarOutlined className="text-purple-600 text-xl" />
            </div>
          </div>
        </Card>

        {/* CREDIT */}
        <Card className="shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Tien vao</p>
              <h2 className="text-2xl font-semibold text-green-600">
                {data?.totalCredit} VND
              </h2>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <ArrowDownOutlined className="text-green-600 text-xl" />
            </div>
          </div>
        </Card>

        {/* DEBIT */}
        <Card className="shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Tien ra</p>
              <h2 className="text-2xl font-semibold text-red-500">
                {data?.totalDebit} VND
              </h2>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <ArrowUpOutlined className="text-red-500 text-xl" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardCustomer;
