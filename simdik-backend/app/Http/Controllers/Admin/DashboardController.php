<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pendidik;
use App\Models\Verifikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Statistik utama
        $totalPendidik        = Pendidik::count();
        $totalPending         = Pendidik::where('status_akun', 'pending')->count();
        $totalAktif           = Pendidik::where('status_akun', 'aktif')->count();
        $totalDitolak         = Pendidik::where('status_akun', 'ditolak')->count();

        // Sebaran status kepegawaian
        $sebaranKepegawaian = Pendidik::where('status_akun', 'aktif')
            ->select('status_kepegawaian', DB::raw('count(*) as jumlah'))
            ->groupBy('status_kepegawaian')
            ->get();

        // Sebaran pendidikan terakhir
        $sebaranPendidikan = Pendidik::where('status_akun', 'aktif')
            ->select('pendidikan_terakhir', DB::raw('count(*) as jumlah'))
            ->groupBy('pendidikan_terakhir')
            ->get();

        // Tren registrasi 6 bulan terakhir
        $trenRegistrasi = Pendidik::select(
                DB::raw('MONTH(created_at) as bulan'),
                DB::raw('YEAR(created_at) as tahun'),
                DB::raw('count(*) as jumlah')
            )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('tahun', 'bulan')
            ->orderBy('tahun')
            ->orderBy('bulan')
            ->get();

        // Pendaftar terbaru (5 terakhir)
        $pendaftarTerbaru = Pendidik::with('verifikasi')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'statistik' => [
                'total_pendidik'  => $totalPendidik,
                'total_pending'   => $totalPending,
                'total_aktif'     => $totalAktif,
                'total_ditolak'   => $totalDitolak,
            ],
            'sebaran_kepegawaian' => $sebaranKepegawaian,
            'sebaran_pendidikan'  => $sebaranPendidikan,
            'tren_registrasi'     => $trenRegistrasi,
            'pendaftar_terbaru'   => $pendaftarTerbaru,
        ]);
    }
}