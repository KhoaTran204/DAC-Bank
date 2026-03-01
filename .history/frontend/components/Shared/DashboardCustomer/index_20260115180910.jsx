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

const DashboardCustomer = () => {
  const [summary, setSummary] = useState([]);
  const [chartData, setChartData] = useState([]);
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

  /* ================= SUMMARY ================= */
  useEffect(() => {
    if (!userInfo?.accountNo) return;

    const fetchSummary = async () => {
      const httpReq = http();
      const res = await httpReq.get(
        `/api/transaction/summary?accountNo=${userInfo.accountNo}`
      );

      setSummary([
        {
          label: "Giao dich thanh cong",
          value: `${res.data.totalCredit.toLocaleString()} VND`,
        },
        {
          label: "Giao dich loi",
          value: "0 VND",
        },
        {
          label: "Giao dich dang thuc hien",
          value: "0 VND",
        },
        {
          label: "Tong",
          value: `${res.data.balance.toLocaleString()} VND`,
        },
      ]);
    };

    fetchSummary();
  }, []);

  /* ================= CHART ================= */
  useEffect(() => {
    if (!userInfo?.accountNo) return;

    const fetchChart = async () => {
      const httpReq = http();
      const res = await httpReq.get(
        `/api/transaction?page=1&pageSize=7&accountNo=${userInfo.accountNo}`
      );

      const formatted = res.data.data.reverse().map((t) => ({
        date: new Date(t.createdAt).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        amount:
          t.transactionType === "cr"
            ? t.transactionAmount
            : -t.transactionAmount,
      }));

      setChartData(formatted);
    };

    fetchChart();
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* ===== SUMMARY ===== */}
      <div className="grid grid-cols-4 bg-blue-600 text-white rounded-lg overflow-hidden">
        {summary.map((item, i) => (
          <div
            key={i}
            className="text-center py-5 border-r last:border-r-0 border-blue-500"
          >
            <div className="text-lg font-semibold">{item.value}</div>
            <div className="text-sm opacity-80">{item.label}</div>
          </div>
        ))}
      </div>

      {/* ===== FILTER ===== */}
      <div className="flex justify-end gap-3">
        <DatePicker placeholder="Tu ngay" />
        <DatePicker placeholder="Den ngay" />
      </div>

      {/* ===== TOTAL ===== */}
      <Card
        title="Tong tien giao dich"
        extra={
          <span className="text-blue-600 font-semibold">
            {summary[3]?.value || "0 VND"}
          </span>
        }
      >
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#1677ff"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default DashboardCustomer;
