import { Card, DatePicker, Tag } from "antd";
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

const DashboardCustomer = () => {
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const [allTransactions, setAllTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

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

  useEffect(() => {
    const currentList = allTransactions.filter((t) => t.status === "success");

    const map = {};
    currentList.forEach((t) => {
      const date = dayjs(t.createdAt).format("DD/MM");
      if (!map[date]) map[date] = { date, credit: 0, debit: 0 };

      if (t.transactionType === "cr") map[date].credit += t.transactionAmount;
      if (t.transactionType === "dr") map[date].debit += t.transactionAmount;
    });

    let balance = 0;

    const daily = Object.values(map).map((d) => {
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
  }, [allTransactions]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Tổng quan tài khoản
          </h1>
          <p className="text-gray-500">Theo dõi dòng tiền và số dư của bạn</p>
        </div>

        <div className="flex gap-2">
          <DatePicker value={fromDate} onChange={setFromDate} />
          <DatePicker value={toDate} onChange={setToDate} />
        </div>
      </div>

      {/* CARD TÀI KHOẢN CHÍNH */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-xl">
        <div className="text-sm opacity-80">Tài khoản thanh toán</div>
        <div className="text-3xl font-bold tracking-wide mt-2">
          {summary[2]?.value?.toLocaleString()} VND
        </div>
        <div className="mt-3 text-sm opacity-80">
          STK: {userInfo?.accountNo}
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {summary.map((item, idx) => (
          <Card key={idx} bordered={false} className="rounded-2xl shadow-md">
            <div className="text-gray-500 text-sm">{item.label}</div>
            <div className="text-2xl font-bold text-gray-800 mt-2">
              {typeof item.value === "number"
                ? item.value.toLocaleString() + " VND"
                : item.value}
            </div>
          </Card>
        ))}
      </div>

      {/* CHART */}
      <Card
        title="Biểu đồ dòng tiền"
        bordered={false}
        className="rounded-2xl shadow-lg"
      >
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="credit"
                stroke="#16a34a"
                strokeWidth={3}
                name="Tiền vào"
              />
              <Line
                type="monotone"
                dataKey="debit"
                stroke="#dc2626"
                strokeWidth={3}
                name="Tiền ra"
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#1e3a8a"
                strokeWidth={4}
                name="Số dư"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default DashboardCustomer;
