<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * This creates the "todos" table in your SQLite database.
     */
    public function up(): void
    {
        Schema::create('todos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('text');
            $table->boolean('done')->default(false);
            $table->string('category')->default('Personal');
            $table->enum('priority', ['high', 'medium', 'low'])->default('medium');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations (undo).
     */
    public function down(): void
    {
        Schema::dropIfExists('todos');
    }
};