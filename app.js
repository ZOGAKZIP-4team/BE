import express from 'express';
import mongoose from 'mongoose';
import Group from './models/Group.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';
import Image from './models/ImageUpload.js';
import * as dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
dotenv.config();
import cors from 'cors';
import { checkAndAwardBadges } from './services/BadgeService.js'; 
import { checkBadgesPeriodically } from './services/BadgeService.js';
import moment from 'moment-timezone';

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to DB'))
    .catch((error) => console.error('DB connection error:', error));

// 그룹 등록
app.post('/groups', async (req, res) => {
    try {
        const { name, password, imageUrl, isPublic, introduction } = req.body;

        if (!name || !password || !introduction) {
            return res.status(400).send({ message: '잘못된 요청입니다' });
        }

        const newGroup = new Group({
            name,
            password,
            imageUrl,
            isPublic,
            introduction,
            createdAt: moment().tz('Asia/Seoul').toDate()  // 한국 시간으로 저장
        });
        const saveGroup = await newGroup.save();

        const response = {
            id: saveGroup._id,
            name: saveGroup.name,
            imageUrl: saveGroup.imageUrl,
            isPublic: saveGroup.isPublic,
            likeCount: saveGroup.likeCount,
            badges: saveGroup.badges,
            postCount: saveGroup.postCount,
            createdAt: moment(saveGroup.createdAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
            introduction: saveGroup.introduction
        };

        res.status(201).send(response);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: '서버 오류' });
    }
});

// 그룹 상세 정보 조회
app.get('/groups/:id', async (req, res) => {
    const id = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ message: '잘못된 요청입니다' });
    }

    const group = await Group.findById(id);
    if (group) {
        group.createdAt = moment(group.createdAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        res.send(group);
    } else {
        res.status(404).send({ message: '존재하지 않습니다' });
    }
});

// 그룹 목록 조회
app.get('/groups', async (req, res) => {
    const sortBy = req.query.sortBy || 'latest';
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 50;
    const keyword = req.query.keyword || ''; 
    const isPublic = req.query.isPublic;

    const filterConditions = {};

    // 검색어
    if (keyword) {
        filterConditions.$or = [
            { name: { $regex: keyword, $options: 'i' } }
        ];
    }

    // 공개 여부
    if (isPublic !== undefined) {
        filterConditions.isPublic = isPublic === 'true';
    }

    if (req.query.id) {
        if (mongoose.Types.ObjectId.isValid(req.query.id)) {
            filterConditions._id = mongoose.Types.ObjectId(req.query.id);
        } else {
            return res.status(400).send({ error: 'Invalid ObjectId format' });
        }
    }

    // 정렬
    const sortOptions = {
        latest: { createdAt: -1 },
        mostPosted: { postCount: -1 },
        mostLiked: { likeCount: -1 },
        mostBadge: { badgesLength: -1 }
    };

    const sortOption = sortOptions[sortBy] || sortOptions.latest;

    let aggregatePipeline = [
        { $match: filterConditions }
    ];

    if (sortBy === 'mostBadge') {
        aggregatePipeline.push({
            $addFields: {
                badgesLength: { $size: '$badges' }
            }
        });
    }

    aggregatePipeline.push(
        { $sort: sortOption },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize }
    );

    const groups = await Group.aggregate(aggregatePipeline);

    groups.forEach(group => {
        group.createdAt = moment(group.createdAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
    });

    const totalItems = await Group.countDocuments(filterConditions);
    const totalPages = Math.ceil(totalItems / pageSize);

    const response = {
        currentPage: page,
        totalPages: totalPages,
        totalItemCount: totalItems,
        data: groups
    };

    res.send(response);
});

