@extends('layouts.app')

@section('title', 'Profil Pendidik')

@section('content')
    <div class="max-w-2xl mx-auto">
        <h2 class="text-2xl font-bold text-primary mb-6">Profil Saya</h2>
        
        <div class="bg-white rounded-lg shadow p-6">
            <div class="mb-4">
                <label class="block text-sm font-semibold text-slate-600 mb-2">Nama</label>
                <div class="p-3 bg-slate-50 rounded-lg text-slate-700">Pendidik Name</div>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-semibold text-slate-600 mb-2">Email</label>
                <div class="p-3 bg-slate-50 rounded-lg text-slate-700">pendidik@ihsantauhid.sch.id</div>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-semibold text-slate-600 mb-2">Status Akun</label>
                <div class="p-3 bg-green-50 rounded-lg text-green-700 font-semibold">Aktif</div>
            </div>

            <a href="#" class="mt-6 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryHover">
                Edit Profil
            </a>
        </div>
    </div>
@endsection
