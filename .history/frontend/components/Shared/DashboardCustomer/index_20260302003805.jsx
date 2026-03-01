import { Card, DatePicker, Tag } from "antd";
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
  const [compare, setCompare] = useState(null);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!userInfo?.accountNo) return;

    const fetchAll = async () => {
      const httpReq = http();
      const res = await httpReq.get(
        `/api/transaction/pagination?page=1&pageSize=200&accountNo=${userInfo.accountNo}`,
      );
      setAllTransactions(res.data?.data || []);
    };

    fetchAll();
  }, [userInfo?.accountNo]);

  /* ================= FILTER ================= */
  const filterByDate = (list, start, end) => {
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

    const data = payload[0].payload;

    return (
      <div className="bg-white p-3 border rounded-lg shadow text-sm space-y-1">
        <div className="font-semibold">Ngày {label}</div>
        <div className="text-blue-600">
          Tiền vào: +{data.credit.toLocaleString()} VND
        </div>
        <div className="text-red-500">
          Tiền ra: -{data.debit.toLocaleString()} VND
        </div>
        <div className="font-semibold text-gray-700">
          Số dư: {data.balance.toLocaleString()} VND
        </div>
        {data.isPeak && <Tag color="volcano">Biến động lớn</Tag>}
      </div>
    );
  };

  /* ================= MAIN CALC ================= */
  useEffect(() => {
    const start = fromDate ? dayjs(fromDate).startOf("day") : null;
    const end = toDate ? dayjs(toDate).endOf("day") : null;

    const currentList = filterByDate(allTransactions, start, end).filter(
      (t) => t.status === "success",
    );

    const map = {};
    currentList.forEach((t) => {
      const date = dayjs(t.createdAt).format("DD-MM");
      if (!map[date]) map[date] = { date, credit: 0, debit: 0 };
      if (t.transactionType === "cr") map[date].credit += t.transactionAmount;
      if (t.transactionType === "dr") map[date].debit += t.transactionAmount;
    });

    let balance = 0;
    let maxDiff = 0;

    const daily = Object.values(map)
      .sort((a, b) => dayjs(a.date, "DD-MM") - dayjs(b.date, "DD-MM"))
      .map((d) => {
        balance += d.credit - d.debit;
        const diff = Math.abs(d.credit - d.debit);
        if (diff > maxDiff) maxDiff = diff;
        return { ...d, balance, diff };
      })
      .map((d) => ({ ...d, isPeak: d.diff === maxDiff && maxDiff > 0 }));

    setChartData(daily);

    const totalIn = daily.reduce((s, d) => s + d.credit, 0);
    const totalOut = daily.reduce((s, d) => s + d.debit, 0);

    setSummary([
      { label: "Tổng tiền vào", value: `${totalIn.toLocaleString()} VND` },
      { label: "Tổng tiền ra", value: `${totalOut.toLocaleString()} VND` },
      { label: "Số dư cuối kỳ", value: `${balance.toLocaleString()} VND` },
      { label: "Số ngày giao dịch", value: `${daily.length} ngày` },
    ]);

    if (start && end) {
      const days = end.diff(start, "day") + 1;
      const prevStart = start.subtract(days, "day");
      const prevEnd = start.subtract(1, "day");

      const prevList = filterByDate(allTransactions, prevStart, prevEnd).filter(
        (t) => t.status === "success",
      );

      const prevIn = prevList
        .filter((t) => t.transactionType === "cr")
        .reduce((s, t) => s + t.transactionAmount, 0);

      setCompare({
        percent:
          prevIn === 0 ? 100 : (((totalIn - prevIn) / prevIn) * 100).toFixed(1),
      });
    }
  }, [allTransactions, fromDate, toDate]);

  return (
    <div className="w-full px-4 lg:px-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Tổng quan tài khoản</h1>
          <p className="text-gray-500 text-sm">
            Dòng tiền – Số dư – So sánh kỳ
          </p>
        </div>

        <div className="flex gap-2">
          <DatePicker size="small" value={fromDate} onChange={setFromDate} />
          <DatePicker size="small" value={toDate} onChange={setToDate} />
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((i, idx) => (
          <Card key={idx} size="small">
            <div className="text-gray-500 text-sm">{i.label}</div>
            <div className="text-xl font-bold text-blue-600 mt-1">
              {i.value}
            </div>
          </Card>
        ))}
      </div>

      {compare && (
        <Card size="small">
          <div className="font-semibold">
            So với kỳ trước:{" "}
            <span
              className={
                compare.percent >= 0 ? "text-green-600" : "text-red-500"
              }
            >
              {compare.percent}%
            </span>
          </div>
        </Card>
      )}

      {/* CHART */}
      <Card title="Dòng tiền & Số dư" size="small">
        <div className="h-[260px] lg:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line dataKey="credit" stroke="#1677ff" strokeWidth={3} />
              <Line dataKey="debit" stroke="#ff4d4f" strokeWidth={3} />
              <Line dataKey="balance" stroke="#002766" strokeWidth={4} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default DashboardCustomer;
