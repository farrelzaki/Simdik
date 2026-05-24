<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Pendidik extends Authenticatable
{
    use HasApiTokens;

    protected $primaryKey = 'id_pendidik';
    protected $table = 'pendidik';

    protected $fillable = [
        'nik', 'nama', 'email', 'password',
        'no_hp', 'alamat', 'pendidikan_terakhir',
        'status_kepegawaian', 'status_akun',
        'foto_profil', 'tempat_lahir', 'tanggal_lahir',
        'jenis_kelamin', 'jabatan', 'unit_kerja', 'bidang_ajar',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];
    
    protected $hidden = [
        'password',
    ];

    public function dokumen()
    {
        return $this->hasOne(Dokumen::class, 'id_pendidik');
    }

    public function verifikasi()
    {
        return $this->hasOne(Verifikasi::class, 'id_pendidik');
    }
}