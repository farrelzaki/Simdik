<?php

namespace App\Services;

use App\Models\NotifikasiPendidik;
use App\Models\Notifikasi;

class NotificationService
{
    public static function pendidik(int $id_pendidik, string $judul, string $pesan, string $tipe = 'info', ?string $link = null): void
    {
        NotifikasiPendidik::create([
            'id_pendidik' => $id_pendidik,
            'judul'       => $judul,
            'pesan'       => $pesan,
            'tipe'        => $tipe,
            'link'        => $link,
            'dibaca'      => false,
        ]);
    }

    public static function admin(int $id_tata_usaha, string $judul, string $pesan, string $tipe = 'info', ?string $link = null): void
    {
        Notifikasi::create([
            'id_tata_usaha' => $id_tata_usaha,
            'judul'         => $judul,
            'pesan'         => $pesan,
            'tipe'          => $tipe,
            'link'          => $link,
            'dibaca'        => false,
        ]);
    }

    public static function semuaAdmin(string $judul, string $pesan, string $tipe = 'info', ?string $link = null): void
    {
        $admins = \App\Models\TataUsaha::all();
        foreach ($admins as $admin) {
            self::admin($admin->id_tata_usaha, $judul, $pesan, $tipe, $link);
        }
    }

    public static function semuaPendidik(string $judul, string $pesan, string $tipe = 'info', ?string $link = null): void
    {
        $pendidik = \App\Models\Pendidik::where('status_akun', 'aktif')->get();
        foreach ($pendidik as $p) {
            self::pendidik($p->id_pendidik, $judul, $pesan, $tipe, $link);
        }
    }
}