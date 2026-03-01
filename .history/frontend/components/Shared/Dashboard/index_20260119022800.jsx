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

/* ================= TOOLTIP ================= */
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

  /* RAW DATA */
  const [rawAccountChart, setRawAccountChart] = useState([]);
  const [rawTransactionChart, setRawTransactionChart] = useState([]);

  /* FILTERED DATA */
  const [accountChart, setAccountChart] = useState([]);
  const [transactionChart, setTransactionChart] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [overviewSummary, setOverviewSummary] = useState({
    totalAccounts: 0,
  });

  const {
    totalAccounts = 0,
    totalTransactions = 0,
    totalCredit = 0,
    totalDebit = 0,
    balance = 0,
  } = data;

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchDashboard = async () => {
      const httpReq = http();
      const res = await httpReq.get("/api/dashboard/overview", {
        params: { branch },
      });

      setRawAccountChart(res.data.accountChart || []);
      setRawTransactionChart(res.data.transactionChart || []);
      setPieData(res.data.pieData || []);

      // ✅ DUNG: res chi duoc dung TRONG DAY
      setOverviewSummary({
        totalAccounts: res.data.totalAccounts || 0,
      });
    };

    fetchDashboard();
  }, [branch]);

  /* ================= PARSE NGÀY (FIX FILTER) ================= */
  const parseChartDate = (dateStr) => {
    // dateStr: "DD-MM"
    const year = dayjs().year();
    return dayjs(`${year}-${dateStr}`, "YYYY-DD-MM");
  };

  /* ================= FILTER THEO NGÀY ================= */
  const filterByDate = (list) => {
    if (!fromDate && !toDate) return list;

    const start = fromDate ? dayjs(fromDate).startOf("day") : null;
    const end = toDate ? dayjs(toDate).endOf("day") : null;

    return list.filter((item) => {
      const d = parseChartDate(item.date);
      if (start && d.isBefore(start)) return false;
      if (end && d.isAfter(end)) return false;
      return true;
    });
  };

  /* ================= APPLY FILTER ================= */
  useEffect(() => {
    setAccountChart(filterByDate(rawAccountChart));
    setTransactionChart(filterByDate(rawTransactionChart));
  }, [fromDate, toDate, rawAccountChart, rawTransactionChart]);
  console.log("DASHBOARD DATA:", data);
  console.log("ACCOUNT CHART:", rawAccountChart);

  return (
    <div className="space-y-12">
      {/* ================= BỘ LỌC ================= */}
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

      {/* ================= TỔNG QUAN ================= */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <div className="text-sm text-gray-500">Tổng số tài khoản</div>
          <div className="text-2xl font-semibold">
            {overviewSummary.totalAccounts}
          </div>
        </Card>

        <Card>
          <div className="text-sm text-gray-500">Tổng số giao dịch</div>
          <div className="text-2xl font-semibold">{totalTransactions}</div>
        </Card>

        <Card>
          <div className="text-sm text-gray-500">Tổng doanh thu</div>
          <div className="text-2xl font-semibold text-blue-600">
            {totalCredit.toLocaleString()} VND
          </div>
        </Card>

        <Card>
          <div className="text-sm text-gray-500">Số dư hiện tại</div>
          <div className="text-2xl font-semibold text-green-600">
            {balance.toLocaleString()} VND
          </div>
        </Card>
      </div>

      {/* ================= BIỂU ĐỒ TRÊN ================= */}
      <Card title="Số tài khoản tạo mới theo ngày">
        <ResponsiveContainer width="100%" height={340}>
          <BarChart
            data={accountChart}
            margin={{ top: 20, left: 60, bottom: 50 }}
          >
            <XAxis
              dataKey="date"
              label={{
                value: "Ngày tạo tài khoản",
                position: "bottom",
                offset: 25,
              }}
            />
            <YAxis
              allowDecimals={false}
              label={{
                value: "Số tài khoản",
                angle: -90,
                position: "left",
                offset: 15,
              }}
            />
            <Tooltip content={<BarTooltip unit="tài khoản" />} />
            <Bar dataKey="value" fill="#52c41a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ================= BIỂU ĐỒ DƯỚI ================= */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* ===== BIỂU ĐỒ TRÒN (TRÁI) ===== */}
        <Card title="Tổng số tiền giao dịch">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
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

        {/* ===== BIỂU ĐỒ CỘT (PHẢI) ===== */}
        <Card title="Số giao dịch theo ngày">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={transactionChart}
              margin={{ top: 20, left: 60, bottom: 50 }}
            >
              <XAxis
                dataKey="date"
                label={{
                  value: "Ngày giao dịch",
                  position: "bottom",
                  offset: 25,
                }}
              />
              <YAxis
                allowDecimals={false}
                label={{
                  value: "Số giao dịch",
                  angle: -90,
                  position: "left",
                  offset: 15,
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
