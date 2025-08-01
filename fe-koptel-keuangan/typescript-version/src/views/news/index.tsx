import { useEffect, useState } from 'react';
import { Container, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Grid, Card, CardMedia } from '@mui/material';
import Link from 'next/link';
import axios from 'axios';
import { BASE_URL } from 'src/networks/apiServices';

interface NewsItem {
  id: number;
  title: string;
  created_at: string;
}

interface CarouselItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
}

export default function NewsList() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [carousel, setCarousel] = useState<CarouselItem[]>([]);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/news`)
      .then((res) => setNews(res.data))
      .catch((err) => console.error('Error fetch news:', err));

    axios.get(`${BASE_URL}/api/carrousel`)
      .then((res) => setCarousel(res.data))
      .catch((err) => console.error('Error fetch carousel:', err));
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>News Management</Typography>
      <Link href="/news/create" passHref>
        <Button variant="contained" color="primary">Tambah Berita</Button>
      </Link>
      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Judul</TableCell>
            <TableCell>Dibuat Pada</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {news.map((n) => (
            <TableRow key={n.id}>
              <TableCell>{n.title}</TableCell>
              <TableCell>{new Date(n.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
        Carousel Preview
      </Typography>
      {carousel.length === 0 ? (
        <Typography>Tidak ada carousel tersedia.</Typography>
      ) : (
        <Grid container spacing={2}>
          {carousel.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.image_url}
                  alt={item.title}
                />
                <Typography variant="subtitle1" sx={{ p: 1 }}>
                  {item.title}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
