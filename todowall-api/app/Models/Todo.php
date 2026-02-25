<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Todo extends Model
{
    use HasFactory;

    /**
     * Fields that can be mass-assigned (saved from form/API input).
     */
    protected $fillable = [
        'user_id',
        'text',
        'done',
        'category',
        'priority',
    ];

    /**
     * Cast 'done' to a true boolean (not just 0/1 from SQLite).
     */
    protected $casts = [
        'done' => 'boolean',
    ];

    /**
     * Each todo belongs to one user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}