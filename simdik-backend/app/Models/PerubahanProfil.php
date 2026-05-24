<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerubahanProfil extends Model
{
    protected $primaryKey = 'id_perubahan';
    protected $table      = 'perubahan_profil';

    protected $fillable = [
        'id_pendidik', 'tipe', 'data_lama',
        'data_baru', 'status', 'catatan',
        'id_tata_usaha', 'tanggal_review',
    ];

    protected $casts = [
        'data_lama'      => 'array',
        'data_baru'      => 'array',
        'tanggal_review' => 'datetime',
    ];

    public function pendidik()
    {
        return $this->belongsTo(Pendidik::class, 'id_pendidik');
    }

    public function tataUsaha()
    {
        return $this->belongsTo(TataUsaha::class, 'id_tata_usaha');
    }
}