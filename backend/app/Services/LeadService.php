<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\LeadAssignment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LeadService
{
    /**
     * Allowed status transitions map.
     */
    protected array $allowedTransitions = [
        'New' => ['Contacted', 'Interested', 'Follow-up', 'Converted', 'Lost'],
        'Contacted' => ['Interested', 'Follow-up', 'Converted', 'Lost'],
        'Interested' => ['Follow-up', 'Converted', 'Lost'],
        'Follow-up' => ['Contacted', 'Interested', 'Converted', 'Lost'],
        'Converted' => [], // Terminal state
        'Lost' => ['New', 'Contacted', 'Interested', 'Follow-up'], // Admin or sales user can reactivate lost leads
    ];

    /**
     * Create a lead with duplicate detection and audit logging.
     */
    public function createLead(array $data, User $actor): array
    {
        return DB::transaction(function () use ($data, $actor) {
            // Check for duplicates by phone or email
            $existingPhoneLead = Lead::where('phone', $data['phone'])->first();
            $existingEmailLead = Lead::where('email', $data['email'])->first();

            $duplicateWarning = null;
            if ($existingPhoneLead && $existingEmailLead && $existingPhoneLead->id === $existingEmailLead->id) {
                $duplicateWarning = "Exact duplicate lead already exists (ID: {$existingPhoneLead->id}).";
            } elseif ($existingPhoneLead) {
                $duplicateWarning = "A lead with phone number {$data['phone']} already exists (ID: {$existingPhoneLead->id}, Name: {$existingPhoneLead->name}).";
            } elseif ($existingEmailLead) {
                $duplicateWarning = "A lead with email address {$data['email']} already exists (ID: {$existingEmailLead->id}, Name: {$existingEmailLead->name}).";
            }

            $lead = Lead::create([
                'name' => $data['name'],
                'phone' => $data['phone'],
                'email' => $data['email'],
                'source' => $data['source'] ?? 'Website',
                'status' => $data['status'] ?? 'New',
                'assigned_user_id' => $data['assigned_user_id'] ?? null,
                'created_by_id' => $actor->id,
            ]);

            // Log activity: Lead Created
            LeadActivity::create([
                'lead_id' => $lead->id,
                'user_id' => $actor->id,
                'activity_type' => 'created',
                'description' => "Lead created by {$actor->name}" . ($duplicateWarning ? " [Flagged: {$duplicateWarning}]" : ''),
                'new_values' => $lead->only(['name', 'phone', 'email', 'source', 'status', 'assigned_user_id']),
            ]);

            // If assigned upon creation, log assignment
            if (!empty($data['assigned_user_id'])) {
                $assignedUser = User::find($data['assigned_user_id']);
                if ($assignedUser) {
                    LeadAssignment::create([
                        'lead_id' => $lead->id,
                        'assigned_by_id' => $actor->id,
                        'assigned_from_id' => null,
                        'assigned_to_id' => $assignedUser->id,
                        'reason' => 'Initial assignment on lead creation',
                    ]);

                    LeadActivity::create([
                        'lead_id' => $lead->id,
                        'user_id' => $actor->id,
                        'activity_type' => 'assigned',
                        'description' => "Lead initially assigned to {$assignedUser->name} by {$actor->name}",
                        'new_values' => ['assigned_to' => $assignedUser->name],
                    ]);
                }
            }

            return [
                'lead' => $lead->load(['assignedUser', 'createdBy']),
                'duplicate_warning' => $duplicateWarning,
            ];
        });
    }

    /**
     * Update lead details with change diff tracking.
     */
    public function updateLead(Lead $lead, array $data, User $actor): Lead
    {
        return DB::transaction(function () use ($lead, $data, $actor) {
            $lead->lockForUpdate();

            $oldValues = [];
            $newValues = [];

            foreach (['name', 'phone', 'email', 'source'] as $field) {
                if (array_key_exists($field, $data) && $data[$field] !== $lead->{$field}) {
                    $oldValues[$field] = $lead->{$field};
                    $newValues[$field] = $data[$field];
                    $lead->{$field} = $data[$field];
                }
            }

            if (!empty($newValues)) {
                $lead->save();

                LeadActivity::create([
                    'lead_id' => $lead->id,
                    'user_id' => $actor->id,
                    'activity_type' => 'updated',
                    'description' => "Lead details updated by {$actor->name}",
                    'old_values' => $oldValues,
                    'new_values' => $newValues,
                ]);
            }

            return $lead->load(['assignedUser', 'createdBy']);
        });
    }

    /**
     * Assign / Reassign lead atomically with historical logging.
     */
    public function assignLead(Lead $lead, ?int $newUserId, User $actor, ?string $reason = null): Lead
    {
        return DB::transaction(function () use ($lead, $newUserId, $actor, $reason) {
            $lead->lockForUpdate();

            $oldUserId = $lead->assigned_user_id;

            if ($oldUserId === $newUserId) {
                return $lead; // No change needed
            }

            $oldUser = $oldUserId ? User::find($oldUserId) : null;
            $newUser = $newUserId ? User::find($newUserId) : null;

            if ($newUserId && !$newUser) {
                throw ValidationException::withMessages([
                    'assigned_user_id' => ['The specified target user does not exist.'],
                ]);
            }

            if ($newUser && !$newUser->is_active) {
                throw ValidationException::withMessages([
                    'assigned_user_id' => ['Cannot assign lead to an inactive user.'],
                ]);
            }

            $lead->assigned_user_id = $newUserId;
            $lead->save();

            // Record immutable assignment history
            LeadAssignment::create([
                'lead_id' => $lead->id,
                'assigned_by_id' => $actor->id,
                'assigned_from_id' => $oldUserId,
                'assigned_to_id' => $newUserId,
                'reason' => $reason ?? 'Lead assignment updated',
            ]);

            $fromName = $oldUser ? $oldUser->name : 'Unassigned';
            $toName = $newUser ? $newUser->name : 'Unassigned';

            LeadActivity::create([
                'lead_id' => $lead->id,
                'user_id' => $actor->id,
                'activity_type' => 'reassigned',
                'description' => "Lead reassigned from [{$fromName}] to [{$toName}] by {$actor->name}" . ($reason ? " (Reason: {$reason})" : ''),
                'old_values' => ['assigned_user' => $fromName],
                'new_values' => ['assigned_user' => $toName],
            ]);

            return $lead->load(['assignedUser', 'createdBy']);
        });
    }

    /**
     * Change lead status with state transition validation & activity logging.
     */
    public function changeStatus(Lead $lead, string $newStatus, User $actor): Lead
    {
        return DB::transaction(function () use ($lead, $newStatus, $actor) {
            $lead->lockForUpdate();

            $oldStatus = $lead->status;

            if ($oldStatus === $newStatus) {
                return $lead;
            }

            // Validate status transitions unless user is Admin overriding
            if (!$actor->isAdmin()) {
                $allowed = $this->allowedTransitions[$oldStatus] ?? [];
                if (!in_array($newStatus, $allowed, true)) {
                    throw ValidationException::withMessages([
                        'status' => ["Cannot transition lead status from '{$oldStatus}' to '{$newStatus}'."],
                    ]);
                }
            }

            $lead->status = $newStatus;
            $lead->save();

            $activityType = match ($newStatus) {
                'Converted' => 'converted',
                'Lost' => 'lost',
                default => 'status_changed',
            };

            LeadActivity::create([
                'lead_id' => $lead->id,
                'user_id' => $actor->id,
                'activity_type' => $activityType,
                'description' => "{$actor->name} changed status from '{$oldStatus}' to '{$newStatus}'",
                'old_values' => ['status' => $oldStatus],
                'new_values' => ['status' => $newStatus],
            ]);

            return $lead->load(['assignedUser', 'createdBy']);
        });
    }

    /**
     * Add note / activity to a lead.
     */
    public function addNote(Lead $lead, string $note, User $actor): LeadActivity
    {
        return LeadActivity::create([
            'lead_id' => $lead->id,
            'user_id' => $actor->id,
            'activity_type' => 'note_added',
            'description' => $note,
            'new_values' => ['note' => $note],
        ]);
    }
}
