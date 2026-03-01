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

  const DashboardCustomer = () => {
    return (
      // ===== OUTER (nen xam, cach sidebar) =====
      <div className="bg-gray-100 min-h-screen p-6">
        {/* ===== INNER (khung trang chinh) ===== */}
        <div className="bg-white rounded-xl p-6 space-y-8 shadow-sm">
          {/* ===== TOP SUMMARY ===== */}
          <div className="grid grid-cols-4 bg-blue-700 text-white rounded-lg overflow-hidden">
            {summary.map((item, index) => (
              <div
                key={index}
                className="text-center py-6 border-r last:border-r-0 border-blue-500"
              >
                <h1 className="text-lg font-bold">{item.value}</h1>
                <p className="text-sm opacity-80">{item.label}</p>
              </div>
            ))}
          </div>

          {/* ===== FILTER ===== */}
          <div className="flex justify-end gap-3">
            <DatePicker placeholder="Tu ngay" />
            <DatePicker placeholder="Den ngay" />
          </div>

          {/* ===== CHART LON ===== */}
          <Card className="shadow-md">...</Card>

          {/* ===== 2 CHART DUOI ===== */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="shadow-md">...</Card>
            <Card className="shadow-md">...</Card>
          </div>
        </div>
      </div>
    );
  };
};

export default DashboardCustomer;
