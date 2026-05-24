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
        Schema::create('dokumen', function (Blueprint $table) {
            $table->id('id_dokumen');
            $table->unsignedBigInteger('id_pendidik');
            $table->string('data_identitas')->nullable();
            $table->string('data_kualifikasi')->nullable();
            $table->string('data_sertifikasi')->nullable();
            $table->enum('status_kelengkapan', ['lengkap','tidak_lengkap'])->default('tidak_lengkap');
            $table->timestamps();

            $table->foreign('id_pendidik')->references('id_pendidik')->on('pendidik')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dokumen');
    }
};
