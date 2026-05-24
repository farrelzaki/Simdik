<?php

namespace App\Mail;

use App\Models\Pendidik;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PesanPerbaikanData extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Pendidik $pendidik,
        public string $pesan
    ) {}

    public function build()
    {
        return $this->subject('Pemberitahuan Perbaikan Data SIMDIK')
                    ->view('emails.pesan_perbaikan');
    }
}