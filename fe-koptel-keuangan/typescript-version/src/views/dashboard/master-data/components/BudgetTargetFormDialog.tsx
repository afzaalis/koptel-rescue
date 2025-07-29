// src/views/dashboard/master-data/components/BudgetTargetFormDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Typography
} from '@mui/material';
import axios from 'axios';
import authConfig from 'src/configs/auth';

// Import interfaces dari file types terpusat
import { BudgetTarget } from 'src/types/budgetTypes';

const BASE_URL = authConfig.meEndpoint.split('/api/auth')[0];

interface BudgetTargetFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: Omit<BudgetTarget, 'id'>) => void;
  initialData: BudgetTarget | null;
  budgetCodeId: string; // ID dari budget_code_id yang dipilih (harus tipe REVENUE/EXPENSE)
  budgetCodeName: string; // Nama dari budget_code yang dipilih
}

const BudgetTargetFormDialog: React.FC<BudgetTargetFormDialogProps> = ({
  open, onClose, onSubmit, initialData, budgetCodeId, budgetCodeName
}) => {
  const [month, setMonth] = useState(initialData?.month || new Date().getMonth() + 1);
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear());
  const [targetAmount, setTargetAmount] = useState(initialData?.target_amount || 0);

  useEffect(() => {
    if (initialData) {
      setMonth(initialData.month);
      setYear(initialData.year);
      setTargetAmount(initialData.target_amount);
    } else {
      setMonth(new Date().getMonth() + 1);
      setYear(new Date().getFullYear());
      setTargetAmount(0);
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    onSubmit({
      budget_code_id: budgetCodeId,
      month,
      year,
      target_amount: targetAmount
    });
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString('id-ID', { month: 'long' })
  }));
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i); // Current year +/- 2

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Edit Target Anggaran' : 'Tambah Target Anggaran Baru'}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Untuk Kode Anggaran: **{budgetCodeName}**
        </Typography>
        <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
          <InputLabel>Bulan</InputLabel>
          <Select value={month} label="Bulan" onChange={(e) => setMonth(e.target.value as number)}>
            {months.map((m) => (
              <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
          <InputLabel>Tahun</InputLabel>
          <Select value={year} label="Tahun" onChange={(e) => setYear(e.target.value as number)}>
            {years.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          label="Jumlah Target"
          type="number"
          fullWidth
          variant="outlined"
          value={targetAmount}
          onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)}
          sx={{ mb: 2 }}
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

export default BudgetTargetFormDialog;
