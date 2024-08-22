import express from 'express';
import mongoose from 'mongoose';
import { DATABASE_URL } from './env.js';
import Image from './models/ImageUpload.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// MongoDB 연결
mongoose.connect(DATABASE_URL).then(() => console.log('Connected to DB!!'));

const app = express();
app.use(express.json());

// 이미지 저장 경로 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 이미지 업로드 엔드포인트
app.post('/api/image', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // MongoDB에 이미지 URL 저장
    const image = new Image({ imageUrl });
    await image.save();

    res.status(200).json({ imageUrl });
});

// Static 파일 제공 (이미지 접근을 위해)
app.use('/uploads', express.static('uploads'));

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Image upload service running on port ${PORT}`));

export default app;
