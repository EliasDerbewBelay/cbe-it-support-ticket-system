'use client';

import React from 'react';
import { ApexChart } from './chart';
import { ApexOptions } from 'apexcharts';
import { CategoryDistribution } from '@/types/admin';

interface CategoryBarChartProps {
  categories?: CategoryDistribution[];
  height?: number;
}

export function CategoryBarChart({ categories = [], height = 280 }: CategoryBarChartProps) {
  const safeList = Array.isArray(categories) ? categories : [];
  const sorted = [...safeList].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 8);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
        <p className="font-medium text-zinc-500">No category incident data</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">Category distribution will display here once logged.</p>
      </div>
    );
  }

  const categoriesNames = sorted.map((c) => c.categoryName || 'Unknown');
  const counts = sorted.map((c) => c.count || 0);

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
        horizontal: true,
        barHeight: '55%',
        distributed: false,
      },
    },
    colors: ['#6f1a7e'],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}`,
      style: {
        fontSize: '11px',
        fontWeight: 600,
        colors: ['#ffffff'],
      },
      offsetX: -6,
    },
    xaxis: {
      categories: categoriesNames,
      labels: {
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
          fontWeight: 500,
          colors: '#27272a',
        },
      },
    },
    grid: {
      borderColor: 'rgba(161, 161, 170, 0.15)',
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val: number) => `${val} incidents reported`,
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
