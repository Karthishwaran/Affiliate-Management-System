import React from 'react';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { Card } from 'react-bootstrap';
import { CHART_COLORS } from '../../utils/constants';

const Chart = ({ type, data, options, title, height = 300 }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    ...options
  };
  
  const ChartComponent = {
    line: Line,
    bar: Bar,
    doughnut: Doughnut,
    pie: Pie
  }[type];
  
  if (!ChartComponent) return null;
  
  return (
    <Card className="shadow-sm h-100">
      {title && <Card.Header className="bg-white">{title}</Card.Header>}
      <Card.Body>
        <div style={{ height: `${height}px` }}>
          <ChartComponent data={data} options={defaultOptions} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default Chart;