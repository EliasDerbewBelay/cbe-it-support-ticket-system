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
  Eye,
  EyeOff,
  Sparkles,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { EditUserModal } from '@/components/admin/edit-user-modal';
import { ResetPasswordModal } from '@/components/admin/reset-password-modal';

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

  // Dedicated Reset Password Modal (for lost/forgotten passwords)
  const [resetUser, setResetUser] = useState<UserItem | null>(null);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleOpenResetPassword = (user: UserItem) => {
    setResetUser(user);
    setIsResetOpen(true);
  };

  // Create User Modal & Initial Password States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [initialPassword, setInitialPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [departmentId, setDepartmentId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Post-Creation Handover Dialog States
  const [createdCredentials, setCreatedCredentials] = useState<{
    user: UserItem;
    initialPassword: string;
  } | null>(null);
  const [hasCopiedCredentials, setHasCopiedCredentials] = useState(false);
  const [hasCopiedPasswordOnly, setHasCopiedPasswordOnly] = useState(false);

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
      const isCurrentlyActive =
        user.isActive !== undefined ? user.isActive : (user as any).is_active !== false;
      const updated = await adminApi.updateUser(user.id, {
        isActive: !isCurrentlyActive,
      });
      const uFirst = updated.firstName || (updated as any).first_name || '';
      const uLast = updated.lastName || (updated as any).last_name || '';
      const updatedActive =
        updated.isActive !== undefined ? updated.isActive : (updated as any).is_active !== false;
      toast.success(
        `User account ${uFirst} ${uLast}`.trim() +
          ` ${updatedActive ? 'activated' : 'deactivated'}.`
      );
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update user status');
    }
  };

  const handleGenerateInitialPassword = () => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*';
    const all = uppercase + lowercase + numbers + symbols;

    const getRandom = (chars: string) => {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return chars[arr[0] % chars.length];
    };

    const pwd = [
      getRandom(uppercase),
      getRandom(lowercase),
      getRandom(numbers),
      getRandom(symbols),
    ];

    for (let i = 4; i < 14; i++) {
      pwd.push(getRandom(all));
    }

    for (let i = pwd.length - 1; i > 0; i--) {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      const j = arr[0] % (i + 1);
      [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
    }

    const result = pwd.join('');
    setInitialPassword(result);
    setConfirmPassword(result);
    setShowPassword(true);
    setShowConfirmPassword(true);
    toast.info('Secure initial password generated.');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !departmentId) {
      toast.error('Please complete all required fields.');
      return;
    }

    const trimmedPassword = initialPassword.trim();
    if (!trimmedPassword) {
      toast.error('Please specify an initial password for the user.');
      return;
    }

    if (trimmedPassword.length < 8) {
      toast.error('Initial password must be at least 8 characters long.');
      return;
    }

    if (trimmedPassword !== confirmPassword.trim()) {
      toast.error('Initial password and confirmation password do not match.');
      return;
    }

    setIsCreating(true);
    try {
      const createdUser = await adminApi.createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: trimmedPassword,
        role,
        departmentId,
        employeeId: employeeId.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
      });

      toast.success(`User ${firstName} ${lastName} successfully registered.`);
      setIsCreateOpen(false);

      // Open credentials handover modal so admin can immediately copy details
      setCreatedCredentials({
        user: createdUser,
        initialPassword: trimmedPassword,
      });

      // Reset create form
      setFirstName('');
      setLastName('');
      setEmail('');
      setInitialPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setEmployeeId('');
      setPhoneNumber('');
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create user account');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyFullCredentials = async () => {
    if (!createdCredentials) return;
    const { user, initialPassword: pwd } = createdCredentials;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const uFirst = user.firstName || (user as any).first_name || '';
    const uLast = user.lastName || (user as any).last_name || '';
    const uName = `${uFirst} ${uLast}`.trim() || user.email;

    const summaryText = [
      '==================================================',
      'CBE IT Support Ticket System - Account Credentials',
      '==================================================',
      `Employee Name:       ${uName}`,
      `Institutional Email: ${user.email}`,
      `Staff ID:            ${user.employeeId || 'N/A'}`,
      `Role:                ${user.role}`,
      `Department:          ${user.department?.name || 'N/A'}`,
      `Initial Password:    ${pwd}`,
      `Login URL:           ${origin}/login`,
      '==================================================',
      'Please log in with these initial credentials and update your password.',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summaryText);
      setHasCopiedCredentials(true);
      toast.success('Account credentials copied to clipboard.');
      setTimeout(() => setHasCopiedCredentials(false), 3500);
    } catch {
      toast.error('Failed to copy to clipboard.');
    }
  };

  const handleCopyPasswordOnly = async () => {
    if (!createdCredentials) return;
    try {
      await navigator.clipboard.writeText(createdCredentials.initialPassword);
      setHasCopiedPasswordOnly(true);
      toast.success('Initial password copied to clipboard.');
      setTimeout(() => setHasCopiedPasswordOnly(false), 3000);
    } catch {
      toast.error('Failed to copy password.');
    }
  };

  const passwordLengthValid = initialPassword.trim().length >= 8;
  const passwordsMatch =
    initialPassword.length > 0 && initialPassword.trim() === confirmPassword.trim();

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Accounts Administration"
        description="Manage CBE employee accounts, IT support technicians, and system administrators."
      >
        <Button
          onClick={() => {
            setInitialPassword('');
            setConfirmPassword('');
            setShowPassword(false);
            setShowConfirmPassword(false);
            setIsCreateOpen(true);
          }}
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
            placeholder="Search by name, email, or staff ID..."
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
                  {(val) => (val && roleLabels[val] ? roleLabels[val] : 'Role')}
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
          <span className="text-xs text-zinc-500 mt-2 font-medium">
            Loading user accounts...
          </span>
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
                <TableHead className="w-[100px] text-xs font-semibold text-center">
                  Status
                </TableHead>
                <TableHead className="w-[230px] text-xs font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const uFirst = u.firstName || (u as any).first_name || '';
                const uLast = u.lastName || (u as any).last_name || '';
                const uDisplayName = `${uFirst} ${uLast}`.trim() || u.email;
                const uActive =
                  u.isActive !== undefined ? u.isActive : (u as any).is_active !== false;
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
                          title="Edit profile & institutional details"
                        >
                          <Pencil className="size-3 mr-1 text-zinc-500" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleOpenResetPassword(u)}
                          className="h-7 px-2 text-[11px] font-medium text-[#6f1a7e] dark:text-[#c477d2] border-purple-200 dark:border-purple-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                          title="Reset password for user who lost or forgot credentials"
                        >
                          <KeyRound className="size-3 mr-1 text-[#6f1a7e] dark:text-[#c477d2]" />
                          Reset Password
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
        <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-[#6f1a7e]/10 text-[#6f1a7e] flex items-center justify-center shrink-0">
                <Users className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">Create Staff Account</DialogTitle>
                <DialogDescription className="text-xs">
                  Register a new branch employee or IS support personnel with their initial password.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-3.5 pt-2">
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
                  onValueChange={(v) => {
                    if (v) setRole(v as UserRole);
                  }}
                  items={roleLabels}
                >
                  <SelectTrigger className="text-xs h-8.5">
                    <SelectValue placeholder="Select Role">
                      {(v) => (v && roleLabels[v] ? roleLabels[v] : 'Select Role')}
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

            {/* Initial Password Section */}
            <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <KeyRound className="size-3.5 text-[#6f1a7e] dark:text-[#c477d2]" />
                    Initial Password *
                  </Label>
                  <p className="text-[11px] text-zinc-500">
                    Set the user&apos;s starting credentials.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={handleGenerateInitialPassword}
                  className="h-7 text-[11px] text-[#6f1a7e] dark:text-[#c477d2] border-purple-200 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100 gap-1"
                >
                  <Sparkles className="size-3 text-[#6f1a7e] dark:text-[#c477d2]" />
                  Generate Strong Password
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      className="text-xs h-8.5 pr-8 font-mono"
                      value={initialPassword}
                      onChange={(e) => setInitialPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="text-xs h-8.5 pr-8 font-mono"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm initial password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Hints & Status */}
              <div className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`size-1.5 rounded-full ${
                      passwordLengthValid ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'
                    }`}
                  />
                  <span className={passwordLengthValid ? 'text-zinc-700 dark:text-zinc-300 font-medium' : 'text-zinc-400'}>
                    8+ chars
                  </span>
                </div>

                {confirmPassword && (
                  <div className="flex items-center gap-1">
                    {passwordsMatch ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="size-3" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-rose-500 font-medium flex items-center gap-1">
                        Passwords do not match
                      </span>
                    )}
                  </div>
                )}
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
                disabled={isCreating || !passwordLengthValid || !passwordsMatch}
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

      {/* Post-Creation Handover Dialog (Shows credentials to copy for the new user) */}
      <Dialog
        open={Boolean(createdCredentials)}
        onOpenChange={(open) => {
          if (!open) {
            setCreatedCredentials(null);
            setHasCopiedCredentials(false);
            setHasCopiedPasswordOnly(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  Account Created Successfully
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Initial credentials for the new employee account.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {createdCredentials && (
            <div className="space-y-4 pt-1">
              {/* Summary Card */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3.5 space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Staff Member:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {createdCredentials.user.firstName} {createdCredentials.user.lastName}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Login Username / Email:</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-100 select-all font-semibold">
                    {createdCredentials.user.email}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Department & Role:</span>
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {createdCredentials.user.department?.name || 'Assigned'} ({createdCredentials.user.role})
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-medium">Assigned Initial Password:</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      One-time display
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-zinc-950 border border-purple-200 dark:border-purple-800/80 font-mono text-xs">
                    <span className="text-zinc-900 dark:text-zinc-100 font-bold select-all tracking-wider">
                      {createdCredentials.initialPassword}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={handleCopyPasswordOnly}
                      className="shrink-0 h-6 px-2 text-[11px] text-[#6f1a7e] dark:text-[#c477d2] hover:bg-purple-100 dark:hover:bg-purple-900/40"
                    >
                      {hasCopiedPasswordOnly ? (
                        <>
                          <Check className="size-3 mr-1 text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Security Alert */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300">
                <ShieldAlert className="size-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  Please securely communicate this initial password to the employee. Plaintext credentials are not stored in the system.
                </span>
              </div>

              <DialogFooter className="gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyFullCredentials}
                  className="text-xs gap-1.5 flex-1"
                >
                  {hasCopiedCredentials ? (
                    <>
                      <Check className="size-3 text-emerald-600" />
                      Copied All
                    </>
                  ) : (
                    <>
                      <Copy className="size-3 text-zinc-500" />
                      Copy Login Details
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setCreatedCredentials(null);
                    setHasCopiedCredentials(false);
                    setHasCopiedPasswordOnly(false);
                  }}
                  className="bg-[#6f1a7e] hover:bg-[#561361] text-white text-xs flex-1"
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
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

      {/* Dedicated Lost / Forgotten Password Reset Modal */}
      <ResetPasswordModal
        isOpen={isResetOpen}
        onClose={() => {
          setIsResetOpen(false);
          setResetUser(null);
        }}
        user={resetUser}
        onPasswordReset={loadData}
      />
    </div>
  );
}
