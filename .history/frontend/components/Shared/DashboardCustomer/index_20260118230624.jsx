import { Card, DatePicker } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { http } from "../../../modules/modules";
import dayjs from "dayjs";

const DashboardCustomer = () => {
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

  const [allTransactions, setAllTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [pendingChartData, setPendingChartData] = useState([]);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!userInfo?.accountNo) return;

    const fetchAll = async () => {
      const httpReq = http();
      const res = await httpReq.get(
        `/api/transaction/pagination?page=1&pageSize=100&accountNo=${userInfo.accountNo}`
      );
      setAllTransactions(res.data.data || []);
    };

    fetchAll();
  }, [userInfo?.accountNo]);

  /* ================= FILTER BY DATE ================= */
  const filterByDate = (list) => {
    if (!fromDate && !toDate) return list;

    const start = fromDate ? dayjs(fromDate).startOf("day") : null;
    const end = toDate ? dayjs(toDate).endOf("day") : null;

    return list.filter((t) => {
      const d = dayjs(t.createdAt);
      if (start && d.isBefore(start)) return false;
      if (end && d.isAfter(end)) return false;
      return true;
    });
  };

  /* ================= TOOLTIP ================= */
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const tx = payload[0].payload;
    const isDebit = tx.transactionType === "dr";

    return (
      <div className="bg-white p-3 border rounded-lg shadow text-sm">
        <div>
          <strong>Ngày:</strong> {label}
        </div>
        <div
          className={`font-semibold ${
            isDebit ? "text-red-500" : "text-blue-600"
          }`}
        >
          Số tiền: {isDebit ? "-" : "+"}
          {tx.amount.toLocaleString()} VND
        </div>
      </div>
    );
  };

  /* ================= CALCULATE SUMMARY & CHART ================= */
  useEffect(() => {
    const filtered = filterByDate(allTransactions);

    const successList = filtered.filter(
      (t) => t.status === "success" && t.transactionType === "dr"
    );
    const failedList = filtered.filter((t) => t.status === "failed");
    const pendingList = filtered.filter((t) => t.status === "pending");

    const totalSuccessAmount = successList.reduce(
      (sum, t) => sum + t.transactionAmount,
      0
    );

    setSummary([
      {
        label: "Tổng tiền giao dịch",
        value: `${totalSuccessAmount.toLocaleString()} VND`,
      },
      {
        label: "Giao dịch thành công",
        value: `${successList.length} GD`,
      },
      {
        label: "Giao dịch đang xử lý",
        value: `${pendingList.length} GD`,
      },
      {
        label: "Giao dịch lỗi",
        value: `${failedList.length} GD`,
      },
    ]);

    const buildChart = (list) =>
      list
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((t) => ({
          date: dayjs(t.createdAt).format("DD-MM"),
          amount: t.transactionAmount,
          transactionType: t.transactionType,
        }));

    setChartData(buildChart(successList));
    setPendingChartData(buildChart(pendingList));
  }, [allTransactions, fromDate, toDate]);

  return (
    <div className="w-full px-6 lg:px-10 space-y-10">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tổng quan tài khoản</h1>
          <p className="text-gray-500 text-sm">
            Theo dõi dòng tiền và giao dịch của bạn
          </p>
        </div>

        <div className="flex gap-3">
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
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {summary.map((item, idx) => (
          <Card
            key={idx}
            className="rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="text-gray-500 text-sm">{item.label}</div>
            <div className="text-2xl font-bold mt-2 text-blue-600">
              {item.value}
            </div>
          </Card>
        ))}
      </div>

      {/* ================= MAIN CHART ================= */}
      <Card
        title="Biến động tiền theo thời gian"
        className="rounded-xl shadow-md"
      >
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 60, bottom: 50 }}
            >
              <XAxis
                dataKey="date"
                label={{
                  value: "Ngày giao dịch",
                  position: "bottom",
                  offset: 20,
                }}
              />
              <YAxis
                label={{
                  value: "Số tiền (VND)",
                  angle: -90,
                  position: "left",
                  offset: 20,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                dataKey="amount"
                stroke="#1677ff"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ================= SUB CHARTS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* ---- SUCCESS ---- */}
        <Card title="Giao dịch thành công" className="rounded-xl shadow-sm">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 50, bottom: 40 }}
            >
              <XAxis
                dataKey="date"
                label={{
                  value: "Ngày giao dịch",
                  position: "bottom",
                  offset: 20,
                }}
              />
              <YAxis
                label={{
                  value: "Số tiền (VND)",
                  angle: -90,
                  position: "left",
                  offset: 15,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line dataKey="amount" stroke="#1677ff" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* ---- PENDING ---- */}
        <Card title="Giao dịch đang xử lý" className="rounded-xl shadow-sm">
          {pendingChartData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-gray-400">
              Không có dữ liệu
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={pendingChartData}
                margin={{ top: 20, right: 20, left: 50, bottom: 40 }}
              >
                <XAxis
                  dataKey="date"
                  label={{
                    value: "Ngày giao dịch",
                    position: "bottom",
                    offset: 20,
                  }}
                />
                <YAxis
                  label={{
                    value: "Số tiền (VND)",
                    angle: -90,
                    position: "left",
                    offset: 15,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line dataKey="amount" stroke="#faad14" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardCustomer;
