import express from 'express';
import mongoose from 'mongoose';
import { DATABASE_URL } from './env.js';
import Group from './models/Group.js'

const app = express();
app.use(express.json());


// 그룹 등록
app.post('/groups', async (req, res) => {
    const newGroup = await Group.create(req.body)
    res.status(201).send(newGroup);
})


// 그룹 상세 정보 조회
app.get('/groups/:id', async (req, res) => {
    const id = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ message: '잘못된 요청입니다' });
    }

    const group = await Group.findById(id);
    if (group) {
        res.send(group);
    } else {
        res.status(404).send({ message: '존재하지 않습니다'});
    }
})


// 그룹 목록 조회
app.get('/groups', async (req, res) => {
    const sort = req.query.sort || 'latest';
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 50;
    const keyword = req.query.keyword || ''; 
    const isPublic = req.query.isPublic;
    
    // 정렬 옵션
    const sortOptions = {
        latest: { createdAt: 'desc' },
        mostPosted: { postCount: 'desc' },
        mostLiked: { likeCount: 'desc' },
        mostBadge: { badgeCount: 'desc' } 
    };

    const sortOption = sortOptions[sort] || sortOptions.latest;

    // 검색어
    const filterConditions = {};
    if (keyword) {
        filterConditions.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { introduction: { $regex: keyword, $options: 'i' } }
        ];
    }

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

    const totalItems = await Group.countDocuments(filterConditions);
    const totalPages = Math.ceil(totalItems / pageSize);

    const groups = await Group.find(filterConditions)
        .sort(sortOption)
        .skip((page - 1) * pageSize)
        .limit(pageSize);

    const response = {
        currentPage: page,
        totalPages: totalPages,
        totalItemCount: totalItems,
        data: groups
    };

    res.send(response);

})


// 그룹 수정
app.put('/groups/:id', async (req, res) => {
    const id = req.params.id;
    const { password, updateData } = req.body; 
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

        res.send(group);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
})


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
app.get('/groups/:id/verify-password', async (req, res) => {
    const id = req.params.id;
    const { password } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ message: '잘못된 요청입니다' });
    }

    try {
        const group = await Group.findById(id);

         if (!group.isPublic) {
            if (group.password !== password) {
                console.log(group.password);
                console.log(password);
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


app.listen(3000, () => console.log('Server Started'));
mongoose.connect(DATABASE_URL).then(() => console.log('Connected to DB'));