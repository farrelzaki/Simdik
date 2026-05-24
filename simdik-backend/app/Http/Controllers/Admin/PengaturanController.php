<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PengaturanController extends Controller
{
    // Ganti password
    public function gantiPassword(Request $request)
    {
        $request->validate([
            'password_lama' => 'required',
            'password_baru' => 'required|min:8|confirmed',
        ]);

        $admin = $request->user();

        if (!Hash::check($request->password_lama, $admin->password)) {
            return response()->json(['message' => 'Password lama tidak sesuai'], 422);
        }

        $admin->update(['password' => Hash::make($request->password_baru)]);

        return response()->json(['message' => 'Password berhasil diperbarui']);
    }
}