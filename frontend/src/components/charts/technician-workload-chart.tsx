'use client';

import React from 'react';
import { ApexChart } from './chart';
import { ApexOptions } from 'apexcharts';
import { TechnicianWorkload } from '@/types/admin';

interface TechnicianWorkloadChartProps {
  technicians?: TechnicianWorkload[];
  height?: number;
}

export function TechnicianWorkloadChart({
  technicians = [],
  height = 290,
}: TechnicianWorkloadChartProps) {
  const safeList = Array.isArray(technicians) ? technicians : [];

  if (safeList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
        <p className="font-medium text-zinc-500">No technician workload records</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">Technician assignments will be analyzed here.</p>
      </div>
    );
  }

  const names = safeList.map((t) => t.technicianName || 'Technician');
  const assigned = safeList.map((t) => t.assignedCount || 0);
  const inProgress = safeList.map((t) => t.inProgressCount || 0);
  const resolved = safeList.map((t) => t.resolvedCount || 0);

  const series = [
    { name: 'Assigned', data: assigned },
    { name: 'In Progress', data: inProgress },
    { name: 'Resolved', data: resolved },
  ];

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      fontFamily: 'inherit',
      toolbar: {
        show: false,
      },
    },
    colors: ['#0ea5e9', '#f59e0b', '#10b981'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        borderRadius: 3,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: names,
      labels: {
        style: {
          fontSize: '11px',
          colors: '#71717a',
        },
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '11px',
          colors: '#71717a',
        },
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '11px',
      fontFamily: 'inherit',
      markers: {
        size: 4,
      },
    },
    grid: {
      borderColor: 'rgba(161, 161, 170, 0.15)',
      strokeDashArray: 3,
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val: number) => `${val} tickets`,
      },
    },
  };

  return (
    <div className="w-full">
      <ApexChart options={options} series={series} type="bar" height={height} />
    </div>
  );
}
