// assessment-service/index.js

const express = require('express');
const cors = require('cors');
const db = require('./db.js');
const app = express();
const port = 3004; // Port tetap 3004

app.use(cors());
app.use(express.json());

// ===== [BARU] Endpoint 1: Mengambil Daftar Paket Soal per Kursus =====
// Ini untuk alur "Bank soal -> diklik -> ada pilihan paket2 soalnya"
app.get('/quizzes/by-course/:courseId', (req, res) => {
  const { courseId } = req.params;
  const sql = "SELECT * FROM quizzes WHERE course_id = ?";

  db.query(sql, [courseId], (err, results) => {
    if (err) {
      console.error("Error fetching quizzes:", err);
      return res.status(500).json({ error: err.message });
    }
    // Kirim daftar paket (misal: [Paket 1, Paket 2, Paket 3])
    res.status(200).json(results);
  });
});


// ===== [MODIFIKASI] Endpoint 2: Mengambil Soal DAN DETAIL KUIS =====
// Ini untuk alur "milih soal yg mau dikerjain"
// Kita ubah dari /quiz/:courseId menjadi /quiz/:quizId
app.get('/quiz/:quizId', (req, res) => {
  const { quizId } = req.params;

  // Query 1: Ambil detail kuis (Judul Paket) DAN kursus induknya (Judul Kursus)
  const quizDetailSql = `
    SELECT 
      q.quiz_id,
      q.title AS quizTitle, 
      c.course_id, 
      c.title AS courseTitle 
    FROM quizzes q
    JOIN courses c ON q.course_id = c.course_id
    WHERE q.quiz_id = ?
  `;
  
  // Query 2: Ambil semua pertanyaan
  const questionsSql = "SELECT * FROM questions WHERE quiz_id = ?";
  
  // Query 3: Ambil semua opsi
  const optionsSql = `
    SELECT * FROM question_options 
    WHERE question_id IN (
      SELECT question_id FROM questions WHERE quiz_id = ?
    )`;

  // --- Mulai Rangkaian Query ---

  // 1. Ambil Detail Kuis
  db.query(quizDetailSql, [quizId], (err, quizDetails) => {
    if (err) return res.status(500).json({ error: err.message });
    if (quizDetails.length === 0) return res.status(404).json({ error: "Quiz not found" });

    const quizInfo = quizDetails[0]; // { quizId, quizTitle, course_id, courseTitle }

    // 2. Ambil Soal
    db.query(questionsSql, [quizId], (err, questions) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Jika kuis ada tapi tidak ada soal
      if (questions.length === 0) {
        return res.json({
          quizInfo: quizInfo,
          questions: [] // Kirim array soal kosong
        });
      }

      // 3. Ambil Opsi
      db.query(optionsSql, [quizId], (err, options) => {
        if (err) return res.status(500).json({ error: err.message });

        // Gabungkan data di JavaScript
        const quizData = questions.map(q => {
          const questionOptions = options.filter(o => o.question_id === q.question_id);
          
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

        // Kirim respons gabungan
        res.status(200).json({
          quizInfo: quizInfo,   // Detail kuis (Judul paket, dll)
          questions: quizData // Daftar soal
        });
      });
    });
  });
});


app.listen(port, () => {
  console.log(`Assessment Service (Bank Soal) running on http://localhost:${port}`);
});