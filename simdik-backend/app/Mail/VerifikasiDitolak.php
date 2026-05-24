<?php

namespace App\Mail;

use App\Models\Pendidik;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifikasiDitolak extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Pendidik $pendidik,
        public string $catatan
    ) {}

    public function build()
    {
        return $this->subject('Status Pendaftaran SIMDIK Anda')
                    ->view('emails.verifikasi_ditolak');
    }
}