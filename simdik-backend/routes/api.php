<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PendidikController;
use App\Http\Controllers\Admin\VerifikasiController;
use App\Http\Controllers\Admin\LaporanController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Pendidik\ProfilController;
use App\Http\Controllers\Admin\NotifikasiController;
use App\Http\Controllers\Admin\PengaturanController;
use App\Http\Controllers\Pendidik\ProfilPerubahanController;
use App\Http\Controllers\Admin\PerubahanProfilController;
use App\Http\Controllers\Pendidik\NotifikasiPendidikController;
use App\Http\Controllers\Pendidik\HapusAkunController;
use App\Http\Controllers\Admin\HapusAkunAdminController;

// ─── Public ───────────────────────────────────────────
Route::post('/auth/login',    [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// ─── Logout (semua role) ──────────────────────────────
Route::middleware('auth:sanctum')->post('/auth/logout', [AuthController::class, 'logout']);

// ─── Pendidik ─────────────────────────────────────────
Route::middleware(['auth:sanctum', 'pendidik_aktif'])->prefix('pendidik')->group(function () {
    Route::get('/profil',             [ProfilController::class, 'show']);
    Route::put('/profil',             [ProfilController::class, 'update']);
    Route::get('/status-verifikasi',  [ProfilController::class, 'statusVerifikasi']);

    // Perubahan profil
    Route::get('/perubahan',          [ProfilPerubahanController::class, 'index']);
    Route::post('/perubahan/profil',  [ProfilPerubahanController::class, 'ajukanPerubahan']);
    Route::post('/perubahan/dokumen', [ProfilPerubahanController::class, 'ajukanDokumen']);
    Route::post('/foto-profil',       [ProfilPerubahanController::class, 'uploadFoto']);
    Route::delete('/foto-profil',     [ProfilPerubahanController::class, 'hapusFoto']);

    // Notifikasi pendidik
    Route::get('/notifikasi',                        [NotifikasiPendidikController::class, 'index']);
    Route::patch('/notifikasi/baca-semua',           [NotifikasiPendidikController::class, 'tandaiSemuaDibaca']);
    Route::patch('/notifikasi/{id}/baca',            [NotifikasiPendidikController::class, 'tandaiDibaca']);

    // Hapus akun
    Route::post('/hapus-akun',        [HapusAkunController::class, 'ajukan']);
});

// ─── Admin ────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'is_admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/registrasi',        [VerifikasiController::class, 'index']);
    Route::get('/registrasi/{id}',   [VerifikasiController::class, 'show']);
    Route::patch('/verifikasi/{id}', [VerifikasiController::class, 'update']);

    Route::apiResource('/pendidik', PendidikController::class);

    Route::get('/laporan/template',      [LaporanController::class, 'templates']);
    Route::post('/laporan/preview',      [LaporanController::class, 'preview']);
    Route::post('/laporan/generate',     [LaporanController::class, 'generate']);
    Route::get('/laporan/riwayat',       [LaporanController::class, 'riwayat']);
    Route::get('/laporan/{id}/download', [LaporanController::class, 'download']);

    Route::apiResource('/admin-users', AdminUserController::class);
    Route::post('/registrasi/{id}/kirim-pesan', [VerifikasiController::class, 'kirimPesan']);
    // Notifikasi
    Route::get('/notifikasi',                    [NotifikasiController::class, 'index']);
    Route::patch('/notifikasi/{id}/baca',        [NotifikasiController::class, 'tandaiDibaca']);
    Route::patch('/notifikasi/baca-semua',       [NotifikasiController::class, 'tandaiSemuaDibaca']);

    // Pengaturan
    Route::post('/pengaturan/ganti-password',    [PengaturanController::class, 'gantiPassword']);
    
    // Review perubahan profil
    Route::get('/perubahan-profil',           [PerubahanProfilController::class, 'index']);
    Route::get('/perubahan-profil/{id}',      [PerubahanProfilController::class, 'show']);
    Route::patch('/perubahan-profil/{id}',    [PerubahanProfilController::class, 'review']);
    Route::get('/hapus-akun-request',        [HapusAkunAdminController::class, 'index']);
    Route::patch('/hapus-akun-request/{id}', [HapusAkunAdminController::class, 'update']);
});