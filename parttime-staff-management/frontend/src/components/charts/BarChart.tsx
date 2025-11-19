/* file: frontend/src/components/charts/BarChart.tsx */
import React from "react";
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  title?: string;
  color?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  yKey,
  title,
  color = "#0d6efd",
}) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        {title && <h5 className="card-title mb-4 text-muted">{title}</h5>}
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <RechartsBar data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={xKey} axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
            </RechartsBar>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
