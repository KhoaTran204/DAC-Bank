import { Card, Button, Divider } from "antd";
import {
  BarChartOutlined,
  PlusOutlined,
  MinusOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const Dashboard = ({ data = {} }) => {
  /* ===== SAFE DATA ===== */
  const totalTransactions = Number(data.totalTransactions) || 0;
  const totalCredit = Number(data.totalCredit) || 0;
  const totalDebit = Number(data.totalDebit) || 0;
  const balance = Number(data.balance) || 0;

  const calcFakeGrowth = (value) => Math.floor(value + (value * 50) / 100);

  return (
    <div>
      <div className="grid md:grid-cols-4 gap-6">
        {/* ===== TRANSACTIONS ===== */}
        <Card className="shadow">
          <div className="flex justify-around items-center">
            <div className="flex items-center flex-col gap-y-2">
              <Button
                type="primary"
                icon={<BarChartOutlined />}
                size="large"
                shape="circle"
                className="bg-rose-600"
              />
              <h1 className="text-xl font-semibold text-rose-600">
                Transactions
              </h1>
            </div>

            <Divider type="vertical" className="h-24" />

            <div>
              <h1 className="text-3xl font-bold text-rose-400">
                {totalTransactions} T
              </h1>
              <p className="text-lg mt-1 text-zinc-400">
                {calcFakeGrowth(totalTransactions)}
              </p>
            </div>
          </div>
        </Card>

        {/* ===== CREDITS ===== */}
        <Card className="shadow">
          <div className="flex justify-around items-center">
            <div className="flex items-center flex-col gap-y-2">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                shape="circle"
                className="bg-green-600"
              />
              <h1 className="text-xl font-semibold text-green-600">Credits</h1>
            </div>

            <Divider type="vertical" className="h-24" />

            <div>
              <h1 className="text-3xl font-bold text-green-400">
                {totalCredit} T
              </h1>
              <p className="text-lg mt-1 text-zinc-400">
                {calcFakeGrowth(totalCredit)}
              </p>
            </div>
          </div>
        </Card>

        {/* ===== DEBITS ===== */}
        <Card className="shadow">
          <div className="flex justify-around items-center">
            <div className="flex items-center flex-col gap-y-2">
              <Button
                type="primary"
                icon={<MinusOutlined />}
                size="large"
                shape="circle"
                className="bg-orange-600"
              />
              <h1 className="text-xl font-semibold text-orange-600">Debits</h1>
            </div>

            <Divider type="vertical" className="h-24" />

            <div>
              <h1 className="text-3xl font-bold text-orange-400">
                {totalDebit} T
              </h1>
              <p className="text-lg mt-1 text-zinc-400">
                {calcFakeGrowth(totalDebit)}
              </p>
            </div>
          </div>
        </Card>

        {/* ===== BALANCE ===== */}
        <Card className="shadow">
          <div className="flex justify-around items-center">
            <div className="flex items-center flex-col gap-y-2">
              <Button
                type="primary"
                icon={<DollarOutlined />}
                size="large"
                shape="circle"
                className="bg-blue-600"
              />
              <h1 className="text-xl font-semibold text-blue-600">Balance</h1>
            </div>

            <Divider type="vertical" className="h-24" />

            <div>
              <h1 className="text-3xl font-bold text-blue-400">{balance} T</h1>
              <p className="text-lg mt-1 text-zinc-400">
                {calcFakeGrowth(balance)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
