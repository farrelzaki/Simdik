<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title') - Yayasan Ihsan Tauhid</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    @stack('css')
</head>
<body class="font-sans bg-slate-50">
    
    @if(session('role') === 'admin')
        <nav class="bg-primary text-white px-6 py-4 shadow-md">
            <div class="flex justify-between items-center">
                <h1 class="font-bold text-lg">Admin Dashboard</h1>
                <div class="flex items-center gap-4">
                    <span>{{ auth('web')->user()->nama ?? 'Admin' }}</span>
                    <form action="{{ route('logout') }}" method="POST" style="display: inline;">
                        @csrf
                        <button type="submit" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded">Logout</button>
                    </form>
                </div>
            </div>
        </nav>
    @else
        <nav class="bg-primary text-white px-6 py-4 shadow-md">
            <div class="flex justify-between items-center">
                <h1 class="font-bold text-lg">Dashboard</h1>
                <div class="flex items-center gap-4">
                    <span>Pendidik</span>
                    <form action="{{ route('logout') }}" method="POST" style="display: inline;">
                        @csrf
                        <button type="submit" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded">Logout</button>
                    </form>
                </div>
            </div>
        </nav>
    @endif

    <div class="p-6">
        @yield('content')
    </div>

    @stack('js')
</body>
</html>
