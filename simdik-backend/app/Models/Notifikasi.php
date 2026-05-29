<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    protected $primaryKey = 'id_notifikasi';
    protected $table      = 'notifikasi';

    protected $fillable = [
        'id_tata_usaha',
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