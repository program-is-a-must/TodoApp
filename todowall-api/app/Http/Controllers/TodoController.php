<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;

class TodoController extends Controller
{
    /**
     * GET ALL TODOS for the logged-in user
     * GET /api/todos
     * Used by: app/(tabs)/index.tsx — loadData()
     *
     * Returns todos sorted: incomplete first, then completed.
     * Matches the frontend sort logic in index.tsx.
     */
    public function index(Request $request)
    {
        $todos = Todo::where('user_id', $request->user()->id)
            ->orderBy('done', 'asc')      // incomplete (0) before done (1)
            ->orderBy('created_at', 'desc') // newest first within each group
            ->get();

        return response()->json([
            'success' => true,
            'todos'   => $todos,
        ]);
    }

    /**
     * ADD A NEW TODO
     * POST /api/todos
     * Used by: app/(tabs)/index.tsx — handleAddTodo()
     *
     * Body: { text, category, priority }
     * category: Work | Personal | Shopping | Health   (matches constants/Colors.ts CATEGORIES)
     * priority: high | medium | low
     */
    public function store(Request $request)
    {
        $request->validate([
            'text'     => 'required|string|max:500',
            'category' => 'required|in:Work,Personal,Shopping,Health',
            'priority' => 'required|in:high,medium,low',
        ]);

        $todo = Todo::create([
            'user_id'  => $request->user()->id,
            'text'     => $request->text,
            'category' => $request->category,
            'priority' => $request->priority,
            'done'     => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Task added!',
            'todo'    => $todo,
        ], 201);
    }

    /**
     * UPDATE TODO TEXT
     * PUT /api/todos/{id}
     * Used by: components/TodoCard.tsx — handleSave() (edit mode)
     *
     * Body: { text }
     * Only the owner can update their own todo (checked below).
     */
    public function update(Request $request, $id)
    {
        $todo = Todo::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $todo) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found.',
            ], 404);
        }

        $request->validate([
            'text'     => 'sometimes|string|max:500',
            'category' => 'sometimes|in:Work,Personal,Shopping,Health',
            'priority' => 'sometimes|in:high,medium,low',
        ]);

        $todo->update($request->only(['text', 'category', 'priority']));

        return response()->json([
            'success' => true,
            'message' => 'Task updated!',
            'todo'    => $todo,
        ]);
    }

    /**
     * TOGGLE DONE / UNDONE
     * PATCH /api/todos/{id}/toggle
     * Used by: components/TodoCard.tsx — checkbox onPress → onToggle()
     *
     * No body needed — just flips the current done value.
     */
    public function toggle(Request $request, $id)
    {
        $todo = Todo::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $todo) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found.',
            ], 404);
        }

        $todo->update(['done' => ! $todo->done]);

        return response()->json([
            'success' => true,
            'message' => $todo->done ? 'Task completed! 🎉' : 'Task marked incomplete.',
            'todo'    => $todo,
        ]);
    }

    /**
     * DELETE A TODO
     * DELETE /api/todos/{id}
     * Used by: components/TodoCard.tsx — handleDelete() → Alert confirm → onDelete()
     *
     * Only the owner can delete their own todo.
     */
    public function destroy(Request $request, $id)
    {
        $todo = Todo::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $todo) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found.',
            ], 404);
        }

        $todo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Task deleted.',
        ]);
    }

    /**
     * GET STATS (for the Profile/explore tab)
     * GET /api/todos/stats
     * Used by: app/(tabs)/explore.tsx — category breakdown + counts
     */
    public function stats(Request $request)
    {
        $userId = $request->user()->id;

        $todos = Todo::where('user_id', $userId)->get();

        $total    = $todos->count();
        $done     = $todos->where('done', true)->count();
        $pending  = $total - $done;
        $high     = $todos->where('priority', 'high')->where('done', false)->count();

        // Per-category breakdown — matches CATEGORIES in constants/Colors.ts
        $categories = ['Work', 'Personal', 'Shopping', 'Health'];
        $categoryStats = [];
        foreach ($categories as $cat) {
            $catTodos = $todos->where('category', $cat);
            $categoryStats[] = [
                'category' => $cat,
                'total'    => $catTodos->count(),
                'done'     => $catTodos->where('done', true)->count(),
            ];
        }

        return response()->json([
            'success' => true,
            'stats'   => [
                'total'           => $total,
                'done'            => $done,
                'pending'         => $pending,
                'high_priority'   => $high,
                'completion_rate' => $total > 0 ? round(($done / $total) * 100) : 0,
                'by_category'     => $categoryStats,
            ],
        ]);
    }
}