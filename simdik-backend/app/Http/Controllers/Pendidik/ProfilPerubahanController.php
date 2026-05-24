<?php

namespace App\Http\Controllers\Pendidik;

use App\Http\Controllers\Controller;
use App\Models\PerubahanProfil;
use App\Models\Pendidik;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfilPerubahanController extends Controller
{
    // Lihat semua request perubahan milik pendidik ini
    public function index(Request $request)
    {
        $perubahan = PerubahanProfil::where('id_pendidik', $request->user()->id_pendidik)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $perubahan]);
    }

    // Ajukan perubahan profil
    public function ajukanPerubahan(Request $request)
    {
        $pendidik = $request->user();

        $request->validate([
            'nama'                => 'sometimes|string|max:100',
            'no_hp'               => 'sometimes|string|max:20',
            'alamat'              => 'sometimes|string',
            'pendidikan_terakhir' => 'sometimes|string',
            'jabatan'             => 'sometimes|string',
            'unit_kerja'          => 'sometimes|string',
            'tempat_lahir'        => 'sometimes|string',
            'tanggal_lahir'       => 'sometimes|date',
            'jenis_kelamin'       => 'sometimes|in:Laki-laki,Perempuan',
        ]);

        $fields   = ['nama','no_hp','alamat','pendidikan_terakhir','jabatan','unit_kerja','tempat_lahir','tanggal_lahir','jenis_kelamin'];
        $dataLama = [];
        $dataBaru = [];

        foreach ($fields as $field) {
            if ($request->has($field) && $request->$field != $pendidik->$field) {
                $dataLama[$field] = $pendidik->$field;
                $dataBaru[$field] = $request->$field;
            }
        }

        if (empty($dataBaru)) {
            return response()->json(['message' => 'Tidak ada perubahan data'], 422);
        }

        // Cek kalau ada request pending sebelumnya
        $existing = PerubahanProfil::where('id_pendidik', $pendidik->id_pendidik)
            ->where('tipe', 'profil')
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Masih ada request perubahan yang sedang menunggu verifikasi'], 422);
        }

        $perubahan = PerubahanProfil::create([
            'id_pendidik' => $pendidik->id_pendidik,
            'tipe'        => 'profil',
            'data_lama'   => $dataLama,
            'data_baru'   => $dataBaru,
            'status'      => 'pending',
        ]);

        return response()->json([
            'message'   => 'Request perubahan profil berhasil diajukan, menunggu verifikasi admin',
            'data'      => $perubahan,
        ], 201);
    }

    // Upload foto profil
    public function uploadFoto(Request $request)
    {
        $request->validate([
            'foto' => 'required|file|mimes:jpg,jpeg,png|max:2048',
        ]);

        $pendidik = $request->user();

        // Hapus foto lama
        if ($pendidik->foto_profil) {
            Storage::delete($pendidik->foto_profil);
        }

        $path = $request->file('foto')->store("foto_profil/{$pendidik->id_pendidik}", 'public');
        $pendidik->update(['foto_profil' => $path]);

        return response()->json([
            'message'   => 'Foto profil berhasil diperbarui',
            'foto_url'  => Storage::url($path),
        ]);
    }

    // Hapus foto profil
    public function hapusFoto(Request $request)
    {
        $pendidik = $request->user();

        if ($pendidik->foto_profil) {
            Storage::delete($pendidik->foto_profil);
            $pendidik->update(['foto_profil' => null]);
        }

        return response()->json(['message' => 'Foto profil berhasil dihapus']);
    }

    // Ajukan update dokumen
    public function ajukanDokumen(Request $request)
    {
        $request->validate([
            'tipe_dokumen' => 'required|in:data_identitas,data_kualifikasi,data_sertifikasi',
            'file'         => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $pendidik = $request->user();
        $dokumen  = $pendidik->dokumen;
        $tipe     = $request->tipe_dokumen;

        $path = $request->file('file')->store("dokumen_perubahan/{$pendidik->id_pendidik}", 'local');

        $perubahan = PerubahanProfil::create([
            'id_pendidik' => $pendidik->id_pendidik,
            'tipe'        => 'dokumen',
            'data_lama'   => [$tipe => $dokumen?->$tipe],
            'data_baru'   => [$tipe => $path],
            'status'      => 'pending',
        ]);

        return response()->json([
            'message' => 'Request update dokumen berhasil diajukan, menunggu verifikasi admin',
            'data'    => $perubahan,
        ], 201);
    }
}