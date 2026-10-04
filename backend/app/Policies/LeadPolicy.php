<?php

namespace App\Policies;

use App\Models\Lead;
use App\Models\User;

class LeadPolicy
{
    /**
     * Determine whether the user can view any leads.
     */
    public function viewAny(User $user): bool
    {
        return true; // Admin sees all, Sales User sees assigned (handled in Controller scope query)
    }

    /**
     * Determine whether the user can view the specific lead.
     */
    public function view(User $user, Lead $lead): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $lead->assigned_user_id === $user->id;
    }

    /**
     * Determine whether the user can create leads.
     */
    public function create(User $user): bool
    {
        return true; // Both Admin and Sales users can create leads
    }

    /**
     * Determine whether the user can update the lead.
     */
    public function update(User $user, Lead $lead): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $lead->assigned_user_id === $user->id;
    }

    /**
     * Determine whether the user can assign/reassign the lead.
     */
    public function assign(User $user, Lead $lead): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the lead.
     */
    public function delete(User $user, Lead $lead): bool
    {
        return $user->isAdmin();
    }
}
