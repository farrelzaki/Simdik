<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Laporan;
use App\Services\LaporanService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LaporanController extends Controller
{
    public function __construct(protected LaporanService $service) {}

    // Preview data sebelum generate
    public function preview(Request $request)
    {
        $request->validate([
            'konfigurasi' => 'required|array',
        ]);

        $hasil = $this->service->buildData($request->konfigurasi);

        return response()->json($hasil);
    }

    // Generate laporan
    public function generate(Request $request)
    {
        $request->validate([
            'judul'        => 'required|string',
            'tipe'         => 'required|in:formal,grafis',
            'konfigurasi'  => 'required|array',
        ]);

        $laporan = Laporan::create([
            'id_tata_usaha'   => $request->user()->id_tata_usaha,
            'judul'           => $request->judul,
            'tipe'            => $request->tipe,
            'konfigurasi'     => $request->konfigurasi,
            'tanggal_laporan' => now(),
        ]);

        if ($request->tipe === 'formal') {
            $filePath = $this->service->generatePDF($laporan);
            $laporan->update(['file_path' => $filePath]);

            return response()->download(
                Storage::path($filePath),
                $laporan->judul . '.pdf'
            );
        }

        // Laporan grafis → return data chart ke frontend
        $chartData = $this->service->buildChartData($laporan->konfigurasi);

        return response()->json([
            'laporan'    => $laporan,
            'chart_data' => $chartData,
        ]);
    }

    // Riwayat laporan
    public function riwayat(Request $request)
    {
        $data = Laporan::with('tataUsaha')
            ->where('id_tata_usaha', $request->user()->id_tata_usaha)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($data);
    }

    // Download laporan lama
    public function download($id)
    {
        $laporan = Laporan::findOrFail($id);

        if (!$laporan->file_path || !Storage::exists($laporan->file_path)) {
            return response()->json(['message' => 'File tidak ditemukan'], 404);
        }

        return response()->download(
            Storage::path($laporan->file_path),
            $laporan->judul . '.pdf'
        );
    }

    // Template laporan siap pakai
    public function templates()
    {
        return response()->json([
            'templates' => [
                [
                    'id'          => 'tmpl_rekap_semua',
                    'nama'        => 'Rekap Semua Pendidik',
                    'deskripsi'   => 'Laporan lengkap seluruh pendidik aktif',
                    'tipe'        => 'formal',
                    'konfigurasi' => [
                        'kolom_data'           => ['nama','nik','status_kepegawaian','pendidikan_terakhir','no_hp'],
                        'filter'               => [],
                        'urutkan'              => ['kolom' => 'nama', 'arah' => 'asc'],
                        'tampilkan_ringkasan'  => true,
                        'tampilkan_tanda_tangan' => true,
                        'catatan_kaki'         => 'Dicetak oleh sistem SIMDIK',
                    ],
                ],
                [
                    'id'          => 'tmpl_pns_saja',
                    'nama'        => 'Rekap Pendidik PNS',
                    'deskripsi'   => 'Laporan khusus pendidik berstatus PNS',
                    'tipe'        => 'formal',
                    'konfigurasi' => [
                        'kolom_data'           => ['nama','nik','pendidikan_terakhir','no_hp','alamat'],
                        'filter'               => ['status_kepegawaian' => ['PNS']],
                        'urutkan'              => ['kolom' => 'nama', 'arah' => 'asc'],
                        'tampilkan_ringkasan'  => true,
                        'tampilkan_tanda_tangan' => true,
                        'catatan_kaki'         => 'Dicetak oleh sistem SIMDIK',
                    ],
                ],
                [
                    'id'          => 'tmpl_grafik_kepegawaian',
                    'nama'        => 'Grafik Sebaran Kepegawaian',
                    'deskripsi'   => 'Visualisasi sebaran status kepegawaian',
                    'tipe'        => 'grafis',
                    'konfigurasi' => [
                        'grafik' => [
                            [
                                'id'           => 'chart_1',
                                'tipe'         => 'pie',
                                'judul'        => 'Sebaran Status Kepegawaian',
                                'sumber_data'  => 'status_kepegawaian',
                            ],
                            [
                                'id'           => 'chart_2',
                                'tipe'         => 'bar',
                                'judul'        => 'Jumlah per Pendidikan Terakhir',
                                'sumber_data'  => 'pendidikan_terakhir',
                            ],
                        ],
                    ],
                ],
                [
                    'id'          => 'tmpl_tren_registrasi',
                    'nama'        => 'Tren Registrasi Bulanan',
                    'deskripsi'   => 'Grafik jumlah pendaftar per bulan',
                    'tipe'        => 'grafis',
                    'konfigurasi' => [
                        'grafik' => [
                            [
                                'id'          => 'chart_1',
                                'tipe'        => 'line',
                                'judul'       => 'Tren Registrasi',
                                'sumber_data' => 'registrasi_bulanan',
                                'rentang_waktu' => [
                                    'dari'    => now()->subYear()->format('Y-m-d'),
                                    'sampai'  => now()->format('Y-m-d'),
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ]);
    }
}