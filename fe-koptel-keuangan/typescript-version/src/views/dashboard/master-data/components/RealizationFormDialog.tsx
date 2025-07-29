import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Typography
} from '@mui/material';
import axios from 'axios';
import authConfig from 'src/configs/auth';
import { useAuth } from 'src/hooks/useAuth';

// Import interfaces dari file types terpusat
import { RealizationData, BudgetCode } from 'src/types/budgetTypes';

const BASE_URL = authConfig.meEndpoint.split('/api/auth')[0];

interface RealizationFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: Omit<RealizationData, 'id'>) => void;
  initialData: RealizationData | null;
}

const RealizationFormDialog: React.FC<RealizationFormDialogProps> = ({ open, onClose, onSubmit, initialData }) => {
  const { user } = useAuth();
  const [tanggal, setTanggal] = useState(initialData?.tanggal || new Date().toISOString().split('T')[0]);
  const [nominal, setNominal] = useState(initialData?.nominal || 0);
  const [jenisData, setJenisData] = useState<'Realisasi' | 'Expenses'>(initialData?.jenis_data || 'Realisasi');
  const [produk, setProduk] = useState(initialData?.produk || '');
  const [namaPemasukan, setNamaPemasukan] = useState(initialData?.nama_pemasukan || '');
  const [catatan, setCatatan] = useState(initialData?.catatan || '');
  const [budgetCodeId, setBudgetCodeId] = useState(initialData?.budget_code_id || '');

  // State untuk daftar budget codes yang relevan (opsional, jika ingin dropdown)
  const [budgetCodes, setBudgetCodes] = useState<BudgetCode[]>([]); 
  const [loadingBudgetCodes, setLoadingBudgetCodes] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTanggal(initialData.tanggal);
      setNominal(initialData.nominal);
      setJenisData(initialData.jenis_data);
      setProduk(initialData.produk || '');
      setNamaPemasukan(initialData.nama_pemasukan || '');
      setCatatan(initialData.catatan || '');
      setBudgetCodeId(initialData.budget_code_id || '');
    } else {
      setTanggal(new Date().toISOString().split('T')[0]);
      setNominal(0);
      setJenisData('Realisasi');
      setProduk('');
      setNamaPemasukan('');
      setCatatan('');
      setBudgetCodeId('');
    }
  }, [initialData, open]);

  useEffect(() => {
    const fetchRelevantBudgetCodes = async () => {
      setLoadingBudgetCodes(true);
      try {
        const token = window.localStorage.getItem(authConfig.storageTokenKeyName);
        const revenueCodes = await axios.get(`${BASE_URL}/api/budget/budget-codes?type=REVENUE`, { headers: { Authorization: `Bearer ${token}` } });
        const expenseCodes = await axios.get(`${BASE_URL}/api/budget/budget-codes?type=EXPENSE`, { headers: { Authorization: `Bearer ${token}` } });
        setBudgetCodes([...revenueCodes.data, ...expenseCodes.data]);
      } catch (err) {
        console.error('Error fetching relevant budget codes:', err);
      } finally {
        setLoadingBudgetCodes(false);
      }
    };
    if (open) {
      fetchRelevantBudgetCodes();
    }
  }, [open]);


  const handleSubmit = () => {
    onSubmit({
      tanggal,
      nominal,
      jenis_data: jenisData,
      produk: produk || undefined,
      nama_pemasukan: namaPemasukan || undefined,
      catatan: catatan || undefined,
      nama_penginput: user?.username || undefined,
      budget_code_id: budgetCodeId || undefined
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Edit Data Realisasi/Pengeluaran' : 'Tambah Data Realisasi/Pengeluaran Baru'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          autoFocus
          margin="dense"
          label="Tanggal"
          type="date"
          fullWidth
          variant="outlined"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Nominal"
          type="number"
          fullWidth
          variant="outlined"
          value={nominal}
          onChange={(e) => setNominal(parseFloat(e.target.value) || 0)}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
          <InputLabel>Jenis Data</InputLabel>
          <Select
            value={jenisData}
            label="Jenis Data"
            onChange={(e) => setJenisData(e.target.value as 'Realisasi' | 'Expenses')}
          >
            <MenuItem value="Realisasi">Realisasi (Pendapatan)</MenuItem>
            <MenuItem value="Expenses">Pengeluaran</MenuItem>
          </Select>
        </FormControl>

        {jenisData === 'Realisasi' && (
          <TextField
            margin="dense"
            label="Nama Produk (Opsional)"
            type="text"
            fullWidth
            variant="outlined"
            value={produk}
            onChange={(e) => setProduk(e.target.value)}
            sx={{ mb: 2 }}
          />
        )}

        {jenisData === 'Expenses' && (
          <TextField
            margin="dense"
            label="Nama Pemasukan/Pengeluaran (Opsional)"
            type="text"
            fullWidth
            variant="outlined"
            value={namaPemasukan}
            onChange={(e) => setNamaPemasukan(e.target.value)}
            sx={{ mb: 2 }}
          />
        )}

        <TextField
          margin="dense"
          label="Catatan (Opsional)"
          type="text"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Gunakan Select untuk budget_code_id */}
        <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
          <InputLabel>Kode Anggaran Terkait (Opsional)</InputLabel>
          <Select
            value={budgetCodeId}
            label="Kode Anggaran Terkait (Opsional)"
            onChange={(e) => setBudgetCodeId(e.target.value as string)}
            disabled={loadingBudgetCodes}
          >
            <MenuItem value="">Tidak Ada</MenuItem>
            {budgetCodes
              .filter(bc => {
                if (jenisData === 'Realisasi') return bc.type === 'REVENUE' || bc.type === 'PRODUCT';
                if (jenisData === 'Expenses') return bc.type === 'EXPENSE';
                return false; 
              })
              .map((bc) => (
                <MenuItem key={bc.id} value={bc.id}>
                  {bc.code} - {bc.name} ({bc.type})
                </MenuItem>
              ))}
          </Select>
        </FormControl>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Batal</Button>
        <Button onClick={handleSubmit} variant="contained">
          {initialData ? 'Simpan Perubahan' : 'Tambah'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RealizationFormDialog;
