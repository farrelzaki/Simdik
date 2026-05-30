<?php

namespace App\Http\Controllers\Admin;

use App\Services\NotificationService;
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
            return response()->json(['message' => 'Request ini sudah diproses'], 422);
        }

        $perubahan->update([
            'status'         => $request->status,
            'catatan'        => $request->catatan,
            'id_tata_usaha'  => $request->user()->id_tata_usaha,
            'tanggal_review' => now(),
        ]);

        if ($request->status === 'disetujui') {
            if ($perubahan->tipe === 'profil') {
                $perubahan->pendidik->update($perubahan->data_baru);

                NotificationService::pendidik(
                    $perubahan->id_pendidik,
                    'Perubahan Profil Disetujui',
                    'Perubahan data profil Anda telah disetujui dan diterapkan.',
                    'success',
                    '/pendidik/profil'
                );

            } elseif ($perubahan->tipe === 'dokumen') {
                $dokumen = Dokumen::firstOrCreate(
                    ['id_pendidik' => $perubahan->id_pendidik],
                    ['status_kelengkapan' => 'belum_lengkap']
                );

                // Langsung update kolom dokumen dengan path dari data_baru
                // File sudah dipastikan ada karena berhasil diunggah oleh pendidik
                $updateData = $perubahan->data_baru;

                \Illuminate\Support\Facades\Log::info('Update dokumen disetujui', [
                    'id_perubahan' => $perubahan->id_perubahan,
                    'id_pendidik'  => $perubahan->id_pendidik,
                    'id_dokumen'   => $dokumen->id_dokumen,
                    'update_data'  => $updateData,
                ]);

                $dokumen->fill($updateData)->save();

                NotificationService::pendidik(
                    $perubahan->id_pendidik,
                    'Update Dokumen Disetujui',
                    'Dokumen Anda telah berhasil diperbarui.',
                    'success',
                    '/pendidik/dokumen'
                );
            }
        } else {
            $jenis = $perubahan->tipe === 'profil' ? 'Perubahan Profil' : 'Update Dokumen';
            NotificationService::pendidik(
                $perubahan->id_pendidik,
                "{$jenis} Ditolak",
                "Request {$jenis} Anda ditolak." . ($request->catatan ? " Catatan: {$request->catatan}" : ''),
                'error',
                $perubahan->tipe === 'dokumen' ? '/pendidik/dokumen' : '/pendidik/profil'
            );
        }

        return response()->json(['message' => 'Request berhasil diproses']);
    }
}