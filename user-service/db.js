// db.js

const mysql = require('mysql2');

// Konfigurasi koneksi ke database Anda
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'toefl_online_db' // <-- SUDAH DIPERBAIKI (sesuai database Anda)
});

connection.connect(error => {
  if (error) {
    console.error('Error connecting to database:', error);
    return;
  }
  // Nama database di pesan sukses juga diganti
  console.log('Successfully connected to toefl_online_db!');
});

module.exports = connection;