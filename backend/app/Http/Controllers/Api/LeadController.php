<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\User;
use App\Services\LeadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LeadController extends Controller
{
    public function __construct(protected LeadService $leadService) {}

    /**
     * List leads with search, filters, pagination, and role-based scoping.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Lead::query()->with(['assignedUser', 'createdBy']);

        // Enforce RBAC Scoping: Sales User only sees assigned leads
        if ($user->isSalesUser()) {
            $query->where('assigned_user_id', $user->id);
        } elseif ($request->filled('assigned_user_id')) {
            if ($request->query('assigned_user_id') === 'unassigned') {
                $query->whereNull('assigned_user_id');
            } else {
                $query->where('assigned_user_id', $request->query('assigned_user_id'));
            }
        }

        // Filter: Status
        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        // Filter: Source
        if ($request->filled('source')) {
            $query->where('source', $request->query('source'));
        }

        // Filter: Search (Name, Email, Phone)
        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter: Date Range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->query('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->query('date_to'));
        }

        // Sorting
        $sortBy = $request->query('sort_by', 'created_at');
        $sortOrder = $request->query('sort_order', 'desc');
        $allowedSorts = ['created_at', 'updated_at', 'name', 'status'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, strtolower($sortOrder) === 'asc' ? 'asc' : 'desc');
        }

        $perPage = min((int) $request->query('per_page', 15), 100);
        $leads = $query->paginate($perPage);

        return response()->json($leads);
    }

    /**
     * Public Lead Enquiry Submission (No auth required)
     */
    public function publicEnquiry(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255'],
            'source' => ['nullable', 'string', 'max:100'],
            'message' => ['nullable', 'string', 'max:2000'],
        ]);

        $systemActor = User::where('role', 'admin')->first();

        $data = [
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'source' => $validated['source'] ?? 'Website Enquiry',
            'status' => 'New',
            'assigned_user_id' => null,
        ];

        $result = $this->leadService->createLead($data, $systemActor);

        if (!empty($validated['message'])) {
            $this->leadService->addNote($result['lead'], "Public Enquiry Message: " . $validated['message'], $systemActor);
        }

        return response()->json([
            'message' => 'Thank you! Your enquiry has been received successfully. Our sales team will get in touch soon.',
            'data' => $result['lead'],
        ], 201);
    }

    /**
     * Create a new lead.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255'],
            'source' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(['New', 'Contacted', 'Interested', 'Follow-up', 'Converted', 'Lost'])],
            'assigned_user_id' => ['nullable', 'exists:users,id'],
        ]);

        $result = $this->leadService->createLead($validated, $request->user());

        return response()->json([
            'message' => 'Lead created successfully',
            'duplicate_warning' => $result['duplicate_warning'],
            'data' => $result['lead'],
        ], 201);
    }

    /**
     * View lead details.
     */
    public function show(Request $request, Lead $lead): JsonResponse
    {
        $user = $request->user();

        // RBAC authorization check
        if ($user->isSalesUser() && $lead->assigned_user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized access. You do not own this lead.'], 403);
        }

        $lead->load([
            'assignedUser:id,name,email,role',
            'createdBy:id,name,email',
            'assignments.assignedBy:id,name',
            'assignments.assignedFrom:id,name',
            'assignments.assignedTo:id,name',
            'activities.user:id,name,role',
        ]);

        return response()->json(['data' => $lead]);
    }

    /**
     * Update lead details.
     */
    public function update(Request $request, Lead $lead): JsonResponse
    {
        $user = $request->user();

        if ($user->isSalesUser() && $lead->assigned_user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized to update this lead.'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'phone' => ['sometimes', 'required', 'string', 'max:50'],
            'email' => ['sometimes', 'required', 'email', 'max:255'],
            'source' => ['sometimes', 'required', 'string', 'max:100'],
        ]);

        $updatedLead = $this->leadService->updateLead($lead, $validated, $user);

        return response()->json([
            'message' => 'Lead updated successfully',
            'data' => $updatedLead,
        ]);
    }

    /**
     * Assign/Reassign lead (Admin only, or Sales user requesting reassignment).
     */
    public function assign(Request $request, Lead $lead): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Only admins can reassign leads directly.'], 403);
        }

        $validated = $request->validate([
            'assigned_user_id' => ['nullable', 'exists:users,id'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $updatedLead = $this->leadService->assignLead(
            $lead,
            $validated['assigned_user_id'] ?? null,
            $user,
            $validated['reason'] ?? null
        );

        return response()->json([
            'message' => 'Lead assigned successfully',
            'data' => $updatedLead,
        ]);
    }

    /**
     * Update lead status.
     */
    public function updateStatus(Request $request, Lead $lead): JsonResponse
    {
        $user = $request->user();

        if ($user->isSalesUser() && $lead->assigned_user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized to update status for this lead.'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(['New', 'Contacted', 'Interested', 'Follow-up', 'Converted', 'Lost'])],
        ]);

        $updatedLead = $this->leadService->changeStatus($lead, $validated['status'], $user);

        return response()->json([
            'message' => 'Lead status updated successfully',
            'data' => $updatedLead,
        ]);
    }

    /**
     * Add note/activity to lead.
     */
    public function addNote(Request $request, Lead $lead): JsonResponse
    {
        $user = $request->user();

        if ($user->isSalesUser() && $lead->assigned_user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized to add note to this lead.'], 403);
        }

        $validated = $request->validate([
            'note' => ['required', 'string', 'max:2000'],
        ]);

        $activity = $this->leadService->addNote($lead, $validated['note'], $user);

        return response()->json([
            'message' => 'Note added successfully',
            'data' => $activity->load('user:id,name,role'),
        ], 201);
    }

    /**
     * View history/activity timeline for a lead.
     */
    public function history(Request $request, Lead $lead): JsonResponse
    {
        $user = $request->user();

        if ($user->isSalesUser() && $lead->assigned_user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $activities = $lead->activities()->with('user:id,name,role')->get();

        return response()->json(['data' => $activities]);
    }
}
