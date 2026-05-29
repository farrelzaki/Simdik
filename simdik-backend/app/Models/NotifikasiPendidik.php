<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotifikasiPendidik extends Model
{
    protected $table      = 'notifikasi_pendidik';
    protected $primaryKey = 'id_notifikasi';

    protected $fillable = [
        'id_pendidik',
        'judul',
        'pesan',
        'tipe',
        'link',
        'dibaca',
    ];

    protected $casts = [
        'dibaca' => 'boolean',
    ];
}