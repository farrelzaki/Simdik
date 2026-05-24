<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class TataUsaha extends Authenticatable
{
    use HasApiTokens;

    protected $primaryKey = 'id_tata_usaha';
    protected $table = 'tata_usaha'; // tambahkan ini

    protected $fillable = [
        'nama',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
    ];

    public function laporan()
    {
        return $this->hasMany(Laporan::class, 'id_tata_usaha');
    }

    public function verifikasi()
    {
        return $this->hasMany(Verifikasi::class, 'id_tata_usaha');
    }
}