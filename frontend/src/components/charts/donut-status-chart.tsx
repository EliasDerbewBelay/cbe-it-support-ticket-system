'use client';

import React from 'react';
import { ApexChart } from './chart';
import { ApexOptions } from 'apexcharts';

interface DonutStatusChartProps {
  data?: {
    open?: number;
    assigned?: number;
    inProgress?: number;
    resolved?: number;
    closed?: number;
    cancelled?: number;
  };
  height?: number;
}

export function DonutStatusChart({ data, height = 280 }: DonutStatusChartProps) {
  const open = Math.max(Number(data?.open) || 0, 0);
  const assigned = Math.max(Number(data?.assigned) || 0, 0);
  const inProgress = Math.max(Number(data?.inProgress) || 0, 0);
  const resolved = Math.max(Number(data?.resolved) || 0, 0);
  const closed = Math.max(Number(data?.closed) || 0, 0);
  const cancelled = Math.max(Number(data?.cancelled) || 0, 0);

  const series = [open, assigned, inProgress, resolved, closed, cancelled];
  const total = series.reduce((acc, curr) => acc + curr, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
        <p className="font-medium text-zinc-500">No ticket records to display</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">Status breakdown will appear when incidents are logged.</p>
      </div>
    );
  }

  const labels = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Cancelled'];
  const colors = ['#3b82f6', '#0ea5e9', '#f59e0b', '#10b981', '#71717a', '#f43f5e'];

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'inherit',
    },
    colors,
    labels,
    legend: {
      position: 'bottom',
      fontSize: '11px',
      fontFamily: 'inherit',
      markers: {
        size: 4,
      },
      itemMargin: {
        horizontal: 8,
        vertical: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 2,
      colors: ['transparent'],
    },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Incidents',
              fontSize: '11px',
              fontWeight: 500,
              color: '#71717a',
              formatter: () => `${total}`,
            },
            value: {
              fontSize: '22px',
              fontWeight: 700,
              color: '#18181b',
              offsetY: 2,
            },
          },
        },
      },
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val: number) =>
          `${val} ${val === 1 ? 'ticket' : 'tickets'} (${Math.round((val / total) * 100)}%)`,
      },
    },
  };

  return (
    <div className="w-full">
      <ApexChart options={options} series={series} type="donut" height={height} />
    </div>
  );
}
