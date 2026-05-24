<?php

namespace App\Services;

use App\Models\Pendidik;
use App\Models\Verifikasi;
use Illuminate\Support\Facades\DB;

class LaporanService
{
    // ─── Ambil data berdasarkan konfigurasi ───────────────
    public function buildData(array $config): array
    {
        $query = Pendidik::with(['verifikasi', 'dokumen'])
            ->where('status_akun', 'aktif');

        // Filter rentang waktu
        if (!empty($config['rentang_waktu']['dari'])) {
            $query->whereDate('created_at', '>=', $config['rentang_waktu']['dari']);
        }
        if (!empty($config['rentang_waktu']['sampai'])) {
            $query->whereDate('created_at', '<=', $config['rentang_waktu']['sampai']);
        }

        // Filter status kepegawaian
        if (!empty($config['filter']['status_kepegawaian'])) {
            $query->whereIn('status_kepegawaian', (array) $config['filter']['status_kepegawaian']);
        }

        // Filter pendidikan terakhir
        if (!empty($config['filter']['pendidikan_terakhir'])) {
            $query->whereIn('pendidikan_terakhir', (array) $config['filter']['pendidikan_terakhir']);
        }

        // Urutkan
        $kolomUrut = $config['urutkan']['kolom'] ?? 'nama';
        $arahUrut  = $config['urutkan']['arah'] ?? 'asc';
        $query->orderBy($kolomUrut, $arahUrut);

        $semua = $query->get();

        // Pilih kolom yang ditampilkan
        $kolomTampil = $config['kolom_data'] ?? [
            'nama', 'nik', 'status_kepegawaian', 'pendidikan_terakhir'
        ];

        $data = $semua->map(function ($p) use ($kolomTampil) {
            $row = [];
            foreach ($kolomTampil as $kolom) {
                if ($kolom === 'status_verifikasi') {
                    $row[$kolom] = $p->verifikasi->status_verifikasi ?? '-';
                } elseif ($kolom === 'tanggal_verifikasi') {
                    $row[$kolom] = $p->verifikasi->tanggal_verifikasi
                        ? $p->verifikasi->tanggal_verifikasi->format('d/m/Y')
                        : '-';
                } else {
                    $row[$kolom] = $p->$kolom ?? '-';
                }
            }
            return $row;
        });

        // Ringkasan
        $ringkasan = [
            'total'                  => $semua->count(),
            'per_status_kepegawaian' => $semua->groupBy('status_kepegawaian')
                                              ->map->count(),
            'per_pendidikan'         => $semua->groupBy('pendidikan_terakhir')
                                              ->map->count(),
        ];

        return [
            'data'      => $data,
            'ringkasan' => $ringkasan,
            'kolom'     => $kolomTampil,
        ];
    }

    // ─── Bangun data untuk laporan grafis ─────────────────
    public function buildChartData(array $config): array
    {
        $charts = [];

        foreach ($config['grafik'] as $grafik) {
            $charts[] = $this->buildSingleChart($grafik);
        }

        return $charts;
    }

    private function buildSingleChart(array $grafik): array
    {
        $sumber = $grafik['sumber_data'];

        // Data dasar per sumber
        $rawData = match($sumber) {
            'status_kepegawaian' => Pendidik::where('status_akun', 'aktif')
                ->select('status_kepegawaian as label', DB::raw('count(*) as nilai'))
                ->groupBy('status_kepegawaian')
                ->get(),

            'pendidikan_terakhir' => Pendidik::where('status_akun', 'aktif')
                ->select('pendidikan_terakhir as label', DB::raw('count(*) as nilai'))
                ->groupBy('pendidikan_terakhir')
                ->get(),

            'registrasi_bulanan' => $this->getRegistrasiBulanan($grafik),

            'status_verifikasi' => Verifikasi::select(
                    'status_verifikasi as label',
                    DB::raw('count(*) as nilai')
                )
                ->groupBy('status_verifikasi')
                ->get(),

            default => collect([]),
        };

        // Gabungkan dengan data lain jika ada
        if (!empty($grafik['gabungkan_dengan'])) {
            return $this->buildGroupedChart($grafik, $rawData);
        }

        return [
            'id'     => $grafik['id'],
            'judul'  => $grafik['judul'],
            'tipe'   => $grafik['tipe'],
            'warna'  => $grafik['warna'] ?? $this->defaultColors(),
            'labels' => $rawData->pluck('label'),
            'data'   => $rawData->pluck('nilai'),
        ];
    }

    private function buildGroupedChart(array $grafik, $rawData): array
    {
        $groupBy = $grafik['gabungkan_dengan'];

        // Ambil semua nilai unik untuk group
        $groups = Pendidik::where('status_akun', 'aktif')
            ->select($groupBy)
            ->distinct()
            ->pluck($groupBy);

        // Ambil semua nilai unik untuk label utama
        $labels = Pendidik::where('status_akun', 'aktif')
            ->select($grafik['sumber_data'])
            ->distinct()
            ->pluck($grafik['sumber_data']);

        // Bangun dataset per group
        $datasets = $groups->map(function ($group) use ($grafik, $labels, $groupBy) {
            $data = $labels->map(function ($label) use ($grafik, $group, $groupBy) {
                return Pendidik::where('status_akun', 'aktif')
                    ->where($grafik['sumber_data'], $label)
                    ->where($groupBy, $group)
                    ->count();
            });

            return [
                'label' => $group,
                'data'  => $data,
            ];
        });

        return [
            'id'       => $grafik['id'],
            'judul'    => $grafik['judul'],
            'tipe'     => $grafik['tipe'],
            'labels'   => $labels,
            'datasets' => $datasets,
            'grouped'  => true,
        ];
    }

    private function getRegistrasiBulanan(array $grafik): \Illuminate\Support\Collection
    {
        $dari    = $grafik['rentang_waktu']['dari']    ?? now()->subYear()->format('Y-m-d');
        $sampai  = $grafik['rentang_waktu']['sampai']  ?? now()->format('Y-m-d');

        return Pendidik::select(
                DB::raw("DATE_FORMAT(created_at, '%b %Y') as label"),
                DB::raw('count(*) as nilai')
            )
            ->whereDate('created_at', '>=', $dari)
            ->whereDate('created_at', '<=', $sampai)
            ->groupBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"))
            ->orderBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"))
            ->get();
    }

    private function defaultColors(): array
    {
        return [
            '#4CAF50', '#2196F3', '#FF9800',
            '#F44336', '#9C27B0', '#00BCD4',
        ];
    }

    // ─── Generate PDF ──────────────────────────────────────
    public function generatePDF(\App\Models\Laporan $laporan): string
    {
        $config  = $laporan->konfigurasi;
        $hasil   = $this->buildData($config);

        $pdf = app('dompdf.wrapper');
        $pdf->loadView('laporan.formal', [
            'judul'      => $laporan->judul,
            'tanggal'    => $laporan->tanggal_laporan->format('d F Y'),
            'institusi'  => $config['institusi'] ?? '',
            'kolom'      => $hasil['kolom'],
            'data'       => $hasil['data'],
            'ringkasan'  => $hasil['ringkasan'],
            'config'     => $config,
        ]);

        $fileName = 'laporan_' . $laporan->id_laporan . '_' . time() . '.pdf';
        $filePath = "laporan/{$fileName}";

        \Illuminate\Support\Facades\Storage::put($filePath, $pdf->output());

        return $filePath;
    }
}