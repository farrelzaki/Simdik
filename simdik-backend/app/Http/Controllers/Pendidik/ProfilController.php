<?php

namespace App\Http\Controllers\Pendidik;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfilController extends Controller
{
    // Lihat profil sendiri
    public function show(Request $request)
    {
        $pendidik = $request->user();
        $pendidik->load(['dokumen', 'verifikasi']);

        return response()->json([
            'data' => $pendidik
        ]);
    }

    // Edit profil sendiri
    public function update(Request $request)
    {
        $pendidik = $request->user();

        $request->validate([
            'nama'                => 'sometimes|string|max:100',
            'no_hp'               => 'sometimes|string|max:20',
            'alamat'              => 'sometimes|string',
            'pendidikan_terakhir' => 'sometimes|string',
            'password'            => 'sometimes|min:8|confirmed',
        ]);

        $data = $request->only(['nama', 'no_hp', 'alamat', 'pendidikan_terakhir']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $pendidik->update($data);

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'data'    => $pendidik->fresh(),
        ]);
    }

    // Cek status verifikasi
    public function statusVerifikasi(Request $request)
    {
        $pendidik = $request->user()->load(['verifikasi.tataUsaha', 'dokumen']);

        return response()->json([
            'status_akun'      => $pendidik->status_akun,
            'verifikasi'       => $pendidik->verifikasi,
            'dokumen'          => $pendidik->dokumen,
        ]);
    }
}