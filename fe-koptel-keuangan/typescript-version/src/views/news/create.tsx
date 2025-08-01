import { useState, FormEvent } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';
import { BASE_URL } from 'src/networks/apiServices';


export default function CreateNews() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await axios.post(`${BASE_URL}/api/news`, { 
    title, 
    content, 
    image_url: '',   
    created_by: 1, 
  });

    alert('Berita berhasil ditambahkan!');
    setTitle('');
    setContent('');
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Tambah Berita</Typography>
      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Judul" value={title} onChange={(e) => setTitle(e.target.value)} required margin="normal" />
        <TextField fullWidth label="Isi Berita" value={content} onChange={(e) => setContent(e.target.value)} required margin="normal" multiline rows={4} />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>Simpan</Button>
      </form>
    </Container>
  );
}
