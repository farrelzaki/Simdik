<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body        { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
        .header     { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h2  { margin: 0; font-size: 16px; }
        .header p   { margin: 2px 0; font-size: 11px; }
        table       { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th          { background: #2c3e50; color: white; padding: 8px; text-align: left; font-size: 11px; }
        td          { padding: 6px 8px; border-bottom: 1px solid #ddd; font-size: 11px; }
        tr:nth-child(even) { background: #f9f9f9; }
        .ringkasan  { margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 4px; }
        .ringkasan h4 { margin: 0 0 8px 0; }
        .ttd        { margin-top: 40px; text-align: right; }
        .catatan    { margin-top: 20px; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 8px; }
        .label-col  { text-transform: capitalize; }
    </style>
</head>
<body>

    {{-- Header --}}
    <div class="header">
        @if(!empty($institusi))
            <p>{{ $institusi }}</p>
        @endif
        <h2>{{ strtoupper($judul) }}</h2>
        <p>Tanggal: {{ $tanggal }}</p>
    </div>

    {{-- Tabel Data --}}
    <table>
        <thead>
            <tr>
                <th>#</th>
                @foreach($kolom as $k)
                    <th class="label-col">{{ str_replace('_', ' ', $k) }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse($data as $i => $row)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    @foreach($kolom as $k)
                        <td>{{ $row[$k] ?? '-' }}</td>
                    @endforeach
                </tr>
            @empty
                <tr>
                    <td colspan="{{ count($kolom) + 1 }}" style="text-align:center">
                        Tidak ada data
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    {{-- Ringkasan --}}
    @if(!empty($config['tampilkan_ringkasan']))
        <div class="ringkasan">
            <h4>Ringkasan</h4>
            <p>Total Pendidik: <strong>{{ $ringkasan['total'] }}</strong></p>
            <p>Per Status Kepegawaian:</p>
            <ul>
                @foreach($ringkasan['per_status_kepegawaian'] as $status => $jumlah)
                    <li>{{ $status }}: {{ $jumlah }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    {{-- Tanda Tangan --}}
    @if(!empty($config['tampilkan_tanda_tangan']))
        <div class="ttd">
            <p>........................., {{ $tanggal }}</p>
            <br><br><br>
            <p>(_______________________)</p>
            <p>Kepala Tata Usaha</p>
        </div>
    @endif

    {{-- Catatan Kaki --}}
    @if(!empty($config['catatan_kaki']))
        <div class="catatan">{{ $config['catatan_kaki'] }}</div>
    @endif

</body>
</html>