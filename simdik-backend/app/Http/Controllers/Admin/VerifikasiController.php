<?php

namespace App\Http\Controllers\Admin;

use App\Services\NotificationService;
use App\Http\Controllers\Controller;
use App\Mail\PesanPerbaikanData;
use App\Mail\VerifikasiDisetujui;
use App\Mail\VerifikasiDitolak;
use App\Models\Pendidik;
use App\Models\Verifikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Models\Notifikasi;

class VerifikasiController extends Controller
{
    // Daftar pendaftar
    public function index(Request $request)
    {
        $query = Pendidik::with(['dokumen', 'verifikasi'])
            ->orderBy('created_at', 'desc');

        $status = $request->get('status', 'pending');

        if ($status === 'pending') {
            $query->where('status_akun', 'pending');
        } elseif ($status === 'disetujui') {
            $query->where('status_akun', 'aktif');
        } elseif ($status === 'ditolak') {
            $query->where('status_akun', 'ditolak');
        }

        return response()->json($query->paginate(10));
    }

    // Detail pendaftar
    public function show($id)
    {
        $pendidik = Pendidik::with(['dokumen', 'verifikasi.tataUsaha'])
            ->findOrFail($id);

        return response()->json(['data' => $pendidik]);
    }

    // Setujui atau tolak + kirim email otomatis
    public function update(Request $request, $id)
    {
        $request->validate([
            'status_verifikasi'  => 'required|in:disetujui,ditolak',
            'catatan_verifikasi' => 'nullable|string',
        ]);

        $pendidik   = Pendidik::findOrFail($id);
        $verifikasi = Verifikasi::where('id_pendidik', $id)->firstOrFail();

        $verifikasi->update([
            'id_tata_usaha'      => $request->user()->id_tata_usaha,
            'status_verifikasi'  => $request->status_verifikasi,
            'catatan_verifikasi' => $request->catatan_verifikasi,
            'tanggal_verifikasi' => now(),
        ]);

        $statusAkun = $request->status_verifikasi === 'disetujui' ? 'aktif' : 'ditolak';
        $pendidik->update(['status_akun' => $statusAkun]);

        if ($request->status_verifikasi === 'disetujui') {
            NotificationService::pendidik(
                $pendidik->id_pendidik,
                'Registrasi Disetujui',
                'Selamat! Akun Anda telah berhasil diverifikasi. Anda sekarang dapat login.',
                'success',
                '/pendidik/profil'
            );
        } else {
            NotificationService::pendidik(
                $pendidik->id_pendidik,
                'Registrasi Ditolak',
                'Maaf, pendaftaran Anda ditolak.' . ($request->catatan_verifikasi ? " Catatan: {$request->catatan_verifikasi}" : ''),
                'error',
                null
            );
        }

        // Kirim email notifikasi
        if ($request->status_verifikasi === 'disetujui') {
            Mail::to($pendidik->email)->send(new VerifikasiDisetujui($pendidik));
        } else {
            Mail::to($pendidik->email)->send(
                new VerifikasiDitolak($pendidik, $request->catatan_verifikasi ?? '-')
            );
        }

        // Buat notifikasi otomatis setelah verifikasi
        Notifikasi::create([
            'id_tata_usaha' => $request->user()->id_tata_usaha,
            'judul'         => $request->status_verifikasi === 'disetujui'
                                ? "Verifikasi Disetujui: {$pendidik->nama}"
                                : "Verifikasi Ditolak: {$pendidik->nama}",
            'pesan'         => $request->status_verifikasi === 'disetujui'
                                ? "Akun {$pendidik->nama} telah berhasil diverifikasi dan diaktifkan."
                                : "Akun {$pendidik->nama} ditolak. Catatan: {$request->catatan_verifikasi}",
            'tipe'          => $request->status_verifikasi === 'disetujui' ? 'success' : 'warning',
            'link'          => '/admin/registrasi',
        ]);
    }

    // Kirim pesan perbaikan data ke email pendaftar
    public function kirimPesan(Request $request, $id)
    {
        $request->validate([
            'pesan' => 'required|string',
        ]);
        NotificationService::pendidik(
            $pendidik->id_pendidik,
            'Pesan dari Admin',
            $request->pesan,
            'warning',
            '/pendidik/dokumen'
        );

        $pendidik = Pendidik::findOrFail($id);

        Mail::to($pendidik->email)->send(
            new PesanPerbaikanData($pendidik, $request->pesan)
        );

        return response()->json(['message' => 'Pesan berhasil dikirim ke email pendaftar']);
    }
}