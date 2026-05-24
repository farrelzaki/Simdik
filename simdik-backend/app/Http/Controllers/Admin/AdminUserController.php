<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TataUsaha;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => TataUsaha::orderBy('nama')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama'     => 'required|string|max:100',
            'email'    => 'required|email|unique:tata_usaha,email',
            'password' => 'required|min:8',
        ]);

        $admin = TataUsaha::create([
            'nama'     => $request->nama,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Admin berhasil dibuat',
            'data'    => $admin,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $admin = TataUsaha::findOrFail($id);

        $request->validate([
            'nama'     => 'sometimes|string|max:100',
            'email'    => 'sometimes|email|unique:tata_usaha,email,' . $id . ',id_tata_usaha',
            'password' => 'sometimes|min:8',
        ]);

        $data = $request->only(['nama', 'email']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $admin->update($data);

        return response()->json([
            'message' => 'Data admin berhasil diperbarui',
            'data'    => $admin->fresh(),
        ]);
    }

    public function destroy($id)
    {
        // Cegah admin hapus dirinya sendiri
        if ($id == auth()->user()->id_tata_usaha) {
            return response()->json([
                'message' => 'Tidak bisa menghapus akun sendiri'
            ], 403);
        }

        TataUsaha::findOrFail($id)->delete();

        return response()->json(['message' => 'Admin berhasil dihapus']);
    }
}