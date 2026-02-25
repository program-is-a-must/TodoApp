<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * REGISTER
     * POST /api/register
     * Used by: app/signup.tsx
     *
     * Body: { name, email, password, password_confirmation }
     */
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => strtolower($request->email),
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('todowall-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Account created successfully!',
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * LOGIN
     * POST /api/login
     * Used by: app/login.tsx
     *
     * Body: { email, password }
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', strtolower($request->email))->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Incorrect email or password.',
            ], 401);
        }

        // Delete old tokens so only one session at a time
        $user->tokens()->delete();

        $token = $user->createToken('todowall-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Logged in successfully!',
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
            'token' => $token,
        ]);
    }

    /**
     * LOGOUT
     * POST /api/logout
     * Used by: app/(tabs)/index.tsx and app/(tabs)/explore.tsx
     *
     * Header: Authorization: Bearer {token}
     */
    public function logout(Request $request)
    {
        // Delete the current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * GET CURRENT USER
     * GET /api/user
     * Used by: app/(tabs)/explore.tsx (profile screen)
     *
     * Header: Authorization: Bearer {token}
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => [
                'id'    => $request->user()->id,
                'name'  => $request->user()->name,
                'email' => $request->user()->email,
            ],
        ]);
    }
}