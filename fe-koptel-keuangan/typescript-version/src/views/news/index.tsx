import { useEffect, useState } from 'react';
import { Container, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import Link from 'next/link';
import axios from 'axios';
import { BASE_URL } from 'src/networks/apiServices';

interface NewsItem {
  id: number;
  title: string;
  created_at: string;
}

export default function NewsList() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/news`)
    .then((res) => setNews(res.data));
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
    </Container>
  );
}
