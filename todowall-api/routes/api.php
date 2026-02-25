<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TodoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| TodoWall API Routes
|--------------------------------------------------------------------------
|
| PUBLIC routes — no login needed (used by login.tsx and signup.tsx)
|
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| PROTECTED routes — must send token in header:
| Authorization: Bearer YOUR_TOKEN_HERE
|
| These match all actions in:
|   app/(tabs)/index.tsx  — todo list
|   app/(tabs)/explore.tsx — profile & stats
|   components/TodoCard.tsx — toggle, edit, delete
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'me']);

    // Todos — stats must come BEFORE {id} routes or Laravel misreads it
    Route::get('/todos/stats',       [TodoController::class, 'stats']);
    Route::get('/todos',             [TodoController::class, 'index']);
    Route::post('/todos',            [TodoController::class, 'store']);
    Route::put('/todos/{id}',        [TodoController::class, 'update']);
    Route::patch('/todos/{id}/toggle', [TodoController::class, 'toggle']);
    Route::delete('/todos/{id}',     [TodoController::class, 'destroy']);

});