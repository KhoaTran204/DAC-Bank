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

  /* ================= FILTER BY DATE (DEFAULT 7 DAYS) ================= */
  const filterByDate = (list) => {
    let start;
    let end;

    // ✅ KHÔNG CHỌN NGÀY → MẶC ĐỊNH 7 NGÀY GẦN NHẤT
    if (!fromDate && !toDate) {
      end = dayjs().endOf("day");
      start = dayjs().subtract(6, "day").startOf("day");
    } else {
      start = fromDate ? fromDate.startOf("day") : null;
      end = toDate ? toDate.endOf("day") : null;
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

      {/* (PHẦN JSX PHÍA DƯỚI GIỮ NGUYÊN NHƯ BẠN ĐANG DÙNG) */}
    </div>
  );
};

export default DashboardCustomer;
