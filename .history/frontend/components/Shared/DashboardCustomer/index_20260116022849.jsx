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

  /* ================= FILTER DATE ================= */
  const filterByDate = (list) => {
    let start;
    let end;

    // mac dinh 7 ngay gan nhat
    if (!fromDate && !toDate) {
      end = dayjs().endOf("day");
      start = dayjs().subtract(6, "day").startOf("day");
    } else {
      start = fromDate ? dayjs(fromDate).startOf("day") : null;
      end = toDate ? dayjs(toDate).endOf("day") : null;
    }

    return list.filter((t) => {
      const d = dayjs(t.createdAt);
      if (start && d.isBefore(start)) return false;
      if (end && d.isAfter(end)) return false;
      return true;
    });
  };

  /* ================= TOOLTIP ================= */
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-white p-3 border rounded shadow text-sm">
        <div>
          <b>Ngay:</b> {label}
        </div>
        <div className="font-semibold text-blue-600">
          So tien: {payload[0].value.toLocaleString()} VND
        </div>
      </div>
    );
  };

  /* ================= SUMMARY + CHART ================= */
  useEffect(() => {
    const filtered = filterByDate(allTransactions);

    const successList = filtered.filter(
      (t) => t.status === "success" && t.transactionType === "dr"
    );
    const pendingList = filtered.filter((t) => t.status === "pending");
    const failedList = filtered.filter((t) => t.status === "failed");

    const totalSuccessAmount = successList.reduce(
      (sum, t) => sum + t.transactionAmount,
      0
    );

    setSummary([
      {
        label: "Tong tien giao dich",
        value: `${totalSuccessAmount.toLocaleString()} VND`,
      },
      { label: "Giao dich thanh cong", value: `${successList.length} GD` },
      { label: "Dang xu ly", value: `${pendingList.length} GD` },
      { label: "Giao dich loi", value: `${failedList.length} GD` },
    ]);

    /* ===== BUILD CHART (LUON DU 7 NGAY) ===== */
    const buildChart = (list) => {
      const end = dayjs().endOf("day");
      const start = dayjs().subtract(6, "day").startOf("day");

      // tao mang 7 ngay
      const days = [];
      for (let i = 0; i < 7; i++) {
        days.push(start.add(i, "day").format("DD-MM"));
      }

      // gom tien theo ngay
      const map = {};
      list.forEach((t) => {
        const d = dayjs(t.createdAt).format("DD-MM");
        map[d] = (map[d] || 0) + t.transactionAmount;
      });

      return days.map((d) => ({
        date: d,
        amount: map[d] || 0,
      }));
    };

    setChartData(buildChart(successList));
    setPendingChartData(buildChart(pendingList));
  }, [allTransactions, fromDate, toDate]);

  return (
    <div className="w-full px-6 lg:px-10 space-y-10">
      {/* HEADER */}
      <div className="flex justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tong quan tai khoan</h1>
          <p className="text-gray-500 text-sm">
            Theo doi dong tien 7 ngay gan nhat
          </p>
        </div>

        <div className="flex gap-3">
          <DatePicker
            placeholder="Tu ngay"
            value={fromDate}
            onChange={setFromDate}
          />
          <DatePicker
            placeholder="Den ngay"
            value={toDate}
            onChange={setToDate}
          />
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {summary.map((item, idx) => (
          <Card key={idx}>
            <div className="text-gray-500 text-sm">{item.label}</div>
            <div className="text-2xl font-bold mt-2 text-blue-600">
              {item.value}
            </div>
          </Card>
        ))}
      </div>

      {/* MAIN CHART */}
      <Card title="Bien dong tien 7 ngay gan nhat">
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line dataKey="amount" stroke="#1677ff" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* PENDING CHART */}
      <Card title="Giao dich dang xu ly">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={pendingChartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="amount" stroke="#faad14" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default DashboardCustomer;
