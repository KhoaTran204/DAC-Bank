import { DatePicker } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";
import { http } from "../../../modules/modules";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

const DashboardCustomer = () => {
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

  const [allTransactions, setAllTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [chartData, setChartData] = useState([]);

  // ✅ mặc định 30 ngày gần nhất
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);

  // ===============================
  // FETCH DATA
  // ===============================
  useEffect(() => {
    if (!userInfo?.accountNo) return;

    const fetchData = async () => {
      try {
        const httpReq = http();
        const res = await httpReq.get(
          `/api/transaction/pagination?page=1&pageSize=500&accountNo=${userInfo.accountNo}`,
        );

        setAllTransactions(res.data?.data || []);
      } catch (err) {
        console.log("Fetch error:", err);
      }
    };

    fetchData();
  }, [userInfo?.accountNo]);

  // ===============================
  // FILTER + GROUP + CALCULATE
  // ===============================
  useEffect(() => {
    let filtered = allTransactions.filter((t) => t.status === "success");

    // ✅ LỌC THEO DATE RANGE (bao gồm ngày đầu + cuối)
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;

      filtered = filtered.filter((t) => {
        const created = dayjs(t.createdAt);

        return created.isBetween(
          start.startOf("day"),
          end.endOf("day"),
          null,
          "[]",
        );
      });
    }

    // ===============================
    // GROUP THEO NGÀY
    // ===============================
    const map = {};

    filtered.forEach((t) => {
      const dateKey = dayjs(t.createdAt).format("YYYY-MM-DD");

      if (!map[dateKey]) {
        map[dateKey] = {
          fullDate: dateKey,
          date: dayjs(dateKey).format("DD/MM"),
          credit: 0,
          debit: 0,
        };
      }

      if (t.transactionType === "cr")
        map[dateKey].credit += t.transactionAmount;

      if (t.transactionType === "dr") map[dateKey].debit += t.transactionAmount;
    });

    let balance = 0;

    const daily = Object.values(map)
      .sort((a, b) => dayjs(a.fullDate).unix() - dayjs(b.fullDate).unix())
      .map((d) => {
        balance += d.credit - d.debit;
        return { ...d, balance };
      });

    setChartData(daily);

    const totalIn = daily.reduce((s, d) => s + d.credit, 0);
    const totalOut = daily.reduce((s, d) => s + d.debit, 0);

    setSummary([
      { label: "Tổng tiền vào", value: totalIn },
      { label: "Tổng tiền ra", value: totalOut },
      { label: "Số dư cuối kỳ", value: balance },
      { label: "Số ngày giao dịch", value: daily.length },
    ]);
  }, [allTransactions, dateRange]);

  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3A]">
            Tổng quan tài khoản
          </h1>
          <p className="text-gray-500">Theo dõi dòng tiền và số dư của bạn</p>
        </div>

        {/* RANGE PICKER */}
        <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates)}
          format="DD/MM/YYYY"
          style={{ width: 280 }}
          separator={
            <span
              style={{
                margin: "0 10px",
                fontWeight: 500,
                color: "#888",
              }}
            >
              →
            </span>
          }
        />
      </div>

      {/* ================= ACCOUNT CARD ================= */}
      <div className="bg-gradient-to-r from-[#0B1F3A] to-[#003C6C] text-white p-8 rounded-3xl shadow-2xl">
        <div className="text-sm opacity-70">Tài khoản thanh toán</div>

        <div className="text-4xl font-bold mt-3 tracking-wide text-[#00C2FF]">
          {summary[2]?.value?.toLocaleString("vi-VN") || 0} VND
        </div>

        <div className="mt-4 text-sm opacity-70">
          STK: {userInfo?.accountNo}
        </div>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summary.map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
          >
            <div className="text-gray-500 text-sm">{item.label}</div>

            <div className="text-2xl font-bold text-[#0B1F3A] mt-2">
              {typeof item.value === "number"
                ? item.value.toLocaleString("vi-VN") + " VND"
                : item.value}
            </div>
          </div>
        ))}
      </div>

      {/* ================= CHART ================= */}
      <div className="bg-white p-6 rounded-3xl shadow-xl">
        <h2 className="text-lg font-semibold text-[#0B1F3A] mb-4">
          Biểu đồ dòng tiền
        </h2>

        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value) => value.toLocaleString("vi-VN") + " VND"}
              />
              <Line
                type="monotone"
                dataKey="credit"
                stroke="#10B981"
                strokeWidth={3}
                name="Tiền vào"
              />
              <Line
                type="monotone"
                dataKey="debit"
                stroke="#F97316"
                strokeWidth={3}
                name="Tiền ra"
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#00C2FF"
                strokeWidth={4}
                name="Số dư"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCustomer;
