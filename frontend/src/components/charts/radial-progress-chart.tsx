'use client';

import React from 'react';
import { ApexChart } from './chart';
import { ApexOptions } from 'apexcharts';

interface RadialProgressChartProps {
  value?: number; // percentage (0 - 100)
  label?: string;
  color?: string;
  height?: number;
  sublabel?: string;
}

export function RadialProgressChart({
  value = 0,
  label = 'Progress',
  color = '#6f1a7e',
  height = 200,
  sublabel,
}: RadialProgressChartProps) {
  const safeValue =
    typeof value === 'number' && !isNaN(value)
      ? Math.min(Math.max(Math.round(value), 0), 100)
      : 0;

  const options: ApexOptions = {
    chart: {
      type: 'radialBar',
      sparkline: {
        enabled: true,
      },
      fontFamily: 'inherit',
    },
    colors: [color],
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          margin: 0,
          size: '68%',
          background: 'transparent',
        },
        track: {
          background: 'rgba(161, 161, 170, 0.15)',
          strokeWidth: '100%',
          margin: 0,
        },
        dataLabels: {
          show: true,
          name: {
            offsetY: -8,
            show: true,
            color: '#71717a',
            fontSize: '11px',
            fontWeight: 500,
          },
          value: {
            offsetY: 4,
            color: '#18181b',
            fontSize: '20px',
            fontWeight: 700,
            show: true,
            formatter: () => `${safeValue}%`,
          },
        },
      },
    },
    stroke: {
      lineCap: 'round',
    },
    labels: [label],
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <ApexChart
        options={options}
        series={[safeValue]}
        type="radialBar"
        height={height}
      />
      {sublabel && (
        <span className="text-[11px] text-zinc-500 text-center mt-[-8px]">
          {sublabel}
        </span>
      )}
    </div>
  );
}
