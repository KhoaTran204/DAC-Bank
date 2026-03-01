import { Card, Button, Divider, DatePicker } from "antd";
import {
  BarChartOutlined,
  PlusOutlined,
  MinusOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { http } from "../modules/modules";
import dayjs from "dayjs";

const Dashboard = ({ data = {}, branch }) => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [accountChart, setAccountChart] = useState([]);
  const [transactionChart, setTransactionChart] = useState([]);
  const [pieData, setPieData] = useState([]);

  /* ===== SUMMARY ===== */
  const totalTransactions = Number(data.totalTransactions) || 0;
  const totalCredit = Number(data.totalCredit) || 0;
  const totalDebit = Number(data.totalDebit) || 0;
  const balance = Number(data.balance) || 0;

  useEffect(() => {
    const fetchDashboard = async () => {
      const httpReq = http();

      const params = {
        branch,
        fromDate: fromDate ? dayjs(fromDate).format("YYYY-MM-DD") : null,
        toDate: toDate ? dayjs(toDate).format("YYYY-MM-DD") : null,
      };

      const res = await httpReq.get("/api/dashboard/overview", { params });

      setAccountChart(res.data.accountChart || []);
      setTransactionChart(res.data.transactionChart || []);
      setPieData(res.data.pieData || []);
    };

    fetchDashboard();
  }, [fromDate, toDate, branch]);

  return (
    <div className="space-y-10">
      {/* FILTER */}
      <div className="flex justify-end gap-3">
        <DatePicker value={fromDate} onChange={setFromDate} />
        <DatePicker value={toDate} onChange={setToDate} />
      </div>

      {/* SUMMARY */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <h3>Transactions</h3>
          <h1>{totalTransactions}</h1>
        </Card>
        <Card>
          <h3>Credits</h3>
          <h1>{totalCredit}</h1>
        </Card>
        <Card>
          <h3>Debits</h3>
          <h1>{totalDebit}</h1>
        </Card>
        <Card>
          <h3>Balance</h3>
          <h1>{balance}</h1>
        </Card>
      </div>

      {/* BAR CHARTS */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card title="So tai khoan tao moi theo ngay">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={accountChart}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="So giao dich theo ngay">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transactionChart}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* PIE */}
      <Card title="Tong so tien giao dich">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {pieData.map((_, idx) => (
                <Cell key={idx} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default Dashboard;
