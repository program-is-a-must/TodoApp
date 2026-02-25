<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // ← THIS is required for Sanctum tokens

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // ← HasApiTokens must be here

    /**
     * Fields that can be mass-assigned.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * Fields hidden from JSON responses (never expose password!).
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Type casting.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * A user has many todos.
     */
    public function todos()
    {
        return $this->hasMany(Todo::class);
    }
}