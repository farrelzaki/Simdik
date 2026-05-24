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
        Schema::create('hapus_akun_request', function (Blueprint $table) {
            $table->id('id_request');
            $table->unsignedBigInteger('id_pendidik');
            $table->text('alasan')->nullable();
            $table->enum('status', ['pending','disetujui','ditolak'])->default('pending');
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
        Schema::dropIfExists('hapus_akun_request');
    }
};
