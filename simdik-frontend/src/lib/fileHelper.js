import api from './axios'

// Encode path ke base64 URL-safe
const encodePath = (path) => {
  if (!path) return ''
  return btoa(unescape(encodeURIComponent(path)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// Ambil ekstensi dari path
const getExtension = (path) => {
  if (!path) return ''
  const match = path.match(/\.([a-zA-Z0-9]+)$/)
  return match ? '.' + match[1] : ''
}

// Cek apakah file adalah gambar
export const isImage = (path) => {
  if (!path) return false
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(path)
}

// Download file dengan nama + ekstensi yang benar
export const downloadFile = async (path, filename = 'dokumen') => {
  if (!path) return
  try {
    const response = await api.get(`/file/${encodePath(path)}`, {
      responseType: 'blob',
    })

    // Cek apakah response adalah JSON error (bukan file)
    const contentType = response.headers['content-type'] || ''
    if (contentType.includes('application/json')) {
      const text = await response.data.text()
      const err = JSON.parse(text)
      alert(`Gagal download: ${err.message || 'File tidak ditemukan'}`)
      return
    }

    // Cek blob tidak kosong
    if (!response.data || response.data.size === 0) {
      alert('File kosong atau tidak ditemukan.')
      return
    }

    const ext = getExtension(path)
    const name = filename.endsWith(ext) ? filename : filename + ext
    const blob = new Blob([response.data], {
      type: contentType || 'application/octet-stream'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Download gagal:', err?.response?.status, path)
    if (err?.response?.status === 404) {
      alert('File tidak ditemukan di server. Mungkin file belum diunggah atau sudah dihapus.')
    } else if (err?.response?.status === 401) {
      alert('Sesi login Anda telah berakhir. Silakan login ulang.')
    } else {
      alert('Gagal mendownload file. Silakan coba lagi.')
    }
  }
}

// Preview file — set blob URL ke state
export const previewFile = async (path, setUrl) => {
  if (!path) return
  try {
    const response = await api.get(`/file/${encodePath(path)}`, {
      responseType: 'blob',
    })
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/octet-stream'
    })
    setUrl(URL.createObjectURL(blob))
  } catch (err) {
    console.error('Preview gagal:', err?.response?.status, path)
  }
}