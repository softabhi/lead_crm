<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Dashboard aggregated statistics.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Lead::query();

        // Scope metrics if sales user
        if ($user->isSalesUser()) {
            $query->where('assigned_user_id', $user->id);
        }

        $totalLeads = (clone $query)->count();
        $newLeads = (clone $query)->where('status', 'New')->count();
        $convertedLeads = (clone $query)->where('status', 'Converted')->count();
        $lostLeads = (clone $query)->where('status', 'Lost')->count();

        // Counts grouped by status
        $statusCounts = (clone $query)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Ensure all possible statuses are present in object
        $statuses = ['New', 'Contacted', 'Interested', 'Follow-up', 'Converted', 'Lost'];
        $leadsByStatus = [];
        foreach ($statuses as $status) {
            $leadsByStatus[$status] = $statusCounts[$status] ?? 0;
        }

        // Leads grouped by salesperson (Admin overview)
        $leadsBySalesperson = [];
        if ($user->isAdmin()) {
            $leadsBySalesperson = User::where('role', 'sales_user')
                ->withCount('assignedLeads')
                ->get()
                ->map(fn($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'assigned_count' => $u->assigned_leads_count,
                ]);

            $unassignedCount = Lead::whereNull('assigned_user_id')->count();
            $leadsBySalesperson->push([
                'id' => null,
                'name' => 'Unassigned',
                'email' => null,
                'assigned_count' => $unassignedCount,
            ]);
        }

        $conversionRate = $totalLeads > 0 ? round(($convertedLeads / $totalLeads) * 100, 1) : 0;

        return response()->json([
            'data' => [
                'total_leads' => $totalLeads,
                'new_leads' => $newLeads,
                'converted_leads' => $convertedLeads,
                'lost_leads' => $lostLeads,
                'conversion_rate' => $conversionRate,
                'leads_by_status' => $leadsByStatus,
                'leads_by_salesperson' => $leadsBySalesperson,
            ],
        ]);
    }
}
