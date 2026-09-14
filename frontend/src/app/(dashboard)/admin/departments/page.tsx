'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api/admin';
import { DepartmentItem } from '@/types/admin';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Building2, Plus, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create modal state
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getDepartments(true);
      setDepartments(data);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleToggleStatus = async (dept: DepartmentItem) => {
    try {
      await adminApi.updateDepartment(dept.id, { isActive: !dept.isActive });
      toast.success(`Department ${dept.name} ${!dept.isActive ? 'activated' : 'deactivated'}.`);
      loadDepartments();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update department status');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await adminApi.createDepartment({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success(`Department "${name}" created successfully.`);
      setIsOpen(false);
      setName('');
      setDescription('');
      loadDepartments();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create department');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizational Departments"
        description="Configure bank directorates, branches, and operational departments across CBE."
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          className="bg-[#6f1a7e] hover:bg-[#561361] text-white text-xs"
        >
          <Plus className="size-3.5 mr-1.5" />
          Add Department
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16">
          <Loader2 className="size-6 animate-spin text-[#6f1a7e]" />
          <span className="text-xs text-zinc-500 mt-2 font-medium">Loading departments...</span>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-50/70 dark:bg-zinc-900/60">
              <TableRow className="border-b border-zinc-200 dark:border-zinc-800">
                <TableHead className="text-xs font-semibold w-[220px]">Department Name</TableHead>
                <TableHead className="text-xs font-semibold">Description</TableHead>
                <TableHead className="text-xs font-semibold w-[120px] text-center">Status</TableHead>
                <TableHead className="text-xs font-semibold w-[110px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow
                  key={dept.id}
                  className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40"
                >
                  <TableCell className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-3.5 text-zinc-400 shrink-0" />
                      <span>{dept.name}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-zinc-500 max-w-md truncate">
                    {dept.description || 'No description provided'}
                  </TableCell>

                  <TableCell className="text-center">
                    {dept.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                        <XCircle className="size-3" />
                        Inactive
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleToggleStatus(dept)}
                      className={
                        dept.isActive
                          ? 'text-rose-600 hover:text-rose-700 text-[11px]'
                          : 'text-emerald-600 hover:text-emerald-700 text-[11px]'
                      }
                    >
                      {dept.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Department Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-[#6f1a7e]/10 text-[#6f1a7e] flex items-center justify-center">
                <Building2 className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">New Department</DialogTitle>
                <DialogDescription className="text-xs">
                  Register a CBE branch, operational division, or support unit.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Department Name *</Label>
              <Input
                className="text-xs h-8.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Credit & Appraisal Directorate"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Description</Label>
              <Textarea
                className="text-xs min-h-[80px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief operational mandate or branch code..."
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !name.trim()}
                className="bg-[#6f1a7e] hover:bg-[#561361] text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Department'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
