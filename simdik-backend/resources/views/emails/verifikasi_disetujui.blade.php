<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
        .container { background: white; padding: 30px; border-radius: 8px; max-width: 500px; margin: auto; }
        .header { background: #2c3e50; color: white; padding: 15px; border-radius: 6px 6px 0 0; text-align: center; }
        .badge { background: #27ae60; color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; }
        .footer { margin-top: 20px; font-size: 11px; color: #999; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h2>SIMDIK</h2></div>
        <div style="padding: 20px;">
            <p>Halo, <strong>{{ $pendidik->nama }}</strong></p>
            <p>Selamat! Akun Anda telah <span class="badge">Diverifikasi</span></p>
            <p>Anda sekarang dapat login ke sistem SIMDIK menggunakan email dan password yang didaftarkan.</p>
            <p>Terima kasih.</p>
        </div>
        <div class="footer">© SIMDIK - Sistem Manajemen Data Pendidik</div>
    </div>
</body>
</html>