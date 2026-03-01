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
import dayjs from "dayjs";
import { http } from "../../../modules/modules";

const DashboardCustomer = () => {
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

  /* ================= STATE ================= */
  const [summary, setSummary] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  /* ================= FILTER FUNCTION ================= */
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

  /* ================= FETCH SUMMARY ================= */
  useEffect(() => {
    if (!userInfo?.accountNo) return;

    const fetchSummary = async () => {
      try {
        const httpReq = http();
        const res = await httpReq.get(
          `/api/transaction/pagination?page=1&pageSize=500&accountNo=${userInfo.accountNo}`
        );

        let list = res.data.data || [];
        list = filterByDate(list);

        const successList = list.filter((t) => t.status === "success");
        const failedList = list.filter((t) => t.status === "failed");
        const pendingList = list.filter((t) => t.status === "pending");

        const successAmount = successList.reduce(
          (sum, t) => sum + (t.transactionAmount || 0),
          0
        );

        setSummary([
          {
            label: "Giao dich thanh cong",
            value: `${successAmount.toLocaleString()} VND`,
          },
          {
            label: "Giao dich loi",
            value: `${failedList.length} GD`,
          },
          {
            label: "Giao dich dang thuc hien",
            value: `${pendingList.length} GD`,
          },
          {
            label: "Tong",
            value: `${successAmount.toLocaleString()} VND`,
          },
        ]);
      } catch (err) {
        console.error("Fetch summary error", err);
      }
    };

    fetchSummary();
  }, [userInfo?.accountNo, fromDate, toDate]);

  /* ================= FETCH CHART ================= */
  useEffect(() => {
    if (!userInfo?.accountNo) return;

    const fetchChart = async () => {
      try {
        const httpReq = http();
        const res = await httpReq.get(
          `/api/transaction/pagination?page=1&pageSize=500&accountNo=${userInfo.accountNo}`
        );

        let list = (res.data.data || []).filter((t) => t.status === "success");

        list = filterByDate(list);

        const mapByDate = {};

        list.forEach((t) => {
          const key = dayjs(t.createdAt).format("YYYY-MM-DD");
          mapByDate[key] = (mapByDate[key] || 0) + t.transactionAmount;
        });

        const data = Object.keys(mapByDate)
          .sort()
          .map((date) => ({
            date: dayjs(date).format("DD/MM"),
            amount: mapByDate[date],
          }));

        setChartData(data);
      } catch (err) {
        console.error("Fetch chart error", err);
      }
    };

    fetchChart();
  }, [userInfo?.accountNo, fromDate, toDate]);

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

      {/* ===== FILTER ===== */}
      <div className="flex justify-end gap-3">
        <DatePicker
          placeholder="Tu ngay"
          onChange={(d) => setFromDate(d)}
          value={fromDate}
        />
        <DatePicker
          placeholder="Den ngay"
          onChange={(d) => setToDate(d)}
          value={toDate}
        />
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
              <LineChart data={chartData}>
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
