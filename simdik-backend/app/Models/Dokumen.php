<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dokumen extends Model
{
    protected $primaryKey = 'id_dokumen';
    protected $table = 'dokumen';

    protected $fillable = [
        'id_pendidik',
        'data_identitas',
        'data_kualifikasi',
        'data_sertifikasi',
        'status_kelengkapan',
    ];

    public function pendidik()
    {
        return $this->belongsTo(Pendidik::class, 'id_pendidik');
    }
}