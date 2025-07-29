export interface BudgetCode {
  id: string;
  code: string;
  name: string;
  type: 'PRODUCT' | 'REVENUE' | 'EXPENSE';
  category: 'Asset' | 'Operational' | 'Other';
  description?: string;
  created_at: string;
  updated_at: string;
}

// Definisi untuk Kontribusi Produk
export interface ProductContribution {
  id?: string; 
  budget_code_id: string;
  product_name: string;
  month: number;
  year: number;
  contribution_amount: number;
}

// Definisi untuk Target Anggaran Bulanan
export interface BudgetTarget {
  id?: string; 
  budget_code_id: string;
  month: number;
  year: number;
  target_amount: number;
}

// Definisi untuk Data Realisasi/Pengeluaran (menggunakan tabel sales)
export interface RealizationData {
  id?: string; 
  tanggal: string;
  nominal: number;
  jenis_data: 'Realisasi' | 'Expenses';
  produk?: string; 
  nama_pemasukan?: string; 
  catatan?: string;
  nama_penginput?: string;
  budget_code_id?: string; 
}