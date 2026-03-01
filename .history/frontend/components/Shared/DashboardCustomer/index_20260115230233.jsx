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
      try {
        const httpReq = http();
        const res = await httpReq.get(
          `/api/transaction/pagination?page=1&pageSize=100&accountNo=${userInfo.accountNo}`
        );
        setAllTransactions(res.data.data || []);
      } catch (err) {
        console.error("Fetch transactions error", err);
      }
    };

    fetchAll();
  }, [userInfo?.accountNo]);

  const filterByDate = (list) => {
    if (!fromDate && !toDate) return list;

    const start = fromDate ? dayjs(fromDate).startOf("day") : null;
    const end = toDate ? dayjs(toDate).endOf("day") : null;

    return list.filter((t) => {
      const txDate = dayjs(t.createdAt);
      if (start && txDate.isBefore(start)) return false;
      if (end && txDate.isAfter(end)) return false;
      return true;
    });
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

    const successChart = filtered
      .filter((t) => t.status === "success")
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((t) => ({
        date: dayjs(t.createdAt).format("DD-MM"),
        amount: t.transactionAmount,
      }));

    const pendingChart = filtered
      .filter((t) => t.status === "pending")
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((t) => ({
        date: dayjs(t.createdAt).format("DD-MM"),
        amount: t.transactionAmount,
      }));

    setChartData(successChart);
    setPendingChartData(pendingChart);
  }, [allTransactions, fromDate, toDate]);

  const tooltipProps = {
    formatter: (value) => {
      const sign = value >= 0 ? "+" : "-";
      const amount = Math.abs(value).toLocaleString();

      return [`So tien: ${sign}${amount} VND`, ""];
    },
    labelFormatter: (label) => `Ngay: ${label}`,
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="grid grid-cols-4 bg-blue-600 text-white rounded-lg overflow-hidden">
        {summary.map((item, index) => (
          <div
            key={index}
            className="text-center py-5 border-r border-blue-500 last:border-r-0"
          >
            <div className="text-lg font-semibold">{item.value}</div>
            <div className="text-sm opacity-80">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <DatePicker
          placeholder="Tu ngay"
          value={fromDate}
          onChange={setFromDate}
        />
        <DatePicker
          placeholder="Den ngay"
          value={toDate}
          onChange={setToDate}
          disabledDate={(current) =>
            fromDate && current.isBefore(fromDate, "day")
          }
        />
      </div>

      <Card title="Tong tien giao dich" extra={<b>{summary[3]?.value}</b>}>
        <div className="h-[300px]">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, "auto"]} />
              <Tooltip {...tooltipProps} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#1677ff"
                strokeWidth={3}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card title="Giao dich thanh cong" extra={<b>{summary[0]?.value}</b>}>
          <div className="h-[240px]">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis domain={[0, "auto"]} />
                <Tooltip {...tooltipProps} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#1677ff"
                  strokeWidth={3}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Giao dich dang thuc hien"
          extra={<b>{summary[2]?.value}</b>}
        >
          <div className="h-[240px]">
            {pendingChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                Khong co du lieu
              </div>
            ) : (
              <ResponsiveContainer>
                <LineChart data={pendingChartData}>
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, "auto"]} />
                  <Tooltip {...tooltipProps} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#faad14"
                    strokeWidth={3}
                    dot
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardCustomer;
