import { Card, DatePicker } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { http } from "../../../modules/modules";
import dayjs from "dayjs";

const COLORS = ["#1677ff", "#ff4d4f"];

const Dashboard = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [accountChart, setAccountChart] = useState([]);
  const [transactionChart, setTransactionChart] = useState([]);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const httpReq = http();
      const res = await httpReq.get("/api/dashboard/admin", {
        params: {
          fromDate,
          toDate,
        },
      });

      setAccountChart(res.data.accountChart || []);
      setTransactionChart(res.data.transactionChart || []);
      setPieData(res.data.pieData || []);
    };

    fetchData();
  }, [fromDate, toDate]);

  return (
    <div className="max-w-[1200px] mx-auto space-y-10">
      {/* FILTER */}
      <div className="flex justify-end gap-3">
        <DatePicker value={fromDate} onChange={setFromDate} />
        <DatePicker value={toDate} onChange={setToDate} />
      </div>

      {/* BAR CHART 1 */}
      <Card title="So tai khoan tao moi theo ngay">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={accountChart}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#1677ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* BAR CHART 2 */}
      <Card title="So giao dich theo ngay">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transactionChart}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#52c41a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* PIE CHART */}
      <Card title="Tong so tien giao dich">
        <div className="h-[300px] flex justify-center">
          <ResponsiveContainer width="60%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={100}
                label
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
