<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\LeadAssignment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * List all users (Admin only, or Sales Users for assignment dropdowns)
     */
    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->query('role'), fn($q, $role) => $q->where('role', $role))
            ->when($request->query('active_only'), fn($q) => $q->where('is_active', true))
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'is_active', 'created_at']);

        return response()->json(['data' => $users]);
    }

    /**
     * Create a new sales user (Admin only)
     */
    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized. Only admins can create users.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', Rule::in(['admin', 'sales_user'])],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'data' => $user,
        ], 201);
    }

    /**
     * Toggle active status of a user (Admin only)
     * If user is deactivated, unassign active leads to prevent orphan ownership.
     */
    public function toggleStatus(Request $request, User $user): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot deactivate your own account.'], 422);
        }

        DB::transaction(function () use ($user, $request) {
            $user->is_active = !$user->is_active;
            $user->save();

            // If user was deactivated, unassign their active leads and log activities
            if (!$user->is_active) {
                $assignedLeads = Lead::where('assigned_user_id', $user->id)->get();
                foreach ($assignedLeads as $lead) {
                    $lead->assigned_user_id = null;
                    $lead->save();

                    LeadAssignment::create([
                        'lead_id' => $lead->id,
                        'assigned_by_id' => $request->user()->id,
                        'assigned_from_id' => $user->id,
                        'assigned_to_id' => null,
                        'reason' => "Unassigned due to user deactivation ({$user->name})",
                    ]);

                    LeadActivity::create([
                        'lead_id' => $lead->id,
                        'user_id' => $request->user()->id,
                        'activity_type' => 'reassigned',
                        'description' => "Lead unassigned automatically because sales user {$user->name} was deactivated.",
                        'old_values' => ['assigned_user' => $user->name],
                        'new_values' => ['assigned_user' => 'Unassigned'],
                    ]);
                }
            }
        });

        return response()->json([
            'message' => "User status updated to " . ($user->is_active ? 'Active' : 'Inactive'),
            'data' => $user,
        ]);
    }
}
