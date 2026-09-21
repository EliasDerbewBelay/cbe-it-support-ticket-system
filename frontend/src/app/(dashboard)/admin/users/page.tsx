'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { adminApi } from '@/lib/api/admin';
import { DepartmentItem, UserItem } from '@/types/admin';
import { UserRole } from '@/types/auth';
import { PageHeader } from '@/components/shared/page-header';
import { RoleBadge } from '@/components/shared/role-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Pencil,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { EditUserModal } from '@/components/admin/edit-user-modal';

export default function UsersAdminPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTab, setEditTab] = useState<'profile' | 'security'>('profile');

  const handleOpenEdit = (user: UserItem, tab: 'profile' | 'security' = 'profile') => {
    setEditingUser(user);
    setEditTab(tab);
    setIsEditOpen(true);
  };

  // Create User Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password] = useState('Password@123');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [departmentId, setDepartmentId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const departmentItemsMap = useMemo(() => {
    return Object.fromEntries(departments.map((d) => [d.id, d.name]));
  }, [departments]);

  const roleLabels: Record<string, string> = {
    ALL: 'All Roles',
    EMPLOYEE: 'Employee',
    TECHNICIAN: 'IS Technician',
    ADMINISTRATOR: 'IS Administrator',
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [userData, deptData] = await Promise.all([
        adminApi.getUsers({
          search: search.trim() || undefined,
          role: roleFilter === 'ALL' ? undefined : roleFilter,
          limit: 100,
        }),
        adminApi.getDepartments(true),
      ]);
      const safeDepts = Array.isArray(deptData) ? deptData : [];
      setUsers(Array.isArray(userData?.users) ? userData.users : []);
      setDepartments(safeDepts);
      if (safeDepts.length > 0 && !departmentId) {
        setDepartmentId(safeDepts[0].id);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load user accounts');
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, departmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleActive = async (user: UserItem) => {
    try {
      const isCurrentlyActive = user.isActive !== undefined ? user.isActive : (user as any).is_active !== false;
      const updated = await adminApi.updateUser(user.id, {
        isActive: !isCurrentlyActive,
      });
      const uFirst = updated.firstName || (updated as any).first_name || '';
      const uLast = updated.lastName || (updated as any).last_name || '';
      const updatedActive = updated.isActive !== undefined ? updated.isActive : (updated as any).is_active !== false;
      toast.success(
        `User account ${uFirst} ${uLast}`.trim() + ` ${updatedActive ? 'activated' : 'deactivated'}.`
      );
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update user status');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !departmentId) {
      toast.error('Please complete all required fields.');
      return;
    }

    setIsCreating(true);
    try {
      await adminApi.createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role,
        departmentId,
        employeeId: employeeId.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
      });

      toast.success(`User ${firstName} ${lastName} successfully registered.`);
      setIsCreateOpen(false);
      // Reset
      setFirstName('');
      setLastName('');
      setEmail('');
      setEmployeeId('');
      setPhoneNumber('');
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create user account');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Accounts Administration"
        description="Manage CBE employee accounts, IT support technicians, and system administrators."
      >
        <Button
          onClick={() => setIsCreateOpen(true)}
          size="sm"
          className="bg-[#6f1a7e] hover:bg-[#561361] text-white text-xs"
        >
          <UserPlus className="size-3.5 mr-1.5" />
          Add User Account
        </Button>
      </PageHeader>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 size-4 text-zinc-400" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9 h-9 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-[140px]">
            <Select
              value={roleFilter}
              onValueChange={(val) => setRoleFilter(val || 'ALL')}
              items={roleLabels}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Role">
                  {(val) => (val && roleLabels[val]) ? roleLabels[val] : 'Role'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="EMPLOYEE">Employees</SelectItem>
                <SelectItem value="TECHNICIAN">Technicians</SelectItem>
                <SelectItem value="ADMINISTRATOR">Administrators</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16">
          <Loader2 className="size-6 animate-spin text-[#6f1a7e]" />
          <span className="text-xs text-zinc-500 mt-2 font-medium">Loading user accounts...</span>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-50/70 dark:bg-zinc-900/60">
              <TableRow className="border-b border-zinc-200 dark:border-zinc-800">
                <TableHead className="text-xs font-semibold">User Details</TableHead>
                <TableHead className="w-[140px] text-xs font-semibold">Role</TableHead>
                <TableHead className="text-xs font-semibold">Department</TableHead>
                <TableHead className="w-[120px] text-xs font-semibold">Staff ID</TableHead>
                <TableHead className="w-[100px] text-xs font-semibold text-center">Status</TableHead>
                <TableHead className="w-[200px] text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const uFirst = u.firstName || (u as any).first_name || '';
                const uLast = u.lastName || (u as any).last_name || '';
                const uDisplayName = `${uFirst} ${uLast}`.trim() || u.email;
                const uActive = u.isActive !== undefined ? u.isActive : (u as any).is_active !== false;
                const uDept = u.department?.name || 'Unassigned';
                const uEmpId = u.employeeId || (u as any).employee_id || '—';

                return (
                  <TableRow
                    key={u.id}
                    className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                          {uDisplayName}
                        </span>
                        <span className="text-[11px] text-zinc-400">{u.email}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <RoleBadge role={u.role} />
                    </TableCell>

                    <TableCell className="text-xs text-zinc-600 dark:text-zinc-300">
                      {uDept}
                    </TableCell>

                    <TableCell className="text-xs font-mono text-zinc-500">
                      {uEmpId}
                    </TableCell>

                    <TableCell className="text-center">
                      {uActive ? (
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
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleOpenEdit(u, 'profile')}
                          className="h-7 px-2 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          title="Edit profile & email"
                        >
                          <Pencil className="size-3 mr-1 text-zinc-500" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleOpenEdit(u, 'security')}
                          className="h-7 px-2 text-[11px] font-medium text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                          title="Manage user password"
                        >
                          <KeyRound className="size-3 mr-1 text-[#6f1a7e] dark:text-[#c477d2]" />
                          Password
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleToggleActive(u)}
                          disabled={currentUser?.id === u.id}
                          title={
                            currentUser?.id === u.id
                              ? 'Administrators cannot deactivate their own account'
                              : undefined
                          }
                          className={
                            currentUser?.id === u.id
                              ? 'h-7 px-2 text-zinc-400 cursor-not-allowed text-[11px]'
                              : uActive
                              ? 'h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-[11px]'
                              : 'h-7 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-[11px]'
                          }
                        >
                          {uActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-[#6f1a7e]/10 text-[#6f1a7e] flex items-center justify-center">
                <Users className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">Create Staff Account</DialogTitle>
                <DialogDescription className="text-xs">
                  Register a new branch employee or IS support personnel.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">First Name *</Label>
                <Input
                  className="text-xs h-8.5"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Abebe"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Last Name *</Label>
                <Input
                  className="text-xs h-8.5"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Kebede"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Institutional Email *</Label>
              <Input
                type="email"
                className="text-xs h-8.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@cbe.com.et"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Role *</Label>
                <Select
                  value={role}
                  onValueChange={(v) => { if (v) setRole(v as UserRole); }}
                  items={roleLabels}
                >
                  <SelectTrigger className="text-xs h-8.5">
                    <SelectValue placeholder="Select Role">
                      {(v) => (v && roleLabels[v]) ? roleLabels[v] : 'Select Role'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="TECHNICIAN">IS Technician</SelectItem>
                    <SelectItem value="ADMINISTRATOR">IS Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Department *</Label>
                <Select
                  value={departmentId}
                  onValueChange={(val) => setDepartmentId(val || '')}
                  items={departmentItemsMap}
                >
                  <SelectTrigger className="text-xs h-8.5">
                    <SelectValue placeholder="Department">
                      {(val) => {
                        if (!val) return 'Department';
                        return departmentItemsMap[val] ?? 'Department';
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id} className="text-xs">
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Staff / Employee ID</Label>
                <Input
                  className="text-xs h-8.5"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="CBE-EMP-004"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Phone Number</Label>
                <Input
                  className="text-xs h-8.5"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+251-9..."
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCreating}
                className="bg-[#6f1a7e] hover:bg-[#561361] text-white"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        departments={departments}
        currentUserId={currentUser?.id}
        initialTab={editTab}
        onUserUpdated={loadData}
      />
    </div>
  );
}
