import { useState, useEffect, FormEvent } from 'react';
import {
  Container,
  TextField,
  Button,
  MenuItem,
  Typography,
  Box,
  Grid,
} from '@mui/material';
import axios from 'axios';

interface NewsItem {
  id: number;
  title: string;
}

export default function CarouselForm() {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [type, setType] = useState<string>('news');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [linkedNewsId, setLinkedNewsId] = useState<string>('');
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch daftar berita untuk dropdown linked_news_id
  useEffect(() => {
    axios
      .get<NewsItem[]>('/api/news')
      .then((res) => setNewsList(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/carousel', {
        title,
        description,
        image_url: imageUrl,
        type,
        start_date: startDate || null,
        end_date: endDate || null,
        created_by: 1, // sementara hardcode user_id admin
        linked_news_id: linkedNewsId || null,
      });

      alert('Carousel berhasil ditambahkan!');
      // Reset form
      setTitle('');
      setDescription('');
      setImageUrl('');
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
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          margin="normal"
        />

        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
          margin="normal"
        />

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
