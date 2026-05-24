<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PerubahanProfil;
use App\Models\Pendidik;
use App\Models\Dokumen;
use Illuminate\Http\Request;

class PerubahanProfilController extends Controller
{
    // List semua request perubahan
    public function index(Request $request)
    {
        $query = PerubahanProfil::with(['pendidik', 'tataUsaha'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', 'pending');
        }

        if ($request->filled('tipe')) {
            $query->where('tipe', $request->tipe);
        }

        return response()->json($query->paginate(15));
    }

    // Detail satu request
    public function show($id)
    {
        $perubahan = PerubahanProfil::with(['pendidik.dokumen', 'tataUsaha'])
            ->findOrFail($id);

        return response()->json(['data' => $perubahan]);
    }

    // Setujui atau tolak perubahan
    public function review(Request $request, $id)
    {
        $request->validate([
            'status'  => 'required|in:disetujui,ditolak',
            'catatan' => 'nullable|string',
        ]);

        $perubahan = PerubahanProfil::with('pendidik')->findOrFail($id);

        if ($perubahan->status !== 'pending') {
            return response()->json(['message' => 'Request ini sudah diproses sebelumnya'], 422);
        }

        $perubahan->update([
            'status'         => $request->status,
            'catatan'        => $request->catatan,
            'id_tata_usaha'  => $request->user()->id_tata_usaha,
            'tanggal_review' => now(),
        ]);

        // Kalau disetujui, terapkan perubahan
        if ($request->status === 'disetujui') {
            if ($perubahan->tipe === 'profil') {
                $perubahan->pendidik->update($perubahan->data_baru);
            } elseif ($perubahan->tipe === 'dokumen') {
                $dokumen = Dokumen::where('id_pendidik', $perubahan->id_pendidik)->first();
                if ($dokumen) {
                    $dokumen->update($perubahan->data_baru);
                }
            }
        }

        return response()->json(['message' => 'Request berhasil diproses']);
    }
}