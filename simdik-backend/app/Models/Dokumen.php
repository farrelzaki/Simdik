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
        'data_tambahan',
        'status_kelengkapan',
    ];

    protected $casts = [
        'data_tambahan' => 'array',
    ];

    public function toArray()
    {
        $array = parent::toArray();
        
        if (isset($array['data_tambahan']) && is_array($array['data_tambahan'])) {
            foreach ($array['data_tambahan'] as $key => $value) {
                $array[$key] = $value;
            }
        }
        
        unset($array['data_tambahan']);
        return $array;
    }

    public function getAttribute($key)
    {
        // Jika field ada di database/fillable, biarkan Laravel yang urus
        if (array_key_exists($key, $this->attributes) || $this->hasGetMutator($key)) {
            return parent::getAttribute($key);
        }

        // Cari di data_tambahan
        $tambahan = parent::getAttribute('data_tambahan');
        if (is_array($tambahan) && array_key_exists($key, $tambahan)) {
            return $tambahan[$key];
        }

        return parent::getAttribute($key);
    }

    public function pendidik()
    {
        return $this->belongsTo(Pendidik::class, 'id_pendidik');
    }
}