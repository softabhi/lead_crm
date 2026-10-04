<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadAssignment extends Model
{
    use HasFactory;

    public $timestamps = false; // Uses created_at timestamp only

    protected $fillable = [
        'lead_id',
        'assigned_by_id',
        'assigned_from_id',
        'assigned_to_id',
        'reason',
        'created_at',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by_id');
    }

    public function assignedFrom()
    {
        return $this->belongsTo(User::class, 'assigned_from_id');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to_id');
    }
}
