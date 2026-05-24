@extends('layouts.app')

@section('title', 'Dashboard Admin')

@section('content')
    <div class="max-w-6xl mx-auto">
        <h2 class="text-2xl font-bold text-primary mb-6">Admin Dashboard</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white rounded-lg shadow p-6">
                <div class="text-slate-600 text-sm">Pendidik Terdaftar</div>
                <div class="text-3xl font-bold text-primary mt-2">{{ $total_pendidik ?? 0 }}</div>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <div class="text-slate-600 text-sm">Menunggu Verifikasi</div>
                <div class="text-3xl font-bold text-yellow-600 mt-2">{{ $pending_verifikasi ?? 0 }}</div>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <div class="text-slate-600 text-sm">Verifikasi Disetujui</div>
                <div class="text-3xl font-bold text-green-600 mt-2">{{ $approved_verifikasi ?? 0 }}</div>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <div class="text-slate-600 text-sm">Laporan Dibuat</div>
                <div class="text-3xl font-bold text-blue-600 mt-2">{{ $total_laporan ?? 0 }}</div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-bold text-primary mb-4">Menu Cepat</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a href="#" class="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-center">
                    <i class="fa-solid fa-users text-primary text-2xl mb-2"></i>
                    <div class="text-sm font-semibold">Data Pendidik</div>
                </a>
                <a href="#" class="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-center">
                    <i class="fa-solid fa-check-circle text-green-600 text-2xl mb-2"></i>
                    <div class="text-sm font-semibold">Verifikasi</div>
                </a>
                <a href="#" class="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-center">
                    <i class="fa-solid fa-file-pdf text-red-600 text-2xl mb-2"></i>
                    <div class="text-sm font-semibold">Laporan</div>
                </a>
                <a href="#" class="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-center">
                    <i class="fa-solid fa-gear text-slate-600 text-2xl mb-2"></i>
                    <div class="text-sm font-semibold">Pengaturan</div>
                </a>
            </div>
        </div>
    </div>
@endsection
