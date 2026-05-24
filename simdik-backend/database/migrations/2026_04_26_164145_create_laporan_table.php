<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('laporan', function (Blueprint $table) {
            $table->id('id_laporan');
            $table->unsignedBigInteger('id_tata_usaha');
            $table->string('judul');
            $table->enum('tipe', ['formal','grafis']);
            $table->json('konfigurasi');
            $table->string('file_path')->nullable();
            $table->date('tanggal_laporan');
            $table->timestamps();

            $table->foreign('id_tata_usaha')->references('id_tata_usaha')->on('tata_usaha')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporan');
    }
};
