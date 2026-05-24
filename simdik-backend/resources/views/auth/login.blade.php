<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Yayasan Ihsan Tauhid</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#003F54',
                        primaryHover: '#002d3d',
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    }
                }
            }
        }
    </script>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>

<body class="font-sans min-h-screen flex flex-col items-center justify-center relative" 
      style="background: radial-gradient(circle at top left, #d4e8e9, transparent 50%), radial-gradient(circle at bottom right, #d0e6e3, transparent 50%); background-color: #e2f0f1;">

    <div class="bg-white/90 backdrop-blur-md rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] w-full max-w-[400px] py-10 px-8 z-10 text-center mx-4 relative">
        
        <!-- Logo -->
        <img src="{{ asset('gambar/yayasan-ihsan-tauhid.png') }}" alt="Logo Ihsan Tauhid" class="w-16 h-16 mx-auto mb-4 object-contain" onerror="this.style.display='none'">
        
        <!-- Title -->
        <h4 class="text-primary font-bold text-xl mb-1">Selamat Datang</h4>
        <div class="text-slate-400 text-xs mb-6">Management Information System</div>

        <!-- Alert Messages -->
        @if ($errors->any())
            <div class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                <div class="text-red-800 text-xs font-semibold">
                    @foreach ($errors->all() as $error)
                        <p>{{ $error }}</p>
                    @endforeach
                </div>
            </div>
        @endif

        @if (session('error'))
            <div class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                <div class="text-red-800 text-xs font-semibold">{{ session('error') }}</div>
            </div>
        @endif

        <!-- Toggle Role -->
        <div class="bg-slate-100 rounded-full p-1 flex relative mb-6">
            <div id="toggleBg" class="absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-primary rounded-full transition-transform duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)] z-0"></div>
            
            <div class="role-btn text-white flex-1 text-center py-2 text-xs font-semibold cursor-pointer rounded-full relative z-10 transition-colors duration-300" onclick="setRole('pendidik')">Pendidik/Tendik</div>
            <div class="role-btn text-slate-500 flex-1 text-center py-2 text-xs font-semibold cursor-pointer rounded-full relative z-10 transition-colors duration-300" onclick="setRole('admin')">Admin</div>
        </div>

        <!-- Form -->
        <form action="{{ route('login.post') }}" method="POST" id="loginForm">
            @csrf
            <input type="hidden" name="role" id="inputRole" value="pendidik">

            <!-- Email -->
            <div class="mb-4">
                <label class="block text-xs font-semibold text-slate-600 mb-1 text-left">Email atau Username</label>
                <div class="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-4 focus-within:border-primary transition-colors duration-200">
                    <i class="fa-regular fa-user text-slate-400 text-sm"></i>
                    <input type="text" 
                           name="email" 
                           placeholder="admin@ihsantauhid.sch.id" 
                           class="w-full bg-transparent border-none py-3 px-3 text-sm outline-none text-slate-700 placeholder-slate-300 @error('email') border-red-500 @enderror" 
                           value="{{ old('email') }}"
                           required>
                </div>
                @error('email')
                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Password -->
            <div class="mb-2">
                <label class="block text-xs font-semibold text-slate-600 mb-1 text-left">Password</label>
                <div class="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-4 focus-within:border-primary transition-colors duration-200">
                    <i class="fa-solid fa-lock text-slate-400 text-sm"></i>
                    <input type="password" 
                           id="passwordInput" 
                           name="password" 
                           placeholder="••••••••" 
                           class="w-full bg-transparent border-none py-3 px-3 text-sm outline-none text-slate-700 placeholder-slate-300 @error('password') border-red-500 @enderror" 
                           required>
                    <i class="fa-regular fa-eye text-slate-400 text-sm cursor-pointer hover:text-slate-600" id="togglePasswordIcon" onclick="togglePassword()"></i>
                </div>
                @error('password')
                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Forgot -->
            <a href="{{ route('password.request') }}" class="block text-right text-[11px] text-primary font-semibold hover:underline mt-2 mb-6">Forgot Password?</a>

            <!-- Button Gradient -->
            <button
                type="submit"
                class="group
                       bg-gradient-to-r from-[#0F5C6E] via-[#083F4F] to-[#021E25]
                       hover:from-[#136b80] hover:via-[#0a4a5c] hover:to-[#042a33]
                       text-white rounded-2xl py-3.5 w-full
                       font-medium text-sm
                       flex justify-center items-center gap-2
                       transition-all duration-300
                       shadow-[0_6px_20px_rgba(2,30,37,0.3)]
                       hover:shadow-[0_10px_25px_rgba(2,30,37,0.4)]
                       active:scale-95"
                id="submitBtn"
            >
                <span id="btnText">Sign In</span>
                <i class="fa-solid fa-arrow-right transition-transform duration-300 group-hover:translate-x-1"></i>
            </button>

            <!-- Register -->
            <p class="text-[12px] text-slate-500 mt-4">
                Belum punya akun?
                <a href="{{ route('register') }}" class="text-primary font-semibold hover:underline">
                    Registrasi di sini
                </a>
            </p>
        </form>

        <!-- Help -->
        <div class="text-[11px] text-slate-500 mt-6 mb-2">Butuh bantuan akses?</div>
        <a href="#" class="bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-full px-4 py-1.5 text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors">
            <i class="fa-solid fa-headset"></i> Contact Support
        </a>
    </div>

    <!-- Footer -->
    <div class="absolute bottom-5 w-full text-center text-[10px] font-semibold text-slate-500 tracking-wider">
        © 2024 YAYASAN IHSAN TAUHID
    </div>

    <script>
        function setRole(role) {
            const btns = document.querySelectorAll('.role-btn');
            const bg = document.getElementById('toggleBg');
            const hiddenInput = document.getElementById('inputRole');
            
            btns.forEach(btn => {
                btn.classList.remove('text-white');
                btn.classList.add('text-slate-500');
            });

            if (role === 'pendidik') {
                btns[0].classList.add('text-white');
                btns[0].classList.remove('text-slate-500');
                bg.style.transform = 'translateX(0)';
                hiddenInput.value = 'pendidik';
            } else {
                btns[1].classList.add('text-white');
                btns[1].classList.remove('text-slate-500');
                bg.style.transform = 'translateX(100%)';
                hiddenInput.value = 'admin';
            }
        }

        function togglePassword() {
            const passwordInput = document.getElementById('passwordInput');
            const icon = document.getElementById('togglePasswordIcon');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }

        // Form loading state
        document.getElementById('loginForm').addEventListener('submit', function() {
            const btn = document.getElementById('submitBtn');
            const btnText = document.getElementById('btnText');
            btn.disabled = true;
            btnText.textContent = 'Loading...';
        });
    </script>
</body>
</html>
