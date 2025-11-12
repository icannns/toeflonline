// assessment-service/index.js

const express = require('express');
const cors = require('cors');
const db = require('./db.js');
const app = express();
const port = 3004; // Port BARU

app.use(cors());
app.use(express.json());

// Endpoint utama kita: Mengambil kuis berdasarkan ID kursus
app.get('/quiz/:courseId', (req, res) => {
  const { courseId } = req.params;

  // Query 1: Ambil semua pertanyaan
  const questionsSql = "SELECT * FROM questions WHERE course_id = ?";
  
  // Query 2: Ambil semua opsi untuk pertanyaan tersebut
  const optionsSql = `
    SELECT * FROM question_options 
    WHERE question_id IN (
      SELECT question_id FROM questions WHERE course_id = ?
    )`;

  // Jalankan kedua query
  db.query(questionsSql, [courseId], (err, questions) => {
    if (err) return res.status(500).json({ error: err.message });
    if (questions.length === 0) return res.json([]); // Kirim array kosong jika tidak ada soal

    db.query(optionsSql, [courseId], (err, options) => {
      if (err) return res.status(500).json({ error: err.message });

      // Gabungkan data di JavaScript
      const quizData = questions.map(q => {
        // Temukan semua opsi yang cocok dengan question_id
        const questionOptions = options.filter(o => o.question_id === q.question_id);
        
        // Ubah format opsi menjadi { A: 'teks', B: 'teks', ... }
        const optionsMap = {};
        let correctKey = null;
        questionOptions.forEach((opt, index) => {
          const key = String.fromCharCode(65 + index); // A, B, C, D
          optionsMap[key] = opt.option_text;
          if (opt.is_correct) {
            correctKey = key;
          }
        });

        return {
          id: q.question_id,
          text: q.question_text,
          options: optionsMap,
          correct: correctKey
        };
      });

      res.status(200).json(quizData);
    });
  });
});

app.listen(port, () => {
  console.log(`Assessment Service (Bank Soal) running on http://localhost:${port}`);
});