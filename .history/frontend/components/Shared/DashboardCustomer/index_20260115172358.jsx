import { Card, DatePicker } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DashboardCustomer = () => {
  // ===== DATA CUNG =====
  const summary = [
    { label: "Giao dich thanh cong", value: "20.000 VND" },
    { label: "Giao dich loi", value: "0 VND" },
    { label: "Giao dich dang thuc hien", value: "0 VND" },
    { label: "Tong", value: "20.000 VND" },
  ];

  const chartData = [
    { date: "26/12", amount: 0 },
    { date: "27/12", amount: 0 },
    { date: "28/12", amount: 0 },
    { date: "29/12", amount: 0 },
    { date: "30/12", amount: 0 },
    { date: "31/12", amount: 0 },
    { date: "01/01", amount: 20000 },
  ];

  return (
    // ===== KHUNG NOI DUNG (KHONG FULL MAN HINH) =====
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
        <DatePicker placeholder="Tu ngay" />
        <DatePicker placeholder="Den ngay" />
      </div>

      {/* ===== TOTAL TRANSACTION ===== */}
      <Card
        title="Tong tien giao dich"
        extra={
          <span className="text-blue-600 font-semibold">Tong: 20.000 VND</span>
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
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ===== BOTTOM CHARTS ===== */}
      <div className="grid grid-cols-2 gap-6">
        <Card
          title="Giao dich thanh cong"
          extra={
            <span className="text-blue-600 font-semibold">
              Tong: 20.000 VND
            </span>
          }
        >
          <div className="h-[240px]">
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
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Giao dich dang thuc hien"
          extra={
            <span className="text-blue-600 font-semibold">Tong: 0 VND</span>
          }
        >
          <div className="h-[240px] flex items-center justify-center text-gray-400">
            Khong co du lieu
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardCustomer;