// 그룹 수정
app.put('/groups/:id', async (req, res) => {
    const id = req.params.id;
    const { password, ...updateData } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ message: '잘못된 요청입니다' });
    }

    try {
        const group = await Group.findById(id);

        if (!group) {
            return res.status(404).send({ message: '존재하지 않습니다' });
        }
        if (group.password !== password) {
            return res.status(403).send({ message: '비밀번호가 틀렸습니다' });
        }

        Object.assign(group, updateData); 
        await group.save();

        group.createdAt = moment(group.createdAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');

        res.send(group);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// 그룹 삭제
app.delete('/groups/:id', async (req, res) => {
    const id = req.params.id;
    const { password } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ message: '잘못된 요청입니다' });
    }
    try {
        const group = await Group.findById(id);

        if (!group) {
            return res.status(404).send({ message: '존재하지 않습니다' });
        }
        if (group.password !== password) {
            return res.status(403).send({ message: '비밀번호가 틀렸습니다' });
        }

        await Group.findByIdAndDelete(id);
        res.send({ message: '그룹 삭제 성공' });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// 비공개 그룹 조회 권한 확인
app.post('/groups/:id/verify-password', async (req, res) => {
    const id = req.params.id;
    const { password } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ message: '잘못된 요청입니다' });
    }

    try {
        const group = await Group.findById(id);

         if (!group.isPublic) {
            if (group.password !== password) {
                return res.status(401).send({ message: '비밀번호가 틀렸습니다' });
            } else {
                res.send({ message: '비밀번호가 확인되었습니다' });
            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// 그룹 공감하기
app.post('/groups/:id/like', async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ message: '잘못된 요청입니다' });
    }

    try {
        const group = await Group.findByIdAndUpdate(
            id,
            { $inc: { likeCount: 1 } },
            { new: true }
        );

        if (group) {
            await checkAndAwardBadges(id);
            res.send({ message: '그룹 공감하기 성공' });
        } else {
            res.status(404).send({ message: '존재하지 않습니다' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// 그룹 공개 여부 확인
app.get('/groups/:id/is-public', async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ message: '잘못된 요청입니다' });
    }

    try {
        const group = await Group.findById(id).select('isPublic');

        if (group) {
            res.send({
                id: group._id,
                isPublic: group.isPublic
            });
        } else {
            res.status(404).send({ message: '존재하지 않습니다' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// 게시글 등록
app.post('/groups/:groupId/posts', async (req, res) => {
    try {
        const { nickname, title, content, postPassword, groupPassword, imageUrl, tags, location, moment: postMoment, isPublic } = req.body;
        const groupId = req.params.groupId;
        if (!nickname || !title || !content || !postPassword || !groupPassword || !imageUrl || !location || !postMoment || isPublic === undefined) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

        const newPost = new Post({
            ...req.body,
            groupId: req.params.groupId,
            moment: moment.tz(postMoment, 'Asia/Seoul').toDate(),  // 한국 시간으로 저장
            createdAt: moment().tz('Asia/Seoul').toDate()  // 한국 시간으로 저장
        });
        await newPost.save();
        await Group.findByIdAndUpdate(groupId, { $inc: { postCount: 1 } });
        await checkAndAwardBadges(groupId);

        const response = {
            ...newPost._doc,
            moment: moment(newPost.moment).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
            createdAt: moment(newPost.createdAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
        };

        res.status(200).send(response);
    } catch (error) {
        res.status(400).json({ message: "잘못된 요청입니다" });
    }
});

// 게시글 목록 조회
app.get('/groups/:groupId/posts', async (req, res) => {
    const { page = 1, pageSize = 10, sortBy = 'latest', keyword, isPublic } = req.query;
    const sortOptions = {
        latest: { createdAt: -1 },
        mostCommented: { commentCount: -1 },
        mostLiked: { likeCount: -1 },
    };

    try {
        const query = {
            groupId: req.params.groupId, 
            ...(keyword && { title: { $regex: keyword, $options: 'i' } }),
            ...(isPublic !== undefined && { isPublic: isPublic === 'true' })
        };

        const totalItemCount = await Post.countDocuments(query);
        const posts = await Post.find(query)
            .sort(sortOptions[sortBy])
            .skip((page - 1) * pageSize)
            .limit(parseInt(pageSize));

        const transformedPosts = posts.map(post => ({
            ...post._doc,
            moment: moment(post.moment).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
            createdAt: moment(post.createdAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
        }));

        res.status(200).json({
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalItemCount / pageSize),
            totalItemCount,
            data: transformedPosts
        });
    } catch (error) {
        res.status(400).json({ message: "잘못된 요청입니다" });
    }
});

// 게시글 상세 조회
app.get('/posts/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }

        const response = {
            ...post._doc,
            moment: moment(post.moment).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
            createdAt: moment(post.createdAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
        };

        res.status(200).send(response);
    } catch (error) {
        res.status(400).json({ message: "잘못된 요청입니다" });
    }
});

// 게시글 수정
app.put('/posts/:postId', async (req, res) => {
    const { postId } = req.params;
    const { postPassword, ...updateData } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).send({ message: '잘못된 요청입니다' });
    }

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).send({ message: '존재하지 않습니다' });
        }
       
        if (post.postPassword !== postPassword) {
            return res.status(403).send({ message: '비밀번호가 틀렸습니다' });
        }

        Object.assign(post, updateData); 
        await post.save();

        post.createdAt = moment(post.createdAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        post.moment = moment(post.moment).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');

        res.send(post);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// 게시글 삭제
app.delete('/posts/:postId', async (req, res) => {
    const { postId } = req.params;
    const { postPassword } = req.body;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }
        if (post.postPassword !== postPassword) {
            return res.status(403).json({ message: "비밀번호가 틀렸습니다" });
        }

        await Post.findByIdAndDelete(postId);
        res.send({ message: '게시글 삭제 성공' });
    } catch (error) {
        res.status(400).json({ message: "잘못된 요청입니다" });
    }
});

// 게시글 공감하기
app.post('/posts/:postId/like', async (req, res) => {
    const { postId } = req.params;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }
        post.likeCount += 1;
        await post.save();

        const groupId = post.groupId;

        await checkAndAwardBadges(groupId);
        res.status(200).json({ message: "게시글 공감하기 성공" });
    } catch (error) {
        res.status(400).json({ message: "잘못된 요청입니다" });
    }
});

// 게시글 조회 권한 확인
app.post('/posts/:postId/verify-password', async (req, res) => {
    const { postId } = req.params;
    const { password } = req.body;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }
        if (post.postPassword === password) {
            res.status(200).json({ message: "비밀번호가 확인되었습니다" });
        } else {
            res.status(401).json({ message: "비밀번호가 틀렸습니다" });
        }
    } catch (error) {
        res.status(400).json({ message: "잘못된 요청입니다" });
    }
});

// 게시글 공개 여부 확인
app.get('/posts/:postId/is-public', async (req, res) => {
    const { postId } = req.params;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }
        res.status(200).json({ id: postId, isPublic: post.isPublic });
    } catch (error) {
        res.status(400).json({ message: "잘못된 요청입니다" });
    }
});

// 댓글 등록
app.post('/posts/:postId/comments', async (req, res) => {
    try {
        const { nickname, content, password } = req.body;
        if (typeof password !== 'string') {
            return res.status(400).send({ message: 'Password must be a string' });
        }
        if (!nickname || !content || !password) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

        const newComment = new Comment({
            ...req.body,
            postId: req.params.postId,
            createdAt: moment().tz('Asia/Seoul').toDate()  // 한국 시간으로 저장
        });
        await newComment.save();

        const response = {
            ...newComment._doc,
            createdAt: moment(newComment.createdAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
        };

        res.status(200).send(response);
    } catch (error) {
        res.status(400).json({ message: "잘못된 요청입니다" });
    }
});

// 댓글 목록 조회
app.get('/posts/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).send({ message: '잘못된 요청입니다' });
        }

        const filterConditions = { postId };
        const totalItemCount = await Comment.countDocuments(filterConditions);
        const totalPages = Math.ceil(totalItemCount / pageSize);

        const comments = await Comment.find(filterConditions)
            .sort({ createdAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .select('nickname content createdAt');

        const response = {
            currentPage: page,
            totalPages,
            totalItemCount,
            data: comments.map(comment => ({
                id: comment._id,
                nickname: comment.nickname,
                content: comment.content,
                createdAt: moment(comment.createdAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
            }))
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: '서버 오류가 발생했습니다.' });
    }
});

// 댓글 수정
app.put('/comments/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const { password, ...updateData } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).send({ message: '잘못된 요청입니다' });
    }

    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).send({ message: '존재하지 않습니다' });
        }
       
        if (comment.password !== password) {
            return res.status(403).send({ message: '비밀번호가 틀렸습니다' });
        }

        Object.assign(comment, updateData); 
        await comment.save();

        const response = {
            ...comment._doc,
            createdAt: moment(comment.createdAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
        };

        res.send(response);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// 댓글 삭제
app.delete('/comments/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const { password } = req.body;

    try {
        const comment = await Comment.findById(commentId);
   
        if (!comment) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }
        if (comment.password !== password) {
            return res.status(403).json({ message: "비밀번호가 틀렸습니다" });
        }

        await Comment.findByIdAndDelete(commentId);
        res.send({ message: '댓글 삭제 성공' });
    } catch (error) {
        res.status(400).json({ message: "잘못된 요청입니다" });
    }
});

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

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extName) {
        return cb(null, true);
    } else {
        cb(new Error('Only images are allowed'));
    }
};

// Multer 미들웨어 설정
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

// 이미지 업로드 엔드포인트
app.post('/image', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // MongoDB에 이미지 URL 저장
    const image = new Image({ imageUrl });
    await image.save();

    res.status(200).json({ imageUrl });
});

app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.DATABASE_URL).then(() => console.log('Connected to DB'));
app.listen(process.env.PORT || 3000, async() => {
    console.log('Server Started');

    await checkBadgesPeriodically();
    setInterval(checkBadgesPeriodically, 24 * 60 * 60 * 1000);
});
