<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class HapusAkunRequest extends Model
{
    protected $table      = 'hapus_akun_request';
    protected $primaryKey = 'id_request';
    protected $fillable   = ['id_pendidik','alasan','status','id_tata_usaha','tanggal_review'];

    public function pendidik()  { return $this->belongsTo(Pendidik::class, 'id_pendidik'); }
    public function tataUsaha() { return $this->belongsTo(TataUsaha::class, 'id_tata_usaha'); }
}