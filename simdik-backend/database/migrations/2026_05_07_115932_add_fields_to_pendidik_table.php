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
        Schema::table('pendidik', function (Blueprint $table) {
            $table->string('foto_profil')->nullable()->after('email');
            $table->string('tempat_lahir')->nullable()->after('alamat');
            $table->date('tanggal_lahir')->nullable()->after('tempat_lahir');
            $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan'])->nullable()->after('tanggal_lahir');
            $table->string('jabatan')->nullable()->after('jenis_kelamin');
            $table->enum('unit_kerja', ['Unit SD', 'Unit SMP', 'Unit SMA', 'Unit SMK', 'Yayasan/Pusat'])->nullable()->after('jabatan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pendidik', function (Blueprint $table) {
            $table->dropColumn([
                'foto_profil', 'tempat_lahir', 'tanggal_lahir',
                'jenis_kelamin', 'jabatan', 'unit_kerja'
            ]);
        });
    }
};
