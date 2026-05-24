<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\TataUsaha;

class TataUsahaSeeder extends Seeder
{
    public function run(): void
    {
        TataUsaha::create([
            'nama'     => 'Admin Utama',
            'email'    => 'admin@simdik.com',
            'password' => Hash::make('password123'),
        ]);
    }
}