import { Card, DatePicker } from "antd";
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
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { http } from "../../../modules/modules";
import dayjs from "dayjs";

const COLORS = ["#fa8c16"];

const Dashboard = ({ data = {}, branch }) => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [accountChart, setAccountChart] = useState([]);
  const [transactionChart, setTransactionChart] = useState([]);
  const [pieData, setPieData] = useState([]);

  const {
    totalTransactions = 0,
    totalCredit = 0,
    totalDebit = 0,
    balance = 0,
  } = data;

  useEffect(() => {
    const fetchDashboard = async () => {
      const httpReq = http();
      const res = await httpReq.get("/api/dashboard/overview", {
        params: {
          branch,
          fromDate: fromDate ? dayjs(fromDate).format("YYYY-MM-DD") : null,
          toDate: toDate ? dayjs(toDate).format("YYYY-MM-DD") : null,
        },
      });

      setAccountChart(res.data.accountChart || []);
      setTransactionChart(res.data.transactionChart || []);
      setPieData(res.data.pieData || []);
    };

    fetchDashboard();
  }, [fromDate, toDate, branch]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-white p-3 border rounded shadow text-sm">
        <div>
          <strong>Ngày:</strong> {label}
        </div>
        <div>
          <strong>Giá trị:</strong> {payload[0].value}
        </div>
      </div>
    );
  };

  const MoneyTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-white p-3 border rounded shadow text-sm">
        <strong>{payload[0].value.toLocaleString()} VND</strong>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* FILTER */}
      <div className="flex justify-end gap-3">
        <DatePicker
          placeholder="Từ ngày"
          value={fromDate}
          onChange={setFromDate}
        />
        <DatePicker
          placeholder="Đến ngày"
          value={toDate}
          onChange={setToDate}
        />
      </div>

      {/* SUMMARY */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <h3>Giao dịch</h3>
          <h1>{totalTransactions}</h1>
        </Card>
        <Card>
          <h3>Tổng thu</h3>
          <h1>{totalCredit.toLocaleString()} VND</h1>
        </Card>
        <Card>
          <h3>Tổng chi</h3>
          <h1>{totalDebit.toLocaleString()} VND</h1>
        </Card>
        <Card>
          <h3>Số dư</h3>
          <h1>{balance.toLocaleString()} VND</h1>
        </Card>
      </div>

      {/* BAR CHARTS */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card title="Số tài khoản tạo mới theo ngày">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={accountChart} margin={{ left: 40, bottom: 40 }}>
              <XAxis
                dataKey="date"
                label={{ value: "Ngày", position: "bottom", offset: 20 }}
              />
              <YAxis
                label={{ value: "Số tài khoản", angle: -90, position: "left" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#52c41a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Số giao dịch theo ngày">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transactionChart} margin={{ left: 40, bottom: 40 }}>
              <XAxis
                dataKey="date"
                label={{ value: "Ngày", position: "bottom", offset: 20 }}
              />
              <YAxis
                label={{ value: "Số giao dịch", angle: -90, position: "left" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#1677ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* PIE */}
      <Card title="Tổng số tiền đã giao dịch">
        <ResponsiveContainer width="100%" height={360}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ value }) => `${value.toLocaleString()} VND`}
            >
              {pieData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<MoneyTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default Dashboard;
