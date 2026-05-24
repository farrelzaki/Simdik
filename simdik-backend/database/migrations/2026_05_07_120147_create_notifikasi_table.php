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
        Schema::create('notifikasi', function (Blueprint $table) {
            $table->id('id_notifikasi');
            $table->unsignedBigInteger('id_tata_usaha')->nullable();
            $table->unsignedBigInteger('id_pendidik')->nullable();
            $table->string('judul');
            $table->text('pesan');
            $table->string('tipe')->default('info'); // info, warning, success, error
            $table->string('link')->nullable();
            $table->boolean('dibaca')->default(false);
            $table->timestamps();

            $table->foreign('id_tata_usaha')->references('id_tata_usaha')->on('tata_usaha')->onDelete('cascade');
            $table->foreign('id_pendidik')->references('id_pendidik')->on('pendidik')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifikasi');
    }
};
