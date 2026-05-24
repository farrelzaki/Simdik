<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Pendidik;
use App\Models\TataUsaha;
use App\Models\Dokumen;
use App\Models\Verifikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    // ─── Show Login Form ──────────────────────────────────
    public function showLogin()
    {
        return view('auth.login');
    }

    // ─── Login ───────────────────────────────────────────
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
            'role' => 'required|in:pendidik,tata_usaha',
        ]);

        if ($request->role === 'tata_usaha') {
            $user = TataUsaha::where('email', $request->email)->first();
        } else {
            $user = Pendidik::where('email', $request->email)->first();
        }

        // Cek user ada dan password cocok
        if (!$user || !Hash::check($request->password, $user->password)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Email atau password salah'
                ], 401);
            }
            return redirect()->route('login')->withInput()->with('error', 'Email atau password salah');
        }

        // Khusus pendidik, cek status akun
        if ($request->role === 'pendidik') {
            if ($user->status_akun === 'pending') {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Akun sedang menunggu verifikasi',
                        'status'  => 'pending',
                        'data'    => $user->load(['dokumen', 'verifikasi']),
                    ], 403);
                }
                return redirect()->route('login')->withInput()->with('error', 'Akun Anda sedang menunggu verifikasi dari admin');
            }

            if ($user->status_akun === 'ditolak') {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message'  => 'Akun ditolak oleh admin',
                        'status'   => 'ditolak',
                        'catatan'  => $user->verifikasi->catatan_verifikasi ?? null,
                    ], 403);
                }
                $catatan = $user->verifikasi->catatan_verifikasi ?? 'Akun Anda ditolak';
                return redirect()->route('login')->withInput()->with('error', $catatan);
            }
        }

        // Hapus token lama, buat token baru (untuk API)
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        // Jika request JSON (API)
        if ($request->expectsJson()) {
            $responseRole = ($request->role === 'tata_usaha') ? 'tata_usaha' : 'pendidik';
            return response()->json([
                'message' => 'Login berhasil',
                'token'   => $token,
                'role'    => $responseRole,
                'user'    => $user,
            ]);
        }

        // Jika request form (web) - use session auth
        Auth::guard('web')->login($user);
        
        if ($request->role === 'tata_usaha') {
            return redirect()->intended(route('admin.dashboard'));
        } else {
            return redirect()->intended(route('pendidik.profil'));
        }
    }

    // ─── Register ─────────────────────────────────────────
    public function register(Request $request)
    {
        $request->validate([
            'nik'                 => 'required|unique:pendidik,nik',
            'nama'                => 'required|string|max:100',
            'email'               => 'required|email|unique:pendidik,email',
            'password'            => 'required|min:8|confirmed',
            'no_hp'               => 'required|string|max:20',
            'alamat'              => 'required|string',
            'pendidikan_terakhir' => 'required|string',
            'status_kepegawaian'  => 'required|in:PNS,PPPK,Honorer,GTT',
            // Field tambahan opsional
            'tempat_lahir'        => 'nullable|string',
            'tanggal_lahir'       => 'nullable|date',
            'jenis_kelamin'       => 'nullable|in:Laki-laki,Perempuan',
            'jabatan'             => 'nullable|string',
            'unit_kerja'          => 'nullable|string',
            'bidang_ajar'         => 'nullable|string',
            // Dokumen
            'file_identitas'      => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'file_kualifikasi'    => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'file_sertifikasi'    => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
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
                'tempat_lahir'        => $request->tempat_lahir,
                'tanggal_lahir'       => $request->tanggal_lahir,
                'jenis_kelamin'       => $request->jenis_kelamin,
                'jabatan'             => $request->jabatan,
                'unit_kerja'          => $request->unit_kerja,
                'bidang_ajar'         => $request->bidang_ajar,
                'status_akun'         => 'pending',
            ]);

            $pathIdentitas   = $request->file('file_identitas')
                                ->store("dokumen/{$pendidik->id_pendidik}", 'local');
            $pathKualifikasi = $request->file('file_kualifikasi')
                                ->store("dokumen/{$pendidik->id_pendidik}", 'local');
            $pathSertifikasi = null;
            if ($request->hasFile('file_sertifikasi')) {
                $pathSertifikasi = $request->file('file_sertifikasi')
                                    ->store("dokumen/{$pendidik->id_pendidik}", 'local');
            }

            Dokumen::create([
                'id_pendidik'        => $pendidik->id_pendidik,
                'data_identitas'     => $pathIdentitas,
                'data_kualifikasi'   => $pathKualifikasi,
                'data_sertifikasi'   => $pathSertifikasi,
                'status_kelengkapan' => 'lengkap',
            ]);

            Verifikasi::create([
                'id_pendidik'       => $pendidik->id_pendidik,
                'status_verifikasi' => 'pending',
            ]);
        });

        return response()->json([
            'message' => 'Registrasi berhasil, silakan tunggu verifikasi dari admin',
        ], 201);
    }

    // ─── Logout ───────────────────────────────────────────
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }
}