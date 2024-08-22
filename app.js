import express from 'express';
import mongoose from 'mongoose';
import { DATABASE_URL } from './env.js';
import Post from './models/Post.js';

mongoose.connect(DATABASE_URL).then(() => console.log('Connected to MongoDB'));

const app = express();
app.use(express.json());

// 게시글 등록
app.post('/api/groups/:groupId/posts', async (req, res) => {
    try {
        const { nickname, title, content, postPassword, groupPassword, imageUrl, tags, location, moment, isPublic } = req.body;
        if (!nickname || !title || !content || !postPassword || !groupPassword || !imageUrl || !location || !moment || isPublic === undefined) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

        const newPost = new Post({
            ...req.body,
            groupId: req.params.groupId,
            likeCount: 0,
            commentCount: 0,
            createdAt: new Date()
        });
        await newPost.save();
        res.status(200).send(newPost);
    } catch (error) {
        res.status(400).json({ message: "잘못된 요청입니다" });
    }
});

// 게시글 목록 조회
app.get('/api/groups/:groupId/posts', async (req, res) => {
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

        res.status(200).json({
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalItemCount / pageSize),
            totalItemCount,
            data: posts
        });
    } catch (error) {
        res.status(400).json({ message: "잘못된 요청입니다" });
    }
});

// 게시글 상세 조회
app.get('/api/posts/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }
        res.status(200).send(post);
    } catch (error) {
        res.status(400).json({ message: "잘못된 요청입니다" });
    }
});

// 게시글 수정
app.put('/api/posts/:postId', async (req, res) => {
    const { postId } = req.params;
    const { postPassword, ...updateData } = req.body;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }
        if (post.postPassword !== postPassword) {
            return res.status(403).json({ message: "비밀번호가 틀렸습니다" });
        }
        Object.assign(post, updateData);
        await post.save();
        res.status(200).send(post);
    } catch (error) {
        res.status(400).json({ message: "잘못된 요청입니다" });
    }
});

// 게시글 삭제
app.delete('/api/posts/:postId', async (req, res) => {
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
        await post.remove();
        res.status(200).json({ message: "게시글 삭제 성공" });
    } catch (error) {
        res.status(400).json({ message: "잘못된 요청입니다" });
    }
});

// 게시글 공감하기
app.post('/api/posts/:postId/like', async (req, res) => {
    const { postId } = req.params;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }
        post.likeCount += 1;
        await post.save();
        res.status(200).json({ message: "게시글 공감하기 성공" });
    } catch (error) {
        res.status(400).json({ message: "잘못된 요청입니다" });
    }
});

// 게시글 조회 권한 확인
app.post('/api/posts/:postId/verify-password', async (req, res) => {
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
app.get('/api/posts/:postId/is-public', async (req, res) => {
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

app.listen(3000, () => console.log('Server Started on port 3000'));
