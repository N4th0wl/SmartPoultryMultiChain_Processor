import { useEffect, useState, useMemo } from 'react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import { useToast } from '../components/ToastProvider'
import apiClient from '../services/apiClient'

const defaultForm = {
    idProduksi: '', tujuanPengiriman: '', namaPenerima: '', kontakPenerima: '',
    tanggalKirim: '', jumlahKirim: '', beratKirim: '', metodePengiriman: 'DIANTAR', namaEkspedisi: '', catatan: '',
}

export default function PengirimanPage() {
    const [list, setList] = useState([])
    const [produksiList, setProduksiList] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [form, setForm] = useState(defaultForm)
    const [search, setSearch] = useState('')
    const { showToast } = useToast()

    const loadData = async () => {
        try {
            const [res, prodRes] = await Promise.all([apiClient.get('/pengiriman'), apiClient.get('/produksi')])
            setList(res.data.data)
            setProduksiList(prodRes.data.data)
        } catch { /* */ }
    }

    useEffect(() => { loadData() }, [])

    const filtered = useMemo(() => {
        if (!search.trim()) return list
        const q = search.toLowerCase()
        return list.filter((p) => p.KodePengiriman?.toLowerCase().includes(q) || p.TujuanPengiriman?.toLowerCase().includes(q))
    }, [list, search])

    const handleChange = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await apiClient.post('/pengiriman', form)
            showToast({ title: 'Berhasil', description: 'Pengiriman dicatat.', status: 'success' })
            setForm(defaultForm)
            setIsModalOpen(false)
            loadData()
        } catch (err) {
            showToast({ title: 'Gagal', description: err.response?.data?.message || 'Gagal.', status: 'error' })
        }
    }

    return (
        <div>
            <PageHeader title="Pengiriman" subtitle="Kelola pengiriman produk"
                actions={<button className="sp-btn" onClick={() => setIsModalOpen(true)}>+ Tambah Pengiriman</button>} />

            <div className="sp-card">
                <div className="sp-cardHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
                    <span>Daftar Pengiriman</span>
                    <input className="sp-searchInput" placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 240 }} />
                </div>
                <div className="sp-cardBody" style={{ overflowX: 'auto' }}>
                    <table className="sp-table">
                        <thead><tr><th>Kode</th><th>Produksi</th><th>Tujuan</th><th>Penerima</th><th>Jumlah</th><th>Status</th><th>Tgl Kirim</th></tr></thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((p) => (
                                <tr key={p.IdPengiriman}>
                                    <td><strong>{p.KodePengiriman}</strong></td>
                                    <td>{p.produksi?.KodeProduksi || '-'}</td>
                                    <td>{p.TujuanPengiriman}</td>
                                    <td>{p.NamaPenerima}</td>
                                    <td>{p.JumlahKirim}</td>
                                    <td><span className={`sp-badge ${p.StatusPengiriman === 'SAMPAI' ? 'success' : p.StatusPengiriman === 'DALAM_PERJALANAN' ? 'info' : 'muted'}`}>{p.StatusPengiriman?.replace(/_/g, ' ')}</span></td>
                                    <td>{p.TanggalKirim}</td>
                                </tr>
                            )) : <tr><td colSpan={7} className="sp-empty">Belum ada pengiriman.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Pengiriman" footer={
                <div className="sp-modalActions">
                    <button className="sp-btn secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
                    <button className="sp-btn" type="submit" form="kirim-form">Simpan</button>
                </div>
            }>
                <form id="kirim-form" className="sp-formGrid" onSubmit={handleSubmit}>
                    <label className="sp-field"><span className="sp-label">Produksi *</span>
                        <select className="sp-input" value={form.idProduksi} onChange={handleChange('idProduksi')} required>
                            <option value="">Pilih</option>
                            {produksiList.filter((p) => p.StatusProduksi === 'LULUS_QC').map((p) => (
                                <option key={p.IdProduksi} value={p.IdProduksi}>{p.KodeProduksi} - {p.JenisAyam}</option>
                            ))}
                        </select>
                    </label>
                    <label className="sp-field"><span className="sp-label">Tujuan *</span><input className="sp-input" value={form.tujuanPengiriman} onChange={handleChange('tujuanPengiriman')} required /></label>
                    <label className="sp-field"><span className="sp-label">Nama Penerima *</span><input className="sp-input" value={form.namaPenerima} onChange={handleChange('namaPenerima')} required /></label>
                    <label className="sp-field"><span className="sp-label">Kontak</span><input className="sp-input" value={form.kontakPenerima} onChange={handleChange('kontakPenerima')} /></label>
                    <label className="sp-field"><span className="sp-label">Tanggal Kirim *</span><input className="sp-input" type="date" value={form.tanggalKirim} onChange={handleChange('tanggalKirim')} required /></label>
                    <label className="sp-field"><span className="sp-label">Jumlah *</span><input className="sp-input" type="number" min="1" value={form.jumlahKirim} onChange={handleChange('jumlahKirim')} required /></label>
                    <label className="sp-field"><span className="sp-label">Berat (kg)</span><input className="sp-input" type="number" step="0.01" value={form.beratKirim} onChange={handleChange('beratKirim')} /></label>
                    <label className="sp-field"><span className="sp-label">Metode</span>
                        <select className="sp-input" value={form.metodePengiriman} onChange={handleChange('metodePengiriman')}>
                            <option value="DIANTAR">Diantar</option><option value="DIAMBIL">Diambil</option><option value="EKSPEDISI">Ekspedisi</option>
                        </select>
                    </label>
                </form>
            </Modal>
        </div>
    )
}
