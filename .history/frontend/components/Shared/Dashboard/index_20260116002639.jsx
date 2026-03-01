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

/* ================= MÀU ================= */
const COLORS = ["#fa8c16"];

/* ================= TOOLTIP (GIỐNG CUSTOMER) ================= */
const BarTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-3 border rounded shadow text-sm">
      <div>
        <strong>Ngày:</strong> {label}
      </div>
      <div className="font-semibold text-blue-600">
        {payload[0].value} {unit}
      </div>
    </div>
  );
};

const MoneyTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-3 border rounded shadow text-sm">
      <div className="font-semibold text-orange-500">
        {payload[0].value.toLocaleString()} VND
      </div>
    </div>
  );
};

/* ================= DASHBOARD ================= */
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

  return (
    <div className="space-y-8">
      {/* ================= FILTER ================= */}
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

      {/* ================= SUMMARY ================= */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <div className="text-sm text-gray-500">Giao dịch</div>
          <div className="text-2xl font-semibold">{totalTransactions}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Tổng thu</div>
          <div className="text-2xl font-semibold text-blue-600">
            {totalCredit.toLocaleString()} VND
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Tổng chi</div>
          <div className="text-2xl font-semibold text-red-500">
            {totalDebit.toLocaleString()} VND
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Số dư</div>
          <div className="text-2xl font-semibold text-green-600">
            {balance.toLocaleString()} VND
          </div>
        </Card>
      </div>

      {/* ================= BIỂU ĐỒ TRÊN (FULL WIDTH) ================= */}
      <Card title="Số tài khoản tạo mới theo ngày">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={accountChart}
            margin={{ top: 20, left: 40, bottom: 40 }}
          >
            <XAxis
              dataKey="date"
              label={{ value: "Ngày", position: "bottom", offset: 20 }}
            />
            <YAxis
              allowDecimals={false}
              label={{
                value: "Số tài khoản",
                angle: -90,
                position: "left",
                offset: 10,
              }}
            />
            <Tooltip content={<BarTooltip unit="tài khoản" />} />
            <Bar dataKey="value" fill="#52c41a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ================= HÀNG DƯỚI ================= */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* ===== PIE CHART (BÊN TRÁI) ===== */}
        <Card title="Tổng tiền giao dịch">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ value }) => `${value.toLocaleString()} VND`}
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<MoneyTooltip />} />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* ===== BAR CHART (BÊN PHẢI) ===== */}
        <Card title="Số giao dịch theo ngày">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={transactionChart}
              margin={{ top: 20, left: 40, bottom: 40 }}
            >
              <XAxis
                dataKey="date"
                label={{ value: "Ngày", position: "bottom", offset: 20 }}
              />
              <YAxis
                allowDecimals={false}
                label={{
                  value: "Số giao dịch",
                  angle: -90,
                  position: "left",
                  offset: 10,
                }}
              />
              <Tooltip content={<BarTooltip unit="giao dịch" />} />
              <Bar dataKey="value" fill="#1677ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
