<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Laporan extends Model
{
    protected $primaryKey = 'id_laporan';
    protected $table = 'laporan';

    protected $fillable = [
        'id_tata_usaha',
        'judul',
        'tipe',
        'konfigurasi',
        'file_path',
        'tanggal_laporan',
    ];

    protected $casts = [
        'konfigurasi'     => 'array',  // otomatis encode/decode JSON
        'tanggal_laporan' => 'date',
    ];

    public function tataUsaha()
    {
        return $this->belongsTo(TataUsaha::class, 'id_tata_usaha');
    }
}