<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsPendidikAktif
{
    public function handle(Request $request, Closure $next)
    {
        // Support both sanctum API dan session-based web auth
        if ($request->expectsJson()) {
            $pendidik = auth('pendidik')->user();

            if (!$pendidik) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }
        } else {
            if (!auth('web')->check()) {
                return redirect()->route('login');
            }

            $pendidik = auth('web')->user();
            if (!$pendidik || get_class($pendidik) !== 'App\Models\Pendidik') {
                auth('web')->logout();
                return redirect()->route('login')->with('error', 'Unauthorized');
            }
        }

        if ($pendidik->status_akun === 'pending') {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Akun sedang menunggu verifikasi',
                    'status'  => 'pending',
                ], 403);
            }
            return redirect()->route('login')->with('error', 'Akun Anda sedang menunggu verifikasi');
        }

        if ($pendidik->status_akun === 'ditolak') {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Akun ditolak oleh admin',
                    'status'  => 'ditolak',
                ], 403);
            }
            return redirect()->route('login')->with('error', 'Akun Anda ditolak');
        }

        return $next($request);
    }
}
