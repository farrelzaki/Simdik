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
        Schema::create('pendidik', function (Blueprint $table) {
            $table->id('id_pendidik');
            $table->string('nik', 20)->unique();
            $table->string('nama');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('no_hp', 20)->nullable();
            $table->text('alamat')->nullable();
            $table->string('pendidikan_terakhir', 50)->nullable();
            $table->enum('status_kepegawaian', ['PNS','PPPK','Honorer','GTT']);
            $table->enum('status_akun', ['pending','aktif','ditolak'])->default('pending');
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pendidik');
    }
};
