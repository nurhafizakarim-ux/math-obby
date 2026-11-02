import { Question } from '../types/game';

export const EXACT_QUESTIONS: Question[] = [
  // ========================================================
  // SP 4.4.1 — Nisbah tiga kuantiti (Soalan 1 - 4)
  // ========================================================
  {
    id: 1,
    spCode: 'SP 4.4.1',
    topic: 'Nisbah Tiga Kuantiti',
    question: 'Nisbah bilangan epal kepada oren ialah 2 : 3. Nisbah oren kepada mangga ialah 6 : 5. Apakah nisbah epal kepada oren kepada mangga?',
    options: ['2 : 6 : 5', '4 : 6 : 5', '4 : 3 : 5'],
    correctIndex: 1, // B
    explanation: 'Nisbah epal : oren = 2 : 3 = 4 : 6. Nisbah oren : mangga = 6 : 5. Menyamakan nilai sepunya oren (6): nisbah epal : oren : mangga = 4 : 6 : 5.'
  },
  {
    id: 2,
    spCode: 'SP 4.4.1',
    topic: 'Nisbah Tiga Kuantiti',
    question: 'Nisbah bilangan buku Amir kepada Bala ialah 3 : 4. Nisbah bilangan buku Bala kepada Chong ialah 2 : 5. Apakah nisbah buku Amir kepada Bala kepada Chong?',
    options: ['3 : 2 : 5', '6 : 4 : 10', '3 : 4 : 10'],
    correctIndex: 2, // C
    explanation: 'Nisbah Bala : Chong = 2 : 5 = 4 : 10. Nilai sepunya Bala disamakan kepada 4. Maka nisbah Amir : Bala : Chong = 3 : 4 : 10.'
  },
  {
    id: 3,
    spCode: 'SP 4.4.1',
    topic: 'Nisbah Tiga Kuantiti',
    question: 'Nisbah guli merah kepada guli biru ialah 5 : 2. Nisbah guli biru kepada guli hijau ialah 6 : 7. Apakah nisbah guli merah kepada biru kepada hijau?',
    options: ['15 : 6 : 7', '5 : 6 : 7', '15 : 2 : 7'],
    correctIndex: 0, // A
    explanation: 'Samakan guli biru kepada 6: darabkan nisbah merah : biru dengan 3 (5×3 : 2×3 = 15 : 6). Jadi nisbah merah : biru : hijau = 15 : 6 : 7.'
  },
  {
    id: 4,
    spCode: 'SP 4.4.1',
    topic: 'Nisbah Tiga Kuantiti',
    question: 'Nisbah bilangan murid lelaki kepada murid perempuan ialah 4 : 7. Nisbah murid lelaki kepada murid yang menyertai kelab sukan ialah 2 : 3. Apakah nisbah lelaki : perempuan : ahli kelab sukan?',
    options: ['4 : 7 : 3', '4 : 7 : 6', '2 : 7 : 3'],
    correctIndex: 1, // B
    explanation: 'Samakan bahagian murid lelaki kepada 4: darabkan nisbah lelaki : kelab sukan dengan 2 (2×2 : 3×2 = 4 : 6). Maka nisbah lelaki : perempuan : ahli kelab sukan = 4 : 7 : 6.'
  },

  // ========================================================
  // SP 4.4.2 — Menentukan nisbah atau nilai kuantiti (Soalan 5 - 8)
  // ========================================================
  {
    id: 5,
    spCode: 'SP 4.4.2',
    topic: 'Menentukan Nilai Kuantiti',
    question: 'Nisbah wang Amir kepada Bala ialah 4 : 7. Jika Amir mempunyai RM20, berapakah jumlah wang mereka?',
    options: ['RM35', 'RM55', 'RM60'],
    correctIndex: 1, // B
    explanation: 'Amir = 4 bahagian = RM20. 1 bahagian = RM20 ÷ 4 = RM5. Jumlah bahagian = 4 + 7 = 11 bahagian. Jumlah wang = 11 × RM5 = RM55.'
  },
  {
    id: 6,
    spCode: 'SP 4.4.2',
    topic: 'Menentukan Bilangan Objek',
    question: 'Nisbah guli merah kepada biru kepada hijau ialah 2 : 3 : 4. Jika jumlah guli ialah 45 biji, berapakah bilangan guli biru?',
    options: ['10 biji', '15 biji', '20 biji'],
    correctIndex: 1, // B
    explanation: 'Jumlah bahagian = 2 + 3 + 4 = 9 bahagian. 1 bahagian = 45 ÷ 9 = 5 biji. Bilangan guli biru = 3 bahagian × 5 = 15 biji.'
  },
  {
    id: 7,
    spCode: 'SP 4.4.2',
    topic: 'Menentukan Jumlah Kuantiti Ternakan',
    question: 'Nisbah bilangan ayam kepada itik ialah 7 : 4. Jika terdapat 28 ekor itik, berapakah jumlah ayam dan itik?',
    options: ['49 ekor', '77 ekor', '84 ekor'],
    correctIndex: 1, // B
    explanation: 'Itik = 4 bahagian = 28 ekor. 1 bahagian = 28 ÷ 4 = 7 ekor. Jumlah bahagian = 7 + 4 = 11 bahagian. Jumlah ayam dan itik = 11 × 7 = 77 ekor.'
  },
  {
    id: 8,
    spCode: 'SP 4.4.2',
    topic: 'Menentukan Bilangan Murid',
    question: 'Nisbah murid lelaki kepada murid perempuan dalam sebuah kelas ialah 3 : 5. Jika terdapat 15 orang murid lelaki, berapakah bilangan murid perempuan?',
    options: ['20 orang', '25 orang', '30 orang'],
    correctIndex: 1, // B
    explanation: 'Lelaki = 3 bahagian = 15 orang. 1 bahagian = 15 ÷ 3 = 5 orang. Bilangan murid perempuan = 5 bahagian × 5 = 25 orang.'
  },

  // ========================================================
  // SP 4.4.3 — Menentukan nilai berkaitan kadar (Soalan 9 - 12)
  // ========================================================
  {
    id: 9,
    spCode: 'SP 4.4.3',
    topic: 'Kadar Penggunaan Petrol',
    question: 'Sebuah kereta bergerak sejauh 60 km menggunakan 5 liter petrol. Jika kadar penggunaan petrol adalah sama, berapakah jarak yang boleh ditempuh menggunakan 15 liter petrol?',
    options: ['120 km', '150 km', '180 km'],
    correctIndex: 2, // C
    explanation: 'Kadar perjalanan = 60 km ÷ 5 liter = 12 km/liter. Dengan 15 liter: 12 km/liter × 15 liter = 180 km.'
  },
  {
    id: 10,
    spCode: 'SP 4.4.3',
    topic: 'Kadar Harga Buku',
    question: 'Harga 4 buah buku ialah RM28. Berapakah harga 7 buah buku yang sama?',
    options: ['RM42', 'RM49', 'RM56'],
    correctIndex: 1, // B
    explanation: 'Harga 1 buah buku = RM28 ÷ 4 = RM7. Harga 7 buah buku = 7 × RM7 = RM49.'
  },
  {
    id: 11,
    spCode: 'SP 4.4.3',
    topic: 'Kadar Harga Pen',
    question: 'Harga 3 batang pen ialah RM6. Berapakah harga 10 batang pen yang sama?',
    options: ['RM12', 'RM20', 'RM24'],
    correctIndex: 1, // B
    explanation: 'Harga 1 batang pen = RM6 ÷ 3 = RM2. Harga 10 batang pen = 10 × RM2 = RM20.'
  },
  {
    id: 12,
    spCode: 'SP 4.4.3',
    topic: 'Kadar Penghasilan Mesin',
    question: 'Sebuah mesin menghasilkan 24 botol minuman dalam masa 3 minit. Jika mesin berfungsi pada kadar yang sama, berapakah botol yang dihasilkan dalam masa 5 minit?',
    options: ['30 botol', '36 botol', '40 botol'],
    correctIndex: 2, // C
    explanation: 'Kadar penghasilan = 24 botol ÷ 3 minit = 8 botol/minit. Dalam masa 5 minit = 8 botol/minit × 5 minit = 40 botol.'
  },

  // ========================================================
  // SP 4.4.4 — Penyelesaian masalah nisbah, kadar, kadaran dan anggaran (Soalan 13 - 16)
  // ========================================================
  {
    id: 13,
    spCode: 'SP 4.4.4',
    topic: 'Kadaran Ramuan Kek Cawan',
    question: 'Dua cawan tepung diperlukan untuk membuat 8 biji kek cawan. Berapakah cawan tepung yang diperlukan untuk membuat 20 biji kek cawan pada kadar yang sama?',
    options: ['4 cawan', '5 cawan', '6 cawan'],
    correctIndex: 1, // B
    explanation: 'Kadar tepung = 2 cawan ÷ 8 biji = 0.25 cawan/biji. Untuk 20 biji kek cawan = 20 × 0.25 = 5 cawan tepung.'
  },
  {
    id: 14,
    spCode: 'SP 4.4.4',
    topic: 'Penyelesaian Masalah Ahli Kelab',
    question: 'Nisbah bilangan ahli Kelab Matematik kepada Kelab Sains ialah 5 : 3. Jika jumlah ahli kedua-dua kelab ialah 64 orang, berapakah bilangan ahli Kelab Matematik?',
    options: ['24 orang', '32 orang', '40 orang'],
    correctIndex: 2, // C
    explanation: 'Jumlah bahagian = 5 + 3 = 8 bahagian. 1 bahagian = 64 ÷ 8 = 8 orang. Ahli Kelab Matematik = 5 bahagian × 8 = 40 orang.'
  },
  {
    id: 15,
    spCode: 'SP 4.4.4',
    topic: 'Pengiraan Baki Wang & Harga',
    question: 'Ali mempunyai bajet RM120 untuk membeli buku nota. Setiap buku nota berharga RM8. Jika Ali membeli 12 buah buku nota, berapakah baki wangnya?',
    options: ['RM16', 'RM24', 'RM32'],
    correctIndex: 1, // B
    explanation: 'Jumlah bayaran 12 buku nota = 12 × RM8 = RM96. Baki wang Ali = RM120 - RM96 = RM24.'
  },
  {
    id: 16,
    spCode: 'SP 4.4.4',
    topic: 'Pengiraan Diskaun Peratusan',
    question: 'Harga asal sebuah beg ialah RM150. Kedai menawarkan diskaun sebanyak 20%. Berapakah harga beg selepas diskaun?',
    options: ['RM100', 'RM120', 'RM130'],
    correctIndex: 1, // B
    explanation: 'Jumlah diskaun 20% = 20/100 × RM150 = RM30. Harga beg selepas diskaun = RM150 - RM30 = RM120.'
  }
];

