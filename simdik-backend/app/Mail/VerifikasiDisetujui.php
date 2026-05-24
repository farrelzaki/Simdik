<?php

namespace App\Mail;

use App\Models\Pendidik;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifikasiDisetujui extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Pendidik $pendidik) {}

    public function build()
    {
        return $this->subject('Akun SIMDIK Anda Telah Diverifikasi')
                    ->view('emails.verifikasi_disetujui');
    }
}