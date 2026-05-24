<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    // Ambil semua notifikasi admin
    public function index(Request $request)
    {
        $notifikasi = Notifikasi::where('id_tata_usaha', $request->user()->id_tata_usaha)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $belumDibaca = Notifikasi::where('id_tata_usaha', $request->user()->id_tata_usaha)
            ->where('dibaca', false)
            ->count();

        return response()->json([
            'data'         => $notifikasi,
            'belum_dibaca' => $belumDibaca,
        ]);
    }

    // Tandai satu notifikasi sebagai dibaca
    public function tandaiDibaca($id)
    {
        Notifikasi::where('id_notifikasi', $id)->update(['dibaca' => true]);
        return response()->json(['message' => 'Notifikasi ditandai dibaca']);
    }

    // Tandai semua dibaca
    public function tandaiSemuaDibaca(Request $request)
    {
        Notifikasi::where('id_tata_usaha', $request->user()->id_tata_usaha)
            ->update(['dibaca' => true]);
        return response()->json(['message' => 'Semua notifikasi ditandai dibaca']);
    }
}