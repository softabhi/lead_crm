<?php

namespace Database\Seeders;

use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\LeadAssignment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Admin User
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@crm.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        // 2. Create Sales Users
        $rahul = User::create([
            'name' => 'Rahul Sharma',
            'email' => 'rahul@crm.com',
            'password' => Hash::make('password'),
            'role' => 'sales_user',
            'is_active' => true,
        ]);

        $priya = User::create([
            'name' => 'Priya Patel',
            'email' => 'priya@crm.com',
            'password' => Hash::make('password'),
            'role' => 'sales_user',
            'is_active' => true,
        ]);

        $amit = User::create([
            'name' => 'Amit Kumar',
            'email' => 'amit@crm.com',
            'password' => Hash::make('password'),
            'role' => 'sales_user',
            'is_active' => true,
        ]);

        // 3. Create Sample Leads
        $leadsData = [
            [
                'name' => 'Acme Corp Enquiry',
                'phone' => '9876543210',
                'email' => 'contact@acme.com',
                'source' => 'Website Form',
                'status' => 'Contacted',
                'assigned_user_id' => $rahul->id,
            ],
            [
                'name' => 'TechSolutions Inc',
                'phone' => '9876543211',
                'email' => 'sales@techsolutions.io',
                'source' => 'LinkedIn Ad',
                'status' => 'Interested',
                'assigned_user_id' => $priya->id,
            ],
            [
                'name' => 'Global Logistics',
                'phone' => '9876543212',
                'email' => 'info@globallogistics.com',
                'source' => 'Referral',
                'status' => 'Converted',
                'assigned_user_id' => $rahul->id,
            ],
            [
                'name' => 'Apex Enterprises',
                'phone' => '9876543213',
                'email' => 'deals@apex.org',
                'source' => 'Cold Email',
                'status' => 'Lost',
                'assigned_user_id' => $amit->id,
            ],
            [
                'name' => 'Starlight Retail',
                'phone' => '9876543214',
                'email' => 'support@starlight.com',
                'source' => 'Google Search',
                'status' => 'New',
                'assigned_user_id' => null,
            ],
            [
                'name' => 'Nexus Innovations',
                'phone' => '9876543215',
                'email' => 'hello@nexus.co',
                'source' => 'Website Form',
                'status' => 'Follow-up',
                'assigned_user_id' => $priya->id,
            ],
        ];

        foreach ($leadsData as $data) {
            $lead = Lead::create(array_merge($data, [
                'created_by_id' => $admin->id,
            ]));

            // Add Initial Creation Activity
            LeadActivity::create([
                'lead_id' => $lead->id,
                'user_id' => $admin->id,
                'activity_type' => 'created',
                'description' => "Lead created by {$admin->name}",
                'new_values' => $lead->only(['name', 'phone', 'email', 'source', 'status', 'assigned_user_id']),
            ]);

            // Add Assignment History if assigned
            if ($lead->assigned_user_id) {
                $assignedUser = User::find($lead->assigned_user_id);

                LeadAssignment::create([
                    'lead_id' => $lead->id,
                    'assigned_by_id' => $admin->id,
                    'assigned_from_id' => null,
                    'assigned_to_id' => $assignedUser->id,
                    'reason' => 'Initial assignment',
                ]);

                LeadActivity::create([
                    'lead_id' => $lead->id,
                    'user_id' => $admin->id,
                    'activity_type' => 'assigned',
                    'description' => "Lead assigned to {$assignedUser->name} by {$admin->name}",
                    'new_values' => ['assigned_to' => $assignedUser->name],
                ]);
            }

            // Add a sample note
            LeadActivity::create([
                'lead_id' => $lead->id,
                'user_id' => $lead->assigned_user_id ?? $admin->id,
                'activity_type' => 'note_added',
                'description' => "Initial discussion completed. Lead interest recorded.",
            ]);
        }
    }
}
