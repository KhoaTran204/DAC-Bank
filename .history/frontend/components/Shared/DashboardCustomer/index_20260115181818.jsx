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
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

  /* ================= STATE ================= */
  const [summary, setSummary] = useState([]);
  const [chartData, setChartData] = useState([]);

  /* ================= FETCH SUMMARY ================= */
  useEffect(() => {
    if (!userInfo?.accountNo) return;

    const fetchSummary = async () => {
      try {
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
      } catch (err) {
        console.error("Fetch summary error", err);
      }
    };

    fetchSummary();
  }, [userInfo?.accountNo]);

  /* ================= FETCH CHART ================= */
  useEffect(() => {
    if (!userInfo?.accountNo) return;

    const fetchChart = async () => {
      try {
        const httpReq = http();
        const res = await httpReq.get(
          `/api/transaction?page=1&pageSize=7&accountNo=${userInfo.accountNo}`
        );

        const data = res.data.data.reverse().map((t) => ({
          date: new Date(t.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          }),
          // CHI VE SO DUONG -> BIEU DO BAT DAU TU 0
          amount: t.transactionType === "cr" ? t.transactionAmount : 0,
        }));

        setChartData(data);
      } catch (err) {
        console.error("Fetch chart error", err);
      }
    };

    fetchChart();
  }, [userInfo?.accountNo]);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* ===== TOP BLUE BAR ===== */}
      <div className="grid grid-cols-4 bg-blue-600 text-white rounded-lg overflow-hidden">
        {summary.map((item, index) => (
          <div
            key={index}
            className="text-center py-5 border-r last:border-r-0 border-blue-500"
          >
            <div className="text-lg font-semibold">{item.value}</div>
            <div className="text-sm opacity-80">{item.label}</div>
          </div>
        ))}
      </div>

      {/* ===== FILTER (UI ONLY) ===== */}
      <div className="flex justify-end gap-3">
        <DatePicker placeholder="Tu ngay" />
        <DatePicker placeholder="Den ngay" />
      </div>

      {/* ===== TOTAL TRANSACTION ===== */}
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
              {/* FIX: BAT DAU TU 0 */}
              <YAxis domain={[0, "auto"]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#1677ff"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ===== BOTTOM ===== */}
      <div className="grid grid-cols-2 gap-6">
        <Card
          title="Giao dich thanh cong"
          extra={
            <span className="text-blue-600 font-semibold">
              {summary[0]?.value || "0 VND"}
            </span>
          }
        >
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.filter((d) => d.amount > 0)}>
                <XAxis dataKey="date" />
                <YAxis domain={[0, "auto"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#1677ff"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Giao dich dang thuc hien">
          <div className="h-[240px] flex items-center justify-center text-gray-400">
            Khong co du lieu
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardCustomer;
