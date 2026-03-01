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

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const tx = payload[0].payload;
    const isDebit = tx.transactionType === "dr";
    const color = isDebit ? "#ff4d4f" : "#1677ff";
    const sign = isDebit ? "-" : "+";

    return (
      <div className="bg-white p-3 border rounded shadow text-sm">
        <div>
          <strong>Ngay:</strong> {label}
        </div>
        <div style={{ color, fontWeight: 600 }}>
          So tien: {sign}
          {tx.amount.toLocaleString()} VND
        </div>
      </div>
    );
  };

  useEffect(() => {
    const filtered = filterByDate(allTransactions);

    const successList = filtered.filter(
      (t) => t.status === "success" && t.transactionType === "dr"
    );
    const failedList = filtered.filter((t) => t.status === "failed");
    const pendingList = filtered.filter((t) => t.status === "pending");

    const successAmount = successList.reduce(
      (sum, t) => sum + t.transactionAmount,
      0
    );

    setSummary([
      {
        label: "Giao dich thanh cong",
        value: `${successAmount.toLocaleString()} VND`,
      },
      { label: "Giao dich loi", value: `${failedList.length} GD` },
      { label: "Giao dich dang thuc hien", value: `${pendingList.length} GD` },
      { label: "Tong", value: `${successAmount.toLocaleString()} VND` },
    ]);

    const buildChart = (list) =>
      list
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((t) => ({
          date: dayjs(t.createdAt).format("DD-MM"),
          amount: t.transactionAmount,
          transactionType: t.transactionType,
        }));

    setChartData(buildChart(filtered.filter((t) => t.status === "success")));
    setPendingChartData(
      buildChart(filtered.filter((t) => t.status === "pending"))
    );
  }, [allTransactions, fromDate, toDate]);

  return (
    <div className="max-w-[1200px] mx-auto space-y-10">
      {/* SUMMARY */}
      <div className="grid grid-cols-4 bg-blue-600 text-white rounded-lg">
        {summary.map((i, idx) => (
          <div key={idx} className="text-center py-5">
            <div className="text-lg font-semibold">{i.value}</div>
            <div className="text-sm opacity-80">{i.label}</div>
          </div>
        ))}
      </div>

      {/* FILTER */}
      <div className="flex justify-end gap-3">
        <DatePicker value={fromDate} onChange={setFromDate} />
        <DatePicker value={toDate} onChange={setToDate} />
      </div>

      {/* CHART LỚN */}
      <Card title="Tong tien giao dich">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 60, bottom: 50 }}
            >
              <XAxis
                dataKey="date"
                label={{
                  value: "Ngay giao dich",
                  position: "bottom",
                  offset: 20,
                }}
              />
              <YAxis
                domain={[0, "auto"]}
                label={{
                  value: "So tien (VND)",
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
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* CHART NHỎ */}
      <div className="grid grid-cols-2 gap-8 mt-6">
        <Card title="Giao dich thanh cong">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, "auto"]} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                dataKey="amount"
                stroke="#1677ff"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Giao dich dang thuc hien">
          {pendingChartData.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-gray-400">
              Khong co du lieu
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={pendingChartData}>
                <XAxis dataKey="date" />
                <YAxis domain={[0, "auto"]} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  dataKey="amount"
                  stroke="#faad14"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardCustomer;
