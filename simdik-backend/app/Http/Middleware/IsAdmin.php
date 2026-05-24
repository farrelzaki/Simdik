<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        // Support both sanctum API dan session-based web auth
        if ($request->expectsJson()) {
            if (!auth('tata_usaha')->check()) {
                return response()->json(['message' => 'Akses ditolak'], 403);
            }
        } else {
            if (!auth('web')->check()) {
                return redirect()->route('login');
            }
            
            $user = auth('web')->user();
            if (!$user || get_class($user) !== 'App\Models\TataUsaha') {
                auth('web')->logout();
                return redirect()->route('login')->with('error', 'Unauthorized');
            }
        }

        return $next($request);
    }
}