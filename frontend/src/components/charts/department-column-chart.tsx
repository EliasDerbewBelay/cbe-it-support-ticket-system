'use client';

import React from 'react';
import { ApexChart } from './chart';
import { ApexOptions } from 'apexcharts';
import { DepartmentDistribution } from '@/types/admin';

interface DepartmentColumnChartProps {
  departments?: DepartmentDistribution[];
  height?: number;
}

export function DepartmentColumnChart({
  departments = [],
  height = 280,
}: DepartmentColumnChartProps) {
  const safeList = Array.isArray(departments) ? departments : [];
  const sorted = [...safeList].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 6);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
        <p className="font-medium text-zinc-500">No departmental incident data</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">Departmental breakdowns will appear as incidents are reported.</p>
      </div>
    );
  }

  const names = sorted.map((d) => d.departmentName || 'Unknown');
  const counts = sorted.map((d) => d.count || 0);

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      fontFamily: 'inherit',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '45%',
        distributed: false,
        dataLabels: {
          position: 'top',
        },
      },
    },
    colors: ['#edb72b'],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}`,
      offsetY: -20,
      style: {
        fontSize: '11px',
        fontWeight: 600,
        colors: ['#71717a'],
      },
    },
    xaxis: {
      categories: names,
      labels: {
        rotate: -25,
        rotateAlways: false,
        trim: true,
        maxHeight: 60,
        style: {
          fontSize: '11px',
          colors: '#71717a',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
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
    grid: {
      borderColor: 'rgba(161, 161, 170, 0.15)',
      strokeDashArray: 3,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val: number) => `${val} incidents recorded`,
      },
    },
  };

  return (
    <div className="w-full">
      <ApexChart
        options={options}
        series={[{ name: 'Incidents', data: counts }]}
        type="bar"
        height={height}
      />
    </div>
  );
}
