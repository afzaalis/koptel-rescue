# Gunakan image Node.js resmi
FROM node:18

# Buat direktori kerja di container
WORKDIR /app

# Salin file package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin semua file project ke dalam container
COPY . .

# Expose port yang digunakan oleh Express.js
EXPOSE 3000

# Jalankan aplikasi
CMD ["node", "server.js"]
