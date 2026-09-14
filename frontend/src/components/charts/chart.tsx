'use client';

import React, { Component, ErrorInfo, ReactNode, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Props as ApexChartProps } from 'react-apexcharts';

class ChartErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Chart error intercepted gracefully:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center w-full h-[200px] bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
            Chart visualization unavailable.
          </div>
        )
      );
    }
    return this.props.children;
  }
}

// Dynamically import react-apexcharts to prevent SSR hydration and "window is not defined" errors
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-[220px] bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 animate-pulse">
      <span className="text-xs text-zinc-400 font-medium">Loading visualization...</span>
    </div>
  ),
});

export function ApexChart(props: ApexChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center w-full h-[220px] bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 animate-pulse">
        <span className="text-xs text-zinc-400 font-medium">Initializing visualization...</span>
      </div>
    );
  }

  // Safety checks on series
  if (!props.series || !Array.isArray(props.series) || props.series.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-[200px] bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
        No series data available.
      </div>
    );
  }

  return (
    <ChartErrorBoundary>
      <ReactApexChart {...props} />
    </ChartErrorBoundary>
  );
}
