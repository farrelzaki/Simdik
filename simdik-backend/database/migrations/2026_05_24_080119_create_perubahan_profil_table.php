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
        Schema::create('perubahan_profil', function (Blueprint $table) {
            $table->id('id_perubahan');
            $table->unsignedBigInteger('id_pendidik');
            $table->enum('tipe', ['profil', 'dokumen'])->default('profil');
            $table->json('data_lama');
            $table->json('data_baru');
            $table->enum('status', ['pending', 'disetujui', 'ditolak'])->default('pending');
            $table->text('catatan')->nullable();
            $table->unsignedBigInteger('id_tata_usaha')->nullable();
            $table->timestamp('tanggal_review')->nullable();
            $table->timestamps();

            $table->foreign('id_pendidik')->references('id_pendidik')->on('pendidik')->onDelete('cascade');
            $table->foreign('id_tata_usaha')->references('id_tata_usaha')->on('tata_usaha')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('perubahan_profil');
    }
};