export const SP_DETAILS = {
  'SP 4.4.1': {
    title: 'Pusingan 1 — Math Security Gate',
    skill: 'Menentukan nisbah tiga kuantiti apabila dua atau lebih nisbah dua kuantiti diberi',
    zoneName: 'Fasiliti Sekuriti Futuristik',
    badgeColor: 'bg-emerald-500',
    accentColor: '#10B981',
    startQuestionIndex: 0 // Q 1..4 (indices 0..3)
  },
  'SP 4.4.2': {
    title: 'Pusingan 2 — Math Construction Bridge',
    skill: 'Menentukan nisbah atau nilai berkaitan berdasarkan nisbah kuantiti yang diberi',
    zoneName: 'Jambatan Pembinaan Skyscraper',
    badgeColor: 'bg-sky-500',
    accentColor: '#0EA5E9',
    startQuestionIndex: 4 // Q 5..8 (indices 4..7)
  },
  'SP 4.4.3': {
    title: 'Pusingan 3 — Math Factory',
    skill: 'Menentukan nilai yang berkaitan dengan suatu kadar',
    zoneName: 'Kilang Jentera & Konveyor',
    badgeColor: 'bg-amber-500',
    accentColor: '#F59E0B',
    startQuestionIndex: 8 // Q 9..12 (indices 8..11)
  },
  'SP 4.4.4': {
    title: 'Pusingan 4 — Math Survival Zone',
    skill: 'Menyelesaikan masalah yang melibatkan nisbah, kadar dan kadaran, termasuk membuat anggaran',
    zoneName: 'Zon Ikhtiar Hidup Lahar Berapi',
    badgeColor: 'bg-purple-500',
    accentColor: '#8B5CF6',
    startQuestionIndex: 12 // Q 13..16 (indices 12..15)
  }
};

/**
 * Returns the exact 16 questions in strict sequential order (Soalan 1 hingga 16).
 * No random shuffling!
 */
export function generateSessionQuestions(): Question[] {
  return [...EXACT_QUESTIONS];
}
