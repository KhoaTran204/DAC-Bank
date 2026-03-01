import { Card, DatePicker } from "antd";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { http } from "../../../modules/modules";
import dayjs from "dayjs";

/* ================= MÀU ================= */
const PRIMARY = "#1677ff";
const SUCCESS = "#52c41a";
const DANGER = "#ff4d4f";

/* ================= TOOLTIP ================= */
const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white p-3 border rounded shadow text-sm">
      <div className="font-medium">Ngày: {label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString()} {unit}
        </div>
      ))}
    </div>
  );
};

/* ================= DASHBOARD ================= */
const Dashboard = ({ data = {}, branch }) => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [accountChart, setAccountChart] = useState([]);
  const [transactionChart, setTransactionChart] = useState([]);

  const {
    totalAccounts = 0,
    totalTransactions = 0,
    totalCredit = 0,
    totalDebit = 0,
    balance = 0,
  } = data;

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchData = async () => {
      const httpReq = http();
      const res = await httpReq.get("/api/dashboard/overview", {
        params: { branch },
      });

      const currentYear = dayjs().year();

      /* FIX: LOẠI NGÀY KHÁC NĂM → HẾT 31/12 */
      const filterValidYear = (list = []) =>
        list.filter((i) =>
          dayjs(`${currentYear}-${i.date}`, "YYYY-DD-MM").isValid(),
        );

      setAccountChart(filterValidYear(res.data.accountChart));
      setTransactionChart(filterValidYear(res.data.transactionChart));
    };

    fetchData();
  }, [branch]);

  /* ================= FILTER THEO NGÀY ================= */
  const filterByDate = (list) => {
    if (!fromDate && !toDate) return list;

    return list.filter((item) => {
      const d = dayjs(`${dayjs().year()}-${item.date}`, "YYYY-DD-MM");
      if (fromDate && d.isBefore(dayjs(fromDate))) return false;
      if (toDate && d.isAfter(dayjs(toDate))) return false;
      return true;
    });
  };

  const filteredAccounts = filterByDate(accountChart);
  const filteredTransactions = filterByDate(transactionChart);

  /* ================= DATA TIỀN VÀO / RA ================= */
  const moneyCompare = [
    { name: "Tiền vào", value: totalCredit },
    { name: "Tiền ra", value: totalDebit },
  ];

  return (
    <div className="space-y-12">
      {/* ================= BỘ LỌC ================= */}
      <div className="flex justify-end gap-3">
        <DatePicker placeholder="Từ ngày" onChange={setFromDate} />
        <DatePicker placeholder="Đến ngày" onChange={setToDate} />
      </div>

      {/* ================= TỔNG QUAN ================= */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <div className="text-sm text-gray-500">Tổng số tài khoản</div>
          <div className="text-2xl font-semibold text-blue-600">
            {totalAccounts}
          </div>
        </Card>

        <Card>
          <div className="text-sm text-gray-500">Tổng số giao dịch</div>
          <div className="text-2xl font-semibold text-blue-600">
            {totalTransactions}
          </div>
        </Card>

        <Card>
          <div className="text-sm text-gray-500">Tổng tiền vào</div>
          <div className="text-2xl font-semibold text-green-600">
            {totalCredit.toLocaleString()} VND
          </div>
        </Card>

        <Card>
          <div className="text-sm text-gray-500">Số dư hiện tại</div>
          <div className="text-2xl font-semibold text-blue-600">
            {balance.toLocaleString()} VND
          </div>
        </Card>
      </div>

      {/* ================= BIỂU ĐỒ CHÍNH ================= */}
      <Card title="Số tài khoản tạo mới theo ngày">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={filteredAccounts}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip content={<CustomTooltip unit="tài khoản" />} />
            <Bar dataKey="value" fill={SUCCESS} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ================= BIỂU ĐỒ DƯỚI ================= */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* ===== TIỀN VÀO / RA ===== */}
        <Card title="So sánh tiền vào và tiền ra">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={moneyCompare}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={PRIMARY} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ===== XU HƯỚNG GIAO DỊCH ===== */}
        <Card title="Xu hướng số giao dịch">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={filteredTransactions}>
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip unit="giao dịch" />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={PRIMARY}
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
