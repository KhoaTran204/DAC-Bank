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
  const [totalNet, setTotalNet] = useState(0);

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
      setAllTransactions(res.data?.data || []);
    };

    fetchAll();
  }, [userInfo?.accountNo]);

  /* ================= FILTER BY DATE ================= */
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

  /* ================= TOOLTIP ================= */
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const credit = payload.find((p) => p.dataKey === "credit")?.value || 0;
    const debit = payload.find((p) => p.dataKey === "debit")?.value || 0;

    return (
      <div className="bg-white p-3 border rounded-lg shadow text-sm space-y-1">
        <div className="font-semibold">Ngày {label}</div>

        <div className="text-blue-600">
          Tiền vào: +{credit.toLocaleString()} VND
        </div>

        <div className="text-red-500">
          Tiền ra: -{debit.toLocaleString()} VND
        </div>
      </div>
    );
  };

  /* ================= CALCULATE SUMMARY & CHART ================= */
  useEffect(() => {
    const filtered = filterByDate(allTransactions);

    const successList = filtered.filter((t) => t.status === "success");
    const pendingList = filtered.filter((t) => t.status === "pending");
    const failedList = filtered.filter((t) => t.status === "failed");

    const totalCredit = successList
      .filter((t) => t.transactionType === "cr")
      .reduce((sum, t) => sum + t.transactionAmount, 0);

    const totalDebit = successList
      .filter((t) => t.transactionType === "dr")
      .reduce((sum, t) => sum + t.transactionAmount, 0);

    const netAmount = totalCredit - totalDebit;
    setTotalNet(netAmount);

    setSummary([
      {
        label: "Dòng tiền ròng",
        value: `${netAmount.toLocaleString()} VND`,
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

    /* ===== GỘP DATA THEO NGÀY (CHUẨN NGÂN HÀNG) ===== */
    const dailyMap = {};

    successList.forEach((t) => {
      const date = dayjs(t.createdAt).format("DD-MM");

      if (!dailyMap[date]) {
        dailyMap[date] = { date, credit: 0, debit: 0 };
      }

      if (t.transactionType === "cr") {
        dailyMap[date].credit += t.transactionAmount;
      }

      if (t.transactionType === "dr") {
        dailyMap[date].debit += t.transactionAmount;
      }
    });

    setChartData(
      Object.values(dailyMap).sort(
        (a, b) => dayjs(a.date, "DD-MM") - dayjs(b.date, "DD-MM")
      )
    );
  }, [allTransactions, fromDate, toDate]);

  return (
    <div className="w-full px-6 lg:px-10 space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4">
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

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {summary.map((item, idx) => (
          <Card key={idx} className="rounded-xl shadow">
            <div className="text-gray-500 text-sm">{item.label}</div>
            <div
              className={`text-2xl font-bold mt-2 ${
                idx === 0 && totalNet < 0 ? "text-red-500" : "text-blue-600"
              }`}
            >
              {item.value}
            </div>
          </Card>
        ))}
      </div>

      {/* MAIN CHART */}
      <Card
        title={
          <div className="flex justify-between items-center">
            <span>Dòng tiền theo thời gian</span>
            <span
              className={`text-sm font-semibold ${
                totalNet >= 0 ? "text-blue-600" : "text-red-500"
              }`}
            >
              Tổng: {totalNet.toLocaleString()} VND
            </span>
          </div>
        }
      >
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 60, bottom: 40 }}
            >
              <XAxis
                dataKey="date"
                label={{ value: "Ngày", position: "bottom", offset: 20 }}
              />

              <YAxis
                label={{
                  value: "Số tiền (VND)",
                  angle: -90,
                  position: "left",
                  offset: 20,
                }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Line
                type="monotone"
                dataKey="credit"
                name="Tiền vào"
                stroke="#1677ff"
                strokeWidth={3}
                dot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="debit"
                name="Tiền ra"
                stroke="#ff4d4f"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default DashboardCustomer;
