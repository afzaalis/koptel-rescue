import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import {
  Container,
  TextField,
  Button,
  MenuItem,
  Typography,
  Box,
  Grid,
} from '@mui/material';
import { useAuth } from 'src/hooks/useAuth';
import axios from 'axios';
import { BASE_URL } from 'src/networks/apiServices';

interface NewsItem {
  id: number;
  title: string;
}

// ✅ Buat instance axios supaya BASE_URL otomatis dipakai
const api = axios.create({
  baseURL: BASE_URL,
});

export default function CarouselForm() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [type, setType] = useState('news');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [linkedNewsId, setLinkedNewsId] = useState('');
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch daftar berita untuk pilihan Linked News
  useEffect(() => {
    api.get('/api/news')
      .then((res) => {
        console.log('Fetched news:', res.data);
        setNewsList(res.data);
      })
      .catch((err) => console.error('Fetch news error:', err));
  }, []);

  // ✅ Handle perubahan gambar
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Hanya format JPG atau PNG yang diperbolehkan.');
        return;
      }
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // ✅ Handle submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert('Harap unggah gambar.');
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Upload file gambar
      const formData = new FormData();
      formData.append('file', imageFile);

      const uploadRes = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const imageUrl = uploadRes.data.url;

      // 2️⃣ Simpan data carousel
      await api.post('/api/carrousel', {   // ✅ PAKAI /api/carrousel (double R sesuai BE)
        title,
        description,
        image_url: imageUrl,
        type,
        start_date: startDate || null,
        end_date: endDate || null,
        created_by: user?.user_id || null,
        linked_news_id: linkedNewsId || null,
      });

      alert('Carousel berhasil ditambahkan!');
      setTitle('');
      setDescription('');
      setImageFile(null);
      setPreviewImage(null);
      setType('news');
      setStartDate('');
      setEndDate('');
      setLinkedNewsId('');
    } catch (err) {
      console.error(err);
      alert('Gagal menambahkan carousel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Tambah Carousel Baru
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {/* Judul */}
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          margin="normal"
        />

        {/* Deskripsi */}
        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          margin="normal"
        />

        {/* Upload Gambar */}
        <Button variant="contained" component="label" sx={{ mt: 2 }}>
          Upload Gambar (JPG/PNG)
          <input type="file" hidden accept="image/jpeg,image/png" onChange={handleImageChange} />
        </Button>
        {previewImage && (
          <Box sx={{ mt: 2 }}>
            <img src={previewImage} alt="Preview" style={{ width: '100%', borderRadius: 8 }} />
          </Box>
        )}

        <TextField
          select
          fullWidth
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          margin="normal"
        >
          <MenuItem value="news">News</MenuItem>
          <MenuItem value="promo">Promo</MenuItem>
          <MenuItem value="product">Product</MenuItem>
        </TextField>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <TextField
          select
          fullWidth
          label="Linked News"
          value={linkedNewsId}
          onChange={(e) => setLinkedNewsId(e.target.value)}
          margin="normal"
        >
          <MenuItem value="">Tidak ada</MenuItem>
          {newsList.map((news) => (
            <MenuItem key={news.id} value={news.id}>
              {news.title}
            </MenuItem>
          ))}
        </TextField>

        {/* Tombol Submit */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Simpan Carousel'}
        </Button>
      </Box>
    </Container>
  );
}
