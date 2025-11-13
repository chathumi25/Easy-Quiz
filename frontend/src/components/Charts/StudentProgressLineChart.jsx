import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const StudentProgressLineChart = ({ data, grade }) => {
  return (
    <div style={{ width: "100%", height: 350 }}>
      <h3 className="text-xl font-semibold text-indigo-700 mb-3 text-center">
        {grade} Performance by Subject
      </h3>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
          {/* Changed dataKey from 'week' to 'subject' */}
          <XAxis dataKey="subject" stroke="#4f46e5" />
          <YAxis stroke="#4f46e5" domain={[0, 100]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 5, fill: "#818cf8" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudentProgressLineChart;
