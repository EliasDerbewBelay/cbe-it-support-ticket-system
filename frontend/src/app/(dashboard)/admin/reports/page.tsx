'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api/admin';
import {
  CategoryDistribution,
  DepartmentDistribution,
  PerformanceMetrics,
  SystemReportSummary,
  TechnicianWorkload,
} from '@/types/admin';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DonutStatusChart } from '@/components/charts/donut-status-chart';
import { RadialProgressChart } from '@/components/charts/radial-progress-chart';
import { CategoryBarChart } from '@/components/charts/category-bar-chart';
import { DepartmentColumnChart } from '@/components/charts/department-column-chart';
import { TechnicianWorkloadChart } from '@/components/charts/technician-workload-chart';
import { ApexProgressBar } from '@/components/charts/apex-progress-bar';
import { toast } from 'sonner';
import {
  BarChart3,
  TrendingUp,
  AlertOctagon,
  Clock,
  CheckCircle,
  RefreshCw,
  Loader2,
  Users,
  FolderTree,
  Building2,
  PieChart as PieIcon,
  ShieldCheck,
} from 'lucide-react';

export default function ReportsDashboardPage() {
  const [summary, setSummary] = useState<SystemReportSummary | null>(null);
  const [categories, setCategories] = useState<CategoryDistribution[]>([]);
  const [departments, setDepartments] = useState<DepartmentDistribution[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianWorkload[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAllReports = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [sum, cats, depts, techs, perf] = await Promise.all([
        adminApi.getReportSummary(),
        adminApi.getReportByCategory(),
        adminApi.getReportByDepartment(),
        adminApi.getReportByTechnician(),
        adminApi.getPerformanceMetrics(),
      ]);

      setSummary(sum);
      setCategories(Array.isArray(cats) ? cats : []);
      setDepartments(Array.isArray(depts) ? depts : []);
      setTechnicians(Array.isArray(techs) ? techs : []);
      setPerformance(perf);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load report analytics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllReports();
  }, [loadAllReports]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <Loader2 className="size-6 animate-spin text-[#6f1a7e]" />
        <span className="text-xs text-zinc-500 mt-2 font-medium">
          Compiling institutional reporting analytics...
        </span>
      </div>
    );
  }

  const donutData = {
    open: summary?.openTickets ?? 0,
    assigned: summary?.assignedTickets ?? 0,
    inProgress: summary?.inProgressTickets ?? 0,
    resolved: summary?.resolvedTickets ?? 0,
    closed: summary?.closedTickets ?? 0,
    cancelled: summary?.cancelledTickets ?? 0,
  };

  const resolutionRate = summary?.resolutionRatePercent ?? 0;
  const slaComplianceRate = performance?.withinSlaPercent ?? 85;

  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeDepartments = Array.isArray(departments) ? departments : [];
  const safeTechnicians = Array.isArray(technicians) ? technicians : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Analytics & SLA Performance"
        description="Interactive visual analytics powered by ApexCharts across Information Systems infrastructure and CBE branches."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadAllReports(true)}
          disabled={isRefreshing}
          className="text-xs"
        >
          <RefreshCw className={`size-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Charts
        </Button>
      </PageHeader>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Total Logged
            </span>
            <BarChart3 className="size-4 text-[#6f1a7e]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {summary?.totalTickets ?? 0}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Across all CBE branches</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 shadow-2xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Active In-Progress
            </span>
            <Clock className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800 dark:text-amber-300">
              {summary?.inProgressTickets ?? 0}
            </div>
            <p className="text-[11px] text-amber-700/70 dark:text-amber-400/80 mt-1">
              Under active troubleshooting
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/20 shadow-2xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider">
              Critical Urgency
            </span>
            <AlertOctagon className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800 dark:text-red-300">
              {summary?.criticalPending ?? 0}
            </div>
            <p className="text-[11px] text-red-700/70 dark:text-red-400/80 mt-1">
              High-priority branch impact
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-2xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Resolution Rate
            </span>
            <TrendingUp className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
              {resolutionRate}%
            </div>
            <p className="text-[11px] text-emerald-700/70 dark:text-emerald-400/80 mt-1">
              {summary?.resolvedTickets ?? 0} tickets resolved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 1: ApexCharts Status Donut & Radial Progress Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket Lifecycle Status Donut Chart */}
        <Card className="lg:col-span-7 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <PieIcon className="size-4 text-[#6f1a7e]" />
                  Ticket Lifecycle Status Distribution
                </CardTitle>
                <CardDescription className="text-xs">
                  Proportional distribution of tickets across all lifecycle stages.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <DonutStatusChart data={donutData} height={290} />
          </CardContent>
        </Card>

        {/* ApexCharts Radial Gauges & SLA Progress */}
        <Card className="lg:col-span-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600" />
              SLA & Resolution Progress
            </CardTitle>
            <CardDescription className="text-xs">
              Key performance indicators benchmarked against bank service levels.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <RadialProgressChart
                value={resolutionRate}
                label="Resolution"
                color="#10b981"
                height={180}
                sublabel={`${summary?.resolvedTickets ?? 0} of ${summary?.totalTickets ?? 0} solved`}
              />
              <RadialProgressChart
                value={slaComplianceRate}
                label="SLA Compliance"
                color="#6f1a7e"
                height={180}
                sublabel={
                  performance
                    ? `Avg ${performance.avgResolutionHours} hrs`
                    : 'Target < 24h SLA'
                }
              />
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
              <ApexProgressBar
                value={resolutionRate}
                label="Overall Resolution Progress"
                color="#10b981"
                height={32}
              />
              <ApexProgressBar
                value={slaComplianceRate}
                label="Response SLA On-Time Rate"
                color="#6f1a7e"
                height={32}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Category Breakdown & Department Incident Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Horizontal Bar Chart */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FolderTree className="size-4 text-[#6f1a7e]" />
                Incident Distribution by Category
              </CardTitle>
              <CardDescription className="text-xs">
                Malfunction density categorized across bank infrastructure.
              </CardDescription>
            </div>
            <span className="text-xs text-zinc-400 font-mono">{safeCategories.length} Categories</span>
          </CardHeader>
          <CardContent className="pt-2">
            <CategoryBarChart categories={safeCategories} height={280} />
          </CardContent>
        </Card>

        {/* Department Volume Column Bar Chart */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="size-4 text-[#edb72b]" />
                Incident Volume by Requesting Department
              </CardTitle>
              <CardDescription className="text-xs">
                Incident generation frequency per branch and head office directorate.
              </CardDescription>
            </div>
            <span className="text-xs text-zinc-400 font-mono">{safeDepartments.length} Units</span>
          </CardHeader>
          <CardContent className="pt-2">
            <DepartmentColumnChart departments={safeDepartments} height={280} />
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Technician Workload Grouped Bar Chart & Performance Matrix */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="size-4 text-[#6f1a7e]" />
              IS Technician Workload & Performance Comparison
            </CardTitle>
            <CardDescription className="text-xs">
              Comparative analysis of assignments, active troubleshooting, and verified resolutions.
            </CardDescription>
          </div>
          {performance && (
            <span className="text-xs text-zinc-500">
              Avg Resolution Time:{' '}
              <strong className="text-zinc-800 dark:text-zinc-200 font-mono">
                {performance.avgResolutionHours} hrs
              </strong>
            </span>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <TechnicianWorkloadChart technicians={safeTechnicians} height={280} />

          {safeTechnicians.length > 0 && (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-zinc-50/70 dark:bg-zinc-900/60">
                  <TableRow className="border-b border-zinc-200 dark:border-zinc-800">
                    <TableHead className="text-xs font-semibold">Support Engineer</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Total Assigned</TableHead>
                    <TableHead className="text-xs font-semibold text-center">In Progress</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Resolved</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Completion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeTechnicians.map((t) => {
                    const rate =
                      t.assignedCount > 0
                        ? Math.round((t.resolvedCount / t.assignedCount) * 100)
                        : 0;

                    return (
                      <TableRow
                        key={t.technicianId}
                        className="border-b border-zinc-100 dark:border-zinc-800/60"
                      >
                        <TableCell className="font-medium text-xs text-zinc-900 dark:text-zinc-100">
                          {t.technicianName}
                        </TableCell>
                        <TableCell className="text-center text-xs font-mono">
                          {t.assignedCount}
                        </TableCell>
                        <TableCell className="text-center text-xs font-mono text-amber-600 font-semibold">
                          {t.inProgressCount}
                        </TableCell>
                        <TableCell className="text-center text-xs font-mono text-emerald-600 font-semibold">
                          {t.resolvedCount}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          <span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            <CheckCircle className="size-3" />
                            {rate}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
