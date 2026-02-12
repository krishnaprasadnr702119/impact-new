import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BarChartView = ({ data, title, xKey, yKey }) => {
  return (
    <div className="section">
      <h3>{title}</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar 
              dataKey={yKey} 
              fill="#2c7be5" 
              barSize={40} 
              radius={[6, 6, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartView;
