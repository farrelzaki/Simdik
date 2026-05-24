<?php
namespace App\Http\Controllers\Pendidik;

use App\Http\Controllers\Controller;
use App\Models\HapusAkunRequest;
use Illuminate\Http\Request;

class HapusAkunController extends Controller
{
    public function ajukan(Request $request)
    {
        $request->validate(['alasan' => 'nullable|string|max:500']);

        $existing = HapusAkunRequest::where('id_pendidik', $request->user()->id_pendidik)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Sudah ada request penghapusan akun yang pending'], 422);
        }

        HapusAkunRequest::create([
            'id_pendidik' => $request->user()->id_pendidik,
            'alasan'      => $request->alasan,
            'status'      => 'pending',
        ]);

        return response()->json(['message' => 'Request penghapusan akun berhasil diajukan, menunggu verifikasi admin']);
    }
}