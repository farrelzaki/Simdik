<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HapusAkunRequest;
use App\Models\Pendidik;
use Illuminate\Http\Request;

class HapusAkunAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = HapusAkunRequest::with('pendidik')
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', 'pending');
        }

        return response()->json($query->paginate(15));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'status'  => 'required|in:disetujui,ditolak',
            'catatan' => 'nullable|string',
        ]);

        $hapusRequest = HapusAkunRequest::with('pendidik')->findOrFail($id);

        $hapusRequest->update([
            'status'          => $request->status,
            'catatan'         => $request->catatan,
            'id_tata_usaha'   => $request->user()->id_tata_usaha,
            'tanggal_review'  => now(),
        ]);

        // Kalau disetujui, hapus akun pendidik
        if ($request->status === 'disetujui') {
            Pendidik::where('id_pendidik', $hapusRequest->id_pendidik)->delete();
        }

        return response()->json(['message' => 'Request berhasil diproses']);
    }
}