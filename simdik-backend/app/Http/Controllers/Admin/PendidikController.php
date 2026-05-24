<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pendidik;
use App\Models\Dokumen;
use App\Models\Verifikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class PendidikController extends Controller
{
    // List semua pendidik aktif
    public function index(Request $request)
    {
        $query = Pendidik::with(['dokumen', 'verifikasi'])
            ->where('status_akun', 'aktif');

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nama', 'like', "%{$request->search}%")
                  ->orWhere('nik', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        // Filter status kepegawaian
        if ($request->filled('status_kepegawaian')) {
            $query->where('status_kepegawaian', $request->status_kepegawaian);
        }

        // Filter pendidikan terakhir
        if ($request->filled('pendidikan_terakhir')) {
            $query->where('pendidikan_terakhir', $request->pendidikan_terakhir);
        }

        $data = $query->orderBy('nama')->paginate(10);

        return response()->json($data);
    }

    // Detail satu pendidik
    public function show($id)
    {
        $pendidik = Pendidik::with(['dokumen', 'verifikasi.tataUsaha'])
            ->findOrFail($id);

        return response()->json(['data' => $pendidik]);
    }

    // Tambah pendidik manual oleh admin
    public function store(Request $request)
    {
        $request->validate([
            'nik'                 => 'required|unique:pendidik,nik',
            'nama'                => 'required|string|max:100',
            'email'               => 'required|email|unique:pendidik,email',
            'password'            => 'required|min:8',
            'no_hp'               => 'nullable|string|max:20',
            'alamat'              => 'nullable|string',
            'pendidikan_terakhir' => 'nullable|string',
            'status_kepegawaian'  => 'required|in:PNS,PPPK,Honorer,GTT',
        ]);

        DB::transaction(function () use ($request) {
            $pendidik = Pendidik::create([
                'nik'                 => $request->nik,
                'nama'                => $request->nama,
                'email'               => $request->email,
                'password'            => Hash::make($request->password),
                'no_hp'               => $request->no_hp,
                'alamat'              => $request->alamat,
                'pendidikan_terakhir' => $request->pendidikan_terakhir,
                'status_kepegawaian'  => $request->status_kepegawaian,
                'status_akun'         => 'aktif', // langsung aktif kalau admin yang buat
            ]);

            Dokumen::create(['id_pendidik' => $pendidik->id_pendidik]);

            Verifikasi::create([
                'id_pendidik'       => $pendidik->id_pendidik,
                'id_tata_usaha'     => $request->user()->id_tata_usaha,
                'status_verifikasi' => 'disetujui',
                'tanggal_verifikasi' => now(),
            ]);
        });

        return response()->json(['message' => 'Pendidik berhasil ditambahkan'], 201);
    }

    // Edit data pendidik
    public function update(Request $request, $id)
    {
        $pendidik = Pendidik::findOrFail($id);

        $request->validate([
            'nik'                 => 'sometimes|unique:pendidik,nik,' . $id . ',id_pendidik',
            'nama'                => 'sometimes|string|max:100',
            'email'               => 'sometimes|email|unique:pendidik,email,' . $id . ',id_pendidik',
            'no_hp'               => 'sometimes|string|max:20',
            'alamat'              => 'sometimes|string',
            'pendidikan_terakhir' => 'sometimes|string',
            'status_kepegawaian'  => 'sometimes|in:PNS,PPPK,Honorer,GTT',
            'password'            => 'sometimes|min:8',
        ]);

        $data = $request->only([
            'nik', 'nama', 'email', 'no_hp',
            'alamat', 'pendidikan_terakhir', 'status_kepegawaian'
        ]);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $pendidik->update($data);

        return response()->json([
            'message' => 'Data pendidik berhasil diperbarui',
            'data'    => $pendidik->fresh(),
        ]);
    }

    // Hapus pendidik
    public function destroy($id)
    {
        $pendidik = Pendidik::findOrFail($id);
        $pendidik->delete();

        return response()->json(['message' => 'Data pendidik berhasil dihapus']);
    }
}