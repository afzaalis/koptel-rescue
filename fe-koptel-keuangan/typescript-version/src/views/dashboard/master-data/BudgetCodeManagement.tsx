import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import Plus from 'mdi-material-ui/Plus';
import PencilOutline from 'mdi-material-ui/PencilOutline';
import DeleteOutline from 'mdi-material-ui/DeleteOutline';
import axios from 'axios';
import authConfig from 'src/configs/auth';
import { useAuth } from 'src/hooks/useAuth';

import ProductContributionFormDialog from './components/ProductContributionFormDialog';
import BudgetTargetFormDialog from './components/BudgetTargetFormDialog';
import RealizationFormDialog from './components/RealizationFormDialog';

import { BudgetCode, ProductContribution, BudgetTarget, RealizationData } from '../../../types/budgetTypes';


const BASE_URL = authConfig.meEndpoint.split('/api/auth')[0];

const BudgetCodeManagement: React.FC = () => {
  const { user } = useAuth();
  const [budgetCodes, setBudgetCodes] = useState<BudgetCode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk dialog BudgetCode (Master)
  const [openBudgetCodeForm, setOpenBudgetCodeForm] = useState<boolean>(false);
  const [currentBudgetCode, setCurrentBudgetCode] = useState<BudgetCode | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // State untuk dialog Product Contribution
  const [openProductContributionForm, setOpenProductContributionForm] = useState<boolean>(false);
  const [currentProductContribution, setCurrentProductContribution] = useState<ProductContribution | null>(null);
  const [selectedProductBudgetCode, setSelectedProductBudgetCode] = useState<BudgetCode | null>(null);

  // State untuk dialog Budget Target
  const [openBudgetTargetForm, setOpenBudgetTargetForm] = useState<boolean>(false);
  const [currentBudgetTarget, setCurrentBudgetTarget] = useState<BudgetTarget | null>(null);
  const [selectedTargetBudgetCode, setSelectedTargetBudgetCode] = useState<BudgetCode | null>(null);

  // State untuk dialog Realization
  const [openRealizationForm, setOpenRealizationForm] = useState<boolean>(false);
  const [currentRealization, setCurrentRealization] = useState<RealizationData | null>(null);

  const fetchBudgetCodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = window.localStorage.getItem(authConfig.storageTokenKeyName);
      const response = await axios.get(`${BASE_URL}/api/budget/budget-codes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBudgetCodes(response.data);
    } catch (err: any) {
      console.error('Error fetching budget codes:', err);
      setError(err.response?.data?.message || 'Gagal mengambil data kode anggaran.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetCodes();
  }, []);

  // --- Handlers for Budget Code (Master) ---
  const handleOpenBudgetCodeForm = (budgetCode?: BudgetCode) => {
    setCurrentBudgetCode(budgetCode || null);
    setOpenBudgetCodeForm(true);
  };

  const handleCloseBudgetCodeForm = () => {
    setOpenBudgetCodeForm(false);
    setCurrentBudgetCode(null);
  };

  const handleSubmitBudgetCodeForm = async (formData: Omit<BudgetCode, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const token = window.localStorage.getItem(authConfig.storageTokenKeyName);
      const headers = { Authorization: `Bearer ${token}` };

      if (currentBudgetCode) {
        await axios.put(`${BASE_URL}/api/budget/budget-codes/${currentBudgetCode.id}`, formData, { headers });
        console.log('Budget code updated successfully');
      } else {
        await axios.post(`${BASE_URL}/api/budget/budget-codes`, formData, { headers });
        console.log('Budget code created successfully');
      }
      fetchBudgetCodes();
      handleCloseBudgetCodeForm();
    } catch (err: any) {
      console.error('Error submitting budget code:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan kode anggaran.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudgetCodeClick = (id: string) => {
    setDeleteId(id);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDeleteBudgetCode = async () => {
    if (!deleteId) return;
    setLoading(true);
    setError(null);
    try {
      const token = window.localStorage.getItem(authConfig.storageTokenKeyName);
      await axios.delete(`${BASE_URL}/api/budget/budget-codes/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Budget code deleted successfully');
      fetchBudgetCodes();
    } catch (err: any) {
      console.error('Error deleting budget code:', err);
      setError(err.response?.data?.message || 'Gagal menghapus kode anggaran.');
    } finally {
      setLoading(false);
      setConfirmDeleteOpen(false);
      setDeleteId(null);
    }
  };

  // --- Handlers for Product Contribution ---
  const handleOpenProductContributionForm = (budgetCode: BudgetCode, contribution?: ProductContribution) => {
    setSelectedProductBudgetCode(budgetCode);
    setCurrentProductContribution(contribution || null);
    setOpenProductContributionForm(true);
  };

  const handleCloseProductContributionForm = () => {
    setOpenProductContributionForm(false);
    setCurrentProductContribution(null);
    setSelectedProductBudgetCode(null);
  };

  const handleSubmitProductContributionForm = async (formData: Omit<ProductContribution, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const token = window.localStorage.getItem(authConfig.storageTokenKeyName);
      const headers = { Authorization: `Bearer ${token}` };

      if (currentProductContribution) {
        await axios.put(`${BASE_URL}/api/budget/product-contributions/${currentProductContribution.id}`, formData, { headers });
        console.log('Product contribution updated successfully');
      } else {
        await axios.post(`${BASE_URL}/api/budget/product-contributions`, formData, { headers });
        console.log('Product contribution created successfully');
      }
      // fetchBudgetCodes(); // Refreshing master list might not be necessary here, but good for consistency
      handleCloseProductContributionForm();
      alert('Kontribusi Produk berhasil disimpan! (Perubahan total di dashboard akan terlihat setelah backend mengagregasi data ini.)');
    } catch (err: any) {
      console.error('Error submitting product contribution:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan kontribusi produk.');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers for Budget Target ---
  const handleOpenBudgetTargetForm = (budgetCode: BudgetCode, target?: BudgetTarget) => {
    setSelectedTargetBudgetCode(budgetCode);
    setCurrentBudgetTarget(target || null);
    setOpenBudgetTargetForm(true);
  };

  const handleCloseBudgetTargetForm = () => {
    setOpenBudgetTargetForm(false);
    setCurrentBudgetTarget(null);
    setSelectedTargetBudgetCode(null);
  };

  const handleSubmitBudgetTargetForm = async (formData: Omit<BudgetTarget, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const token = window.localStorage.getItem(authConfig.storageTokenKeyName);
      const headers = { Authorization: `Bearer ${token}` };

      if (currentBudgetTarget) {
        await axios.put(`${BASE_URL}/api/budget/budget-targets/${currentBudgetTarget.id}`, formData, { headers });
        console.log('Budget target updated successfully');
      } else {
        await axios.post(`${BASE_URL}/api/budget/budget-targets`, formData, { headers });
        console.log('Budget target created successfully');
      }
      // fetchBudgetCodes(); // Refreshing master list might not be necessary here
      handleCloseBudgetTargetForm();
      alert('Target Anggaran berhasil disimpan! (Perubahan total di dashboard akan terlihat setelah backend mengagregasi data ini.)');
    } catch (err: any) {
      console.error('Error submitting budget target:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan target anggaran.');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers for Realization ---
  const handleOpenRealizationForm = (realization?: RealizationData) => {
    setCurrentRealization(realization || null);
    setOpenRealizationForm(true);
  };

  const handleCloseRealizationForm = () => {
    setOpenRealizationForm(false);
    setCurrentRealization(null);
  };

  const handleSubmitRealizationForm = async (formData: Omit<RealizationData, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const token = window.localStorage.getItem(authConfig.storageTokenKeyName);
      const headers = { Authorization: `Bearer ${token}` };

      if (currentRealization) {
        await axios.put(`${BASE_URL}/api/budget/realizations/${currentRealization.id}`, formData, { headers });
        console.log('Realization updated successfully');
      } else {
        await axios.post(`${BASE_URL}/api/budget/realizations`, formData, { headers });
        console.log('Realization created successfully');
      }
      // fetchBudgetCodes(); // Not directly related to budget codes, but could refresh if needed
      handleCloseRealizationForm();
      alert('Data Realisasi/Pengeluaran berhasil disimpan! (Perubahan di dashboard akan terlihat secara real-time.)');
    } catch (err: any) {
      console.error('Error submitting realization:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan data realisasi/pengeluaran.');
    } finally {
      setLoading(false);
    }
  };


  // Cek apakah pengguna memiliki role Keuangan atau Admin
  const canManageBudgetCodes = user?.role?.toLowerCase() === 'keuangan' || user?.role?.toLowerCase() === 'admin';
  // Cek apakah pengguna memiliki role Operasional atau Admin
  const canManageProductContributions = user?.role?.toLowerCase() === 'operasional' || user?.role?.toLowerCase() === 'admin';
  // Cek apakah pengguna memiliki role Keuangan atau Admin (untuk realisasi)
  const canManageRealizations = user?.role?.toLowerCase() === 'keuangan' || user?.role?.toLowerCase() === 'admin';


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Memuat Kode Anggaran...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={fetchBudgetCodes} sx={{ mt: 2 }}>Coba Lagi</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 4 }}>
        Manajemen Kode Anggaran
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        {canManageBudgetCodes && (
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => handleOpenBudgetCodeForm()}
          >
            Tambah Kode Anggaran Baru
          </Button>
        )}
        {canManageRealizations && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Plus />}
            onClick={() => handleOpenRealizationForm()}
          >
            Tambah Data Realisasi/Pengeluaran
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kode</TableCell>
              <TableCell>Nama</TableCell>
              <TableCell>Tipe</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell>Deskripsi</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {budgetCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Tidak ada kode anggaran ditemukan.</TableCell>
              </TableRow>
            ) : (
              budgetCodes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell>{code.code}</TableCell>
                  <TableCell>{code.name}</TableCell>
                  <TableCell>{code.type}</TableCell>
                  <TableCell>{code.category}</TableCell>
                  <TableCell>{code.description || '-'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {canManageBudgetCodes && (
                        <>
                          <Button size="small" startIcon={<PencilOutline />} onClick={() => handleOpenBudgetCodeForm(code)}>
                            Edit
                          </Button>
                          <Button size="small" color="error" startIcon={<DeleteOutline />} onClick={() => handleDeleteBudgetCodeClick(code.id)}>
                            Hapus
                          </Button>
                        </>
                      )}
                      {/* Tombol untuk detail input data sesuai tipe */}
                      {code.type === 'PRODUCT' && canManageProductContributions && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenProductContributionForm(code)}
                        >
                          Tambah Kontribusi Produk
                        </Button>
                      )}
                      {(code.type === 'REVENUE' || code.type === 'EXPENSE') && canManageBudgetCodes && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenBudgetTargetForm(code)}
                        >
                          Tambah Target
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Form Dialog Kode Anggaran (Master) */}
      <BudgetCodeFormDialog
        open={openBudgetCodeForm}
        onClose={handleCloseBudgetCodeForm}
        onSubmit={handleSubmitBudgetCodeForm}
        initialData={currentBudgetCode}
      />

      {/* Confirm Delete Dialog Kode Anggaran */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography>Apakah Anda yakin ingin menghapus kode anggaran ini? Tindakan ini tidak dapat dibatalkan.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Batal</Button>
          <Button onClick={handleConfirmDeleteBudgetCode} color="error" variant="contained">
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form Dialog Kontribusi Produk */}
      {selectedProductBudgetCode && (
        <ProductContributionFormDialog
          open={openProductContributionForm}
          onClose={handleCloseProductContributionForm}
          onSubmit={handleSubmitProductContributionForm}
          initialData={currentProductContribution}
          budgetCodeId={selectedProductBudgetCode.id}
          budgetCodeName={selectedProductBudgetCode.name}
        />
      )}

      {/* Form Dialog Target Anggaran */}
      {selectedTargetBudgetCode && (
        <BudgetTargetFormDialog
          open={openBudgetTargetForm}
          onClose={handleCloseBudgetTargetForm}
          onSubmit={handleSubmitBudgetTargetForm}
          initialData={currentBudgetTarget}
          budgetCodeId={selectedTargetBudgetCode.id}
          budgetCodeName={selectedTargetBudgetCode.name}
        />
      )}

      {/* Form Dialog Realisasi/Pengeluaran */}
      <RealizationFormDialog
        open={openRealizationForm}
        onClose={handleCloseRealizationForm}
        onSubmit={handleSubmitRealizationForm}
        initialData={currentRealization}
      />
    </Box>
  );
};

export default BudgetCodeManagement;

// Komponen Dialog untuk Form Kode Anggaran (tetap sama seperti sebelumnya)
interface BudgetCodeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: Omit<BudgetCode, 'id' | 'created_at' | 'updated_at'>) => void;
  initialData: BudgetCode | null;
}

const BudgetCodeFormDialog: React.FC<BudgetCodeFormDialogProps> = ({ open, onClose, onSubmit, initialData }) => {
  const [code, setCode] = useState(initialData?.code || '');
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<'PRODUCT' | 'REVENUE' | 'EXPENSE'>(initialData?.type || 'REVENUE');
  const [category, setCategory] = useState<'Asset' | 'Operational' | 'Other'>(initialData?.category || 'Operational');
  const [description, setDescription] = useState(initialData?.description || '');

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setName(initialData.name);
      setType(initialData.type);
      setCategory(initialData.category);
      setDescription(initialData.description || '');
    } else {
      setCode('');
      setName('');
      setType('REVENUE');
      setCategory('Operational');
      setDescription('');
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    onSubmit({ code, name, type, category, description });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Edit Kode Anggaran' : 'Tambah Kode Anggaran Baru'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          autoFocus
          margin="dense"
          label="Kode Anggaran"
          type="text"
          fullWidth
          variant="outlined"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Nama Anggaran"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
          <InputLabel>Tipe</InputLabel>
          <Select
            value={type}
            label="Tipe"
            onChange={(e) => setType(e.target.value as 'PRODUCT' | 'REVENUE' | 'EXPENSE')}
          >
            <MenuItem value="PRODUCT">Produk</MenuItem>
            <MenuItem value="REVENUE">Pendapatan</MenuItem>
            <MenuItem value="EXPENSE">Pengeluaran</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
          <InputLabel>Kategori</InputLabel>
          <Select
            value={category}
            label="Kategori"
            onChange={(e) => setCategory(e.target.value as 'Asset' | 'Operational' | 'Other')}
          >
            <MenuItem value="Asset">Asset</MenuItem>
            <MenuItem value="Operational">Operasional</MenuItem>
            <MenuItem value="Other">Lain-lain</MenuItem>
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          label="Deskripsi (Opsional)"
          type="text"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
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
