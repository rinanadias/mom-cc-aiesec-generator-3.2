/* Pastikan tabel tidak dipaksa menjadi satu blok utuh */
table {
  page-break-inside: auto;
  border-collapse: collapse;
  width: 100%;
}

/* Mencegah baris tabel (row) terpotong di tengah-tengah teks */
tr {
  page-break-inside: avoid;
  page-break-after: auto;
}

/* Mencegah header tabel terpisah sendiri di bawah halaman */
thead {
  display: table-header-group;
}

tfoot {
  display: table-footer-group;
}