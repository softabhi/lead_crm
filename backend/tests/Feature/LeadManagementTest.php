<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $salesUser1;
    protected User $salesUser2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->salesUser1 = User::create([
            'name' => 'Sales One',
            'email' => 'sales1@test.com',
            'password' => bcrypt('password'),
            'role' => 'sales_user',
            'is_active' => true,
        ]);

        $this->salesUser2 = User::create([
            'name' => 'Sales Two',
            'email' => 'sales2@test.com',
            'password' => bcrypt('password'),
            'role' => 'sales_user',
            'is_active' => true,
        ]);
    }

    public function test_user_can_login_and_receive_token(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@test.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);
    }

    public function test_lead_creation_and_duplicate_warning(): void
    {
        $this->actingAs($this->admin);

        // Create first lead
        $response1 = $this->postJson('/api/leads', [
            'name' => 'First Lead',
            'phone' => '9999988888',
            'email' => 'lead@test.com',
            'source' => 'Website',
        ]);

        $response1->assertStatus(201)
            ->assertJsonPath('duplicate_warning', null);

        // Create duplicate phone lead
        $response2 = $this->postJson('/api/leads', [
            'name' => 'Second Lead',
            'phone' => '9999988888',
            'email' => 'another@test.com',
            'source' => 'Web',
        ]);

        $response2->assertStatus(201);
        $this->assertNotNull($response2->json('duplicate_warning'));
    }

    public function test_sales_user_can_only_see_assigned_leads(): void
    {
        $lead1 = Lead::create([
            'name' => 'Lead One',
            'phone' => '1111111111',
            'email' => 'one@test.com',
            'assigned_user_id' => $this->salesUser1->id,
            'created_by_id' => $this->admin->id,
        ]);

        $lead2 = Lead::create([
            'name' => 'Lead Two',
            'phone' => '2222222222',
            'email' => 'two@test.com',
            'assigned_user_id' => $this->salesUser2->id,
            'created_by_id' => $this->admin->id,
        ]);

        // Acting as Sales User 1
        $this->actingAs($this->salesUser1);

        $response = $this->getJson('/api/leads');
        $response->assertStatus(200);

        $ids = collect($response->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($lead1->id));
        $this->assertFalse($ids->contains($lead2->id));

        // Unauthorized direct access to Sales User 2's lead should return 403
        $showResponse = $this->getJson("/api/leads/{$lead2->id}");
        $showResponse->assertStatus(403);
    }

    public function test_admin_can_reassign_lead_and_audit_log_is_saved(): void
    {
        $lead = Lead::create([
            'name' => 'Reassign Target',
            'phone' => '3333333333',
            'email' => 'reassign@test.com',
            'assigned_user_id' => $this->salesUser1->id,
            'created_by_id' => $this->admin->id,
        ]);

        $this->actingAs($this->admin);

        $response = $this->postJson("/api/leads/{$lead->id}/assign", [
            'assigned_user_id' => $this->salesUser2->id,
            'reason' => 'Load balancing across team',
        ]);

        $response->assertStatus(200);
        $this->assertEquals($this->salesUser2->id, $lead->fresh()->assigned_user_id);

        // Check history timeline
        $historyResponse = $this->getJson("/api/leads/{$lead->id}/history");
        $historyResponse->assertStatus(200);

        $activities = collect($historyResponse->json('data'));
        $reassignedActivity = $activities->firstWhere('activity_type', 'reassigned');
        $this->assertNotNull($reassignedActivity);
    }

    public function test_user_deactivation_unassigns_leads(): void
    {
        $lead = Lead::create([
            'name' => 'Active Lead',
            'phone' => '4444444444',
            'email' => 'active@test.com',
            'assigned_user_id' => $this->salesUser1->id,
            'created_by_id' => $this->admin->id,
        ]);

        $this->actingAs($this->admin);

        $response = $this->patchJson("/api/users/{$this->salesUser1->id}/toggle-status");
        $response->assertStatus(200);

        $this->assertFalse($this->salesUser1->fresh()->is_active);
        $this->assertNull($lead->fresh()->assigned_user_id);
    }

    public function test_dashboard_stats_api(): void
    {
        Lead::create([
            'name' => 'Dashboard Lead',
            'phone' => '5555555555',
            'email' => 'dash@test.com',
            'status' => 'Converted',
            'assigned_user_id' => $this->salesUser1->id,
            'created_by_id' => $this->admin->id,
        ]);

        $this->actingAs($this->admin);

        $response = $this->getJson('/api/dashboard/stats');
        $response->assertStatus(200)
            ->assertJsonPath('data.total_leads', 1)
            ->assertJsonPath('data.converted_leads', 1);
    }
}
