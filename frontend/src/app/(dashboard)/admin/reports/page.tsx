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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
      setCategories(cats);
      setDepartments(depts);
      setTechnicians(techs);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Analytics & SLA Performance"
        description="Comprehensive operational metrics across Information Systems infrastructure and branch incidents."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadAllReports(true)}
          disabled={isRefreshing}
          className="text-xs"
        >
          <RefreshCw className={`size-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
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
              Under active investigation
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
              {summary?.resolutionRatePercent ?? 0}%
            </div>
            <p className="text-[11px] text-emerald-700/70 dark:text-emerald-400/80 mt-1">
              {summary?.resolvedTickets ?? 0} tickets successfully resolved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Columns: Category Breakdown & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Distribution by Category */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FolderTree className="size-4 text-[#6f1a7e]" />
              Distribution by Incident Category
            </CardTitle>
            <span className="text-xs text-zinc-400">{categories.length} Categories</span>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No category data recorded yet.</p>
            ) : (
              categories.map((cat) => (
                <div key={cat.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {cat.categoryName}
                    </span>
                    <span className="text-zinc-500 font-mono">
                      {cat.count} ({cat.percentage}%)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#6f1a7e] dark:bg-purple-500 transition-all duration-500"
                      style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Volume by Requesting Department */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="size-4 text-[#6f1a7e]" />
              Incident Volume by Department
            </CardTitle>
            <span className="text-xs text-zinc-400">{departments.length} Departments</span>
          </CardHeader>
          <CardContent className="space-y-3">
            {departments.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No departmental incident data yet.</p>
            ) : (
              departments.map((dept) => (
                <div key={dept.departmentId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {dept.departmentName}
                    </span>
                    <span className="text-zinc-500 font-mono">
                      {dept.count} ({dept.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500 dark:bg-amber-400 transition-all duration-500"
                      style={{ width: `${Math.min(dept.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Technician Workload & Performance Table */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="size-4 text-[#6f1a7e]" />
            IS Technician Workload & Resolution Metrics
          </CardTitle>
          {performance && (
            <span className="text-xs text-zinc-500">
              Avg Resolution: <strong className="text-zinc-800 dark:text-zinc-200">{performance.avgResolutionHours} hrs</strong>
            </span>
          )}
        </CardHeader>
        <CardContent>
          {technicians.length === 0 ? (
            <p className="text-xs text-zinc-400 italic">No technician assignments on record.</p>
          ) : (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-zinc-50/70 dark:bg-zinc-900/60">
                  <TableRow className="border-b border-zinc-200 dark:border-zinc-800">
                    <TableHead className="text-xs font-semibold">Support Engineer</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Total Assigned</TableHead>
                    <TableHead className="text-xs font-semibold text-center">In Progress</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Resolved</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {technicians.map((t) => {
                    const resolvedRate =
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
                            {resolvedRate}%
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
