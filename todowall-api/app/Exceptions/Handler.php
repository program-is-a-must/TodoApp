<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * Errors we don't need to report/log.
     */
    protected $dontReport = [];

    /**
     * Inputs that should never be flashed to session on validation errors.
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register()
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Return JSON instead of HTML for all API routes.
     * This is important — without this, errors show an HTML page
     * and your React Native app won't understand them.
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => false,
                'message' => 'Not authenticated. Please login first.',
            ], 401);
        }

        return redirect()->guest(route('login'));
    }

    public function render($request, Throwable $exception)
    {
        // Return JSON validation errors for API routes
        if ($exception instanceof ValidationException && ($request->expectsJson() || $request->is('api/*'))) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $exception->errors(),
            ], 422);
        }

        return parent::render($request, $exception);
    }
}