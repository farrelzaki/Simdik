<?php
namespace App\Http\Controllers\Pendidik;

use App\Http\Controllers\Controller;
use App\Models\NotifikasiPendidik;
use Illuminate\Http\Request;

class NotifikasiPendidikController extends Controller
{
    public function index(Request $request)
    {
        $notifikasi = NotifikasiPendidik::where('id_pendidik', $request->user()->id_pendidik)
            ->orderBy('created_at', 'desc')
            ->get();

        $belumDibaca = $notifikasi->where('dibaca', false)->count();

        return response()->json([
            'data'         => $notifikasi,
            'belum_dibaca' => $belumDibaca,
        ]);
    }

    public function tandaiDibaca($id, Request $request)
    {
        NotifikasiPendidik::where('id_notifikasi', $id)
            ->where('id_pendidik', $request->user()->id_pendidik)
            ->update(['dibaca' => true]);

        return response()->json(['message' => 'Notifikasi ditandai dibaca']);
    }

    public function tandaiSemuaDibaca(Request $request)
    {
        NotifikasiPendidik::where('id_pendidik', $request->user()->id_pendidik)
            ->update(['dibaca' => true]);

        return response()->json(['message' => 'Semua notifikasi ditandai dibaca']);
    }
}