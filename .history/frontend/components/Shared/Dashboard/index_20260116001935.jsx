import { Card } from "antd";
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

/* ================= TOOLTIP DÙNG CHUNG ================= */
const CustomTooltip = ({
  active,
  payload,
  label,
  labelPrefix,
  valuePrefix,
  suffix,
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          padding: "10px 14px",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          minWidth: 160,
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>
          {labelPrefix}: {label}
        </p>
        <p style={{ margin: 0, color: "#1677ff" }}>
          {valuePrefix}: {payload[0].value.toLocaleString()} {suffix}
        </p>
      </div>
    );
  }
  return null;
};

/* ================= MOCK DATA ================= */
const accountChart = [
  { date: "04-01", value: 2 },
  { date: "05-01", value: 1 },
  { date: "06-01", value: 1 },
  { date: "31-12", value: 2 },
];

const transactionChart = [{ date: "15-01", value: 3 }];

const pieData = [{ name: "Tổng tiền giao dịch", value: 338355 }];

/* ================= DASHBOARD ================= */
const Dashboard = () => {
  return (
    <>
      {/* ===== BIỂU ĐỒ TRÊN ===== */}
      <Card title="Số tài khoản tạo mới theo ngày" style={{ marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={accountChart} margin={{ left: 30, bottom: 30 }}>
            <XAxis
              dataKey="date"
              label={{ value: "Ngày", position: "bottom", offset: 15 }}
            />
            <YAxis
              label={{
                value: "Số tài khoản",
                angle: -90,
                position: "left",
              }}
            />
            <Tooltip
              content={
                <CustomTooltip
                  labelPrefix="Ngày"
                  valuePrefix="Số tài khoản"
                  suffix="tài khoản"
                />
              }
            />
            <Bar dataKey="value" fill="#52c41a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ===== HÀNG DƯỚI ===== */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* PIE CHART */}
        <Card title="Tổng tiền giao dịch">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ value }) => `${value.toLocaleString()} VND`}
              >
                <Cell fill="#fa8c16" />
              </Pie>
              <Tooltip
                formatter={(value) => [
                  `${value.toLocaleString()} VND`,
                  "Tổng tiền giao dịch",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* BAR CHART */}
        <Card title="Số giao dịch theo ngày">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={transactionChart} margin={{ left: 30, bottom: 30 }}>
              <XAxis
                dataKey="date"
                label={{ value: "Ngày", position: "bottom", offset: 15 }}
              />
              <YAxis
                label={{
                  value: "Số giao dịch",
                  angle: -90,
                  position: "left",
                }}
              />
              <Tooltip
                content={
                  <CustomTooltip
                    labelPrefix="Ngày"
                    valuePrefix="Số giao dịch"
                    suffix="giao dịch"
                  />
                }
              />
              <Bar dataKey="value" fill="#1677ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
