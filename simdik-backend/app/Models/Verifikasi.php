<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Verifikasi extends Model
{
    protected $primaryKey = 'id_verifikasi';
    protected $table = 'verifikasi';

    protected $fillable = [
        'id_pendidik',
        'id_tata_usaha',
        'status_verifikasi',
        'catatan_verifikasi',
        'tanggal_verifikasi',
    ];

    protected $casts = [
        'tanggal_verifikasi' => 'datetime',
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