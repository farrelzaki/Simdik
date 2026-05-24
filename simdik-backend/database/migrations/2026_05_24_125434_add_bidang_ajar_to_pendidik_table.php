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
            if (!Schema::hasColumn('pendidik', 'bidang_ajar')) {
                $table->string('bidang_ajar')->nullable()->after('jabatan');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pendidik', function (Blueprint $table) {
            //
        });
    }
};
