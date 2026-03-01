import React from "react";
import { Card, DatePicker } from "antd";

const DashboardCustomer = () => {
  const summary = [
    { label: "Giao dich thanh cong", value: "20.000 VND" },
    { label: "Giao dich that bai", value: "0 VND" },
    { label: "Dang thuc hien", value: "0 VND" },
    { label: "Tong", value: "20.000 VND" },
  ];

  return (
    // ===== KHUNG NOI DUNG (NAM TRONG Content cua layout) =====
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* ===== SUMMARY BAR ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          background: "#1677ff",
          borderRadius: 8,
          color: "#fff",
          marginBottom: 24,
        }}
      >
        {summary.map((item, index) => (
          <div
            key={index}
            style={{
              padding: "20px 0",
              textAlign: "center",
              borderRight:
                index !== summary.length - 1
                  ? "1px solid rgba(255,255,255,0.3)"
                  : "none",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600 }}>{item.value}</div>
            <div style={{ opacity: 0.85 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* ===== FILTER ===== */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <DatePicker />
        <DatePicker />
      </div>

      {/* ===== CHART LON ===== */}
      <Card title="Tong tien giao dich" style={{ marginBottom: 24 }}>
        <div style={{ height: 300 }} />
      </Card>

      {/* ===== CHART DUOI ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <Card title="Giao dich thanh cong">
          <div style={{ height: 240 }} />
        </Card>

        <Card title="Giao dich dang thuc hien">
          <div style={{ height: 240 }} />
        </Card>
      </div>
    </div>
  );
};

export default DashboardCustomer;
