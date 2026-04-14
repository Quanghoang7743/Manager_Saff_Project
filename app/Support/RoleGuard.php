<?php

namespace App\Support;

use App\Models\User;

class RoleGuard
{
    public static function canManageOrg(User $user): bool
    {
        return $user->hasRole(['super_admin', 'hr_admin']);
    }

    public static function canManageEmployees(User $user): bool
    {
        return $user->hasRole(['super_admin', 'hr_admin', 'manager']);
    }

    public static function canManageAttendance(User $user): bool
    {
        return $user->hasRole(['super_admin', 'hr_admin']);
    }

    public static function canManageTasks(User $user): bool
    {
        return $user->hasRole(['super_admin', 'hr_admin', 'manager']);
    }

    public static function canViewTeamMember(User $viewer, User $target): bool
    {
        if ($viewer->hasRole(['super_admin', 'hr_admin'])) {
            return true;
        }

        if ((int) $viewer->id === (int) $target->id) {
            return true;
        }

        return $viewer->hasRole('manager') && (int) $target->manager_user_id === (int) $viewer->id;
    }
}
