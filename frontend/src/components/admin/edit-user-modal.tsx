'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminApi } from '@/lib/api/admin';
import { DepartmentItem, UserItem } from '@/types/admin';
import { UserRole } from '@/types/auth';
import { toast } from 'sonner';
import {
  User,
  Mail,
  KeyRound,
  ShieldAlert,
  Eye,
  EyeOff,
  Sparkles,
  Copy,
  Check,
  Loader2,
  Phone,
  BadgeCheck,
  AlertCircle,
  X,
} from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserItem | null;
  departments: DepartmentItem[];
  currentUserId?: string;
  initialTab?: 'profile' | 'security';
  onUserUpdated: () => void;
}

export function EditUserModal({
  isOpen,
  onClose,
  user,
  departments,
  currentUserId,
  initialTab = 'profile',
  onUserUpdated,
}: EditUserModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [departmentId, setDepartmentId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security / Password States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const isSelf = Boolean(user && currentUserId && user.id === currentUserId);

  const roleLabels: Record<string, string> = {
    EMPLOYEE: 'Employee (Branch / Unit)',
    TECHNICIAN: 'IS Support Technician',
    ADMINISTRATOR: 'IS Administrator',
  };

  const departmentItemsMap = useMemo(() => {
    return Object.fromEntries(departments.map((d) => [d.id, d.name]));
  }, [departments]);

  useEffect(() => {
    if (user && isOpen) {
      setFirstName(user.firstName || (user as any).first_name || '');
      setLastName(user.lastName || (user as any).last_name || '');
      setEmail(user.email || '');
      setRole(user.role || 'EMPLOYEE');
      setDepartmentId(
        user.departmentId ||
        (user as any).department_id ||
        user.department?.id ||
        (departments[0]?.id ?? '')
      );
      setEmployeeId(user.employeeId || (user as any).employee_id || '');
      setPhoneNumber(user.phoneNumber || (user as any).phone_number || '');
      setIsActive(
        user.isActive !== undefined
          ? user.isActive
          : (user as any).is_active !== undefined
          ? (user as any).is_active
          : true
      );

      // Reset password states
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setGeneratedPassword('');
      setHasCopied(false);
      setActiveTab(initialTab);
    }
  }, [user, isOpen, departments, initialTab]);

  const handleGenerateStrongPassword = () => {
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

    // Modern Fisher-Yates shuffle
    for (let i = pwd.length - 1; i > 0; i--) {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      const j = arr[0] % (i + 1);
      [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
    }

    const result = pwd.join('');
    setNewPassword(result);
    setConfirmPassword(result);
    setShowPassword(true);
    setShowConfirmPassword(true);
    setGeneratedPassword(result);
    setHasCopied(false);
    toast.info('Secure temporary password generated.');
  };

  const handleCopyPassword = async () => {
    const textToCopy = generatedPassword || newPassword;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setHasCopied(true);
      toast.success('Password copied to clipboard. Securely share it with the user.');
      setTimeout(() => setHasCopied(false), 3000);
    } catch {
      toast.error('Unable to copy password to clipboard.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error('First name, last name, and institutional email are required.');
      return;
    }

    // Basic email pattern validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid institutional email address.');
      return;
    }

    setIsSavingProfile(true);
    try {
      await adminApi.updateUser(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        role: isSelf ? undefined : role,
        departmentId: departmentId || undefined,
        employeeId: employeeId.trim() ? employeeId.trim() : null,
        phoneNumber: phoneNumber.trim() ? phoneNumber.trim() : null,
        isActive: isSelf ? undefined : isActive,
      });

      toast.success(`User ${firstName.trim()} ${lastName.trim()} updated successfully.`);
      onUserUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update user profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!newPassword) {
      toast.error('Please enter or generate a new password.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsResettingPassword(true);
    try {
      await adminApi.resetUserPassword(user.id, newPassword);
      const uName = `${user.firstName || (user as any).first_name || ''} ${user.lastName || (user as any).last_name || ''}`.trim() || user.email;
      toast.success(`Password successfully updated for ${uName}.`);
      onUserUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reset password');
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (!user) return null;

  const userFirstName = user.firstName || (user as any).first_name || '';
  const userLastName = user.lastName || (user as any).last_name || '';
  const userDisplayName =
    `${userFirstName} ${userLastName}`.trim() || user.email || 'User';
  const initialF = userFirstName ? userFirstName[0]?.toUpperCase() : '';
  const initialL = userLastName ? userLastName[0]?.toUpperCase() : '';
  const initials =
    (initialF + initialL) || (user.email ? user.email[0]?.toUpperCase() : 'U');

  const passwordLengthValid = newPassword.length >= 8;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg overflow-hidden p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 bg-zinc-50/70 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#6f1a7e]/10 text-[#6f1a7e] dark:bg-[#6f1a7e]/20 dark:text-[#a54db5] flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Edit User Account
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {user.role}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Manage profile info, email address, and security credentials for {userDisplayName}.
              </DialogDescription>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 -mb-1">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-zinc-800 text-[#6f1a7e] dark:text-[#c477d2] shadow-xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <User className="size-3.5" />
              Profile & Email
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'security'
                  ? 'bg-white dark:bg-zinc-800 text-[#6f1a7e] dark:text-[#c477d2] shadow-xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <KeyRound className="size-3.5" />
              Security & Password
            </button>
          </div>
        </DialogHeader>

        {/* Tab 1: Profile & Email */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">First Name *</Label>
                <Input
                  className="text-xs h-8.5"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Last Name *</Label>
                <Input
                  className="text-xs h-8.5"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Institutional Email *</Label>
                <span className="text-[11px] text-zinc-400">Used for system authentication</span>
              </div>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 size-3.5 text-zinc-400" />
                <Input
                  type="email"
                  className="text-xs h-8.5 pl-8"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username@cbe.com.et"
                  required
                />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Updating the email address will update the user&apos;s login username. A notification will be sent.
              </p>
            </div>

            {/* Role & Department */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Role *</Label>
                  {isSelf && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      Self (Locked)
                    </span>
                  )}
                </div>
                <Select
                  value={role}
                  onValueChange={(val) => { if (val) setRole(val as UserRole); }}
                  items={roleLabels}
                  disabled={isSelf}
                >
                  <SelectTrigger className="text-xs h-8.5">
                    <SelectValue placeholder="Select Role">
                      {(v) => (v && roleLabels[v]) ? roleLabels[v] : 'Select Role'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="TECHNICIAN">IS Support Technician</SelectItem>
                    <SelectItem value="ADMINISTRATOR">IS Administrator</SelectItem>
                  </SelectContent>
                </Select>
                {isSelf && (
                  <p className="text-[10px] text-zinc-400">
                    Administrators cannot modify their own administrative role.
                  </p>
                )}
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
                        if (!val) return 'Select Department';
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

            {/* Staff ID & Phone Number */}
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
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 size-3.5 text-zinc-400" />
                  <Input
                    className="text-xs h-8.5 pl-8"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+251-9..."
                  />
                </div>
              </div>
            </div>

            {/* Account Active Status */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    Account Status
                  </Label>
                  <p className="text-[11px] text-zinc-500">
                    {isActive
                      ? 'Account is active and able to sign in.'
                      : 'Account is deactivated and cannot access the system.'}
                  </p>
                </div>
                {isSelf ? (
                  <span className="text-[11px] text-zinc-400 italic">Self cannot deactivate</span>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setIsActive(!isActive)}
                    className={
                      isActive
                        ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400'
                        : 'border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400'
                    }
                  >
                    {isActive ? (
                      <>
                        <BadgeCheck className="size-3 mr-1 text-emerald-600" />
                        Active
                      </>
                    ) : (
                      <>
                        <AlertCircle className="size-3 mr-1 text-rose-600" />
                        Inactive
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSavingProfile}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingProfile}
                className="bg-[#6f1a7e] hover:bg-[#561361] text-white text-xs"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Profile Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' && (
          <form onSubmit={handleResetPassword} className="p-5 space-y-4">
            {/* Security Alert Banner */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40">
              <ShieldAlert className="size-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  Administrative Credential Reset
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  As an administrator, you can generate or enter a new password for this user. The change is immediate and the user must use the new password on next login.
                </p>
              </div>
            </div>

            {/* Quick Generator Box */}
            <div className="p-3.5 rounded-xl border border-purple-100 dark:border-purple-950/60 bg-purple-50/50 dark:bg-purple-950/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6f1a7e] dark:text-[#c477d2]">
                  <Sparkles className="size-3.5" />
                  Strong Password Generator
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={handleGenerateStrongPassword}
                  className="h-7 text-xs bg-white dark:bg-zinc-900 border-purple-200 dark:border-purple-800 text-[#6f1a7e] dark:text-[#c477d2] hover:bg-purple-50"
                >
                  Generate Strong Password
                </Button>
              </div>

              {generatedPassword && (
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-800 font-mono text-xs">
                  <span className="text-zinc-800 dark:text-zinc-200 font-semibold select-all break-all">
                    {generatedPassword}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={handleCopyPassword}
                    className="shrink-0 h-6 px-2 text-[11px] text-[#6f1a7e] hover:bg-purple-100 dark:hover:bg-purple-900/50"
                  >
                    {hasCopied ? (
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
              )}
            </div>

            {/* Manual Password Inputs */}
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <Label className="text-xs font-medium">New Password *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    className="text-xs h-8.5 pr-8 font-mono"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter min. 8 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Confirm New Password *</Label>
                  {confirmPassword && (
                    <span className="flex items-center gap-1 text-[11px] font-medium">
                      {passwordsMatch ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <Check className="size-3" /> Passwords match
                        </span>
                      ) : (
                        <span className="text-rose-500 flex items-center gap-0.5">
                          <X className="size-3" /> Passwords do not match
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="text-xs h-8.5 pr-8 font-mono"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Validation Hints */}
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 text-[11px] space-y-1">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                CBE Security Policy Guidelines:
              </span>
              <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                <div className={`size-1.5 rounded-full ${passwordLengthValid ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
                <span>At least 8 characters in length</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                <div className={`size-1.5 rounded-full ${passwordsMatch ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
                <span>Passwords match identically</span>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isResettingPassword}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isResettingPassword || !passwordLengthValid || !passwordsMatch}
                className="bg-[#6f1a7e] hover:bg-[#561361] text-white text-xs"
              >
                {isResettingPassword ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Confirm & Update Password'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
