import { Chart } from 'react-chartjs-2';
import React from 'react';

const ChartDonutWidget = ({
  data,
  style = { height: 150, width: '100%' },
  clazz,
}) => {
  const { type } = data; // chart type
  const config = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: data.legendPosition,
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          boxHeight: 10,
        },
      },
      tooltip: true,
    },
  };
  return (
    <div style={style} className={clazz}>
      <Chart type={type} options={config} data={data} />
    </div>
  );
};

export default ChartDonutWidget;
