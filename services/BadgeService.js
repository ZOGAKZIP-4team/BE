import mongoose from 'mongoose'; 
import Group from '../models/Group.js';
import Post from '../models/Post.js';

export const checkAndAwardBadges = async (groupId) => {
    const group = await Group.findById(groupId);
    const now = new Date();

    const badges = [];

    const postsLast7Days = await Post.aggregate([
        {
            $match: {
                groupId: new mongoose.Types.ObjectId(group),
                createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } // 최근 7일의 게시글
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } // 날짜별로 그룹화
            }
        },
        {
            $sort: { _id: 1 } // 날짜순으로 정렬
        }
    ]);

    const postDates = postsLast7Days.map(post => new Date(post._id));

    if (isSevenConsecutiveDays(postDates)) {
        badges.push("7일 연속 게시글 등록");
    }


    // 게시글 수 20개 이상 등록
    if (group.postCount >= 20) {
        badges.push("게시글 수 20개 이상 등록");
    }

    // 그룹 생성 후 1년 달성
    if (new Date(group.createdAt).getTime() <= now.getTime() - 365 * 24 * 60 * 60 * 1000) {
        badges.push("그룹 생성 후 1년 달성");
    }

    // 그룹 공감 1만 개 이상 받기
    if (group.likeCount >= 10000) {
        badges.push("그룹 공감 1만 개 이상 받기");
    }

    // 추억 공감 1만 개 이상 받기
    const postsWithOver10kLikes = await Post.countDocuments({
        groupId: groupId,
        likeCount: { $gte: 10000 }
    });
    if (postsWithOver10kLikes > 0) {
        badges.push("추억 공감 1만 개 이상 받기");
    }

    for (const badge of badges) {
        if (!group.badges.includes(badge)) {
            group.badges.push(badge);
        }
    }
    await group.save();
};


// 하루에 한 번 그룹 생성날짜 확인
export const checkBadgesPeriodically = async () => {
    try {
        const now = new Date();
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

        // 생성일이 1년이 지났으나 배지가 없는 그룹을 찾습니다.
        const groups = await Group.find({
            createdAt: { $lte: oneYearAgo },
            badges: { $nin: ["그룹 생성 후 1년 달성"] }
        });

        for (const group of groups) {
            await checkAndAwardBadges(group._id.toString());
        }
    } catch (error) {
        console.error('Error checking and awarding badges:', error);
    }
};

setInterval(checkBadgesPeriodically, 24 * 60 * 60 * 1000);

// 7일 연속 게시글 등록 확인
const isSevenConsecutiveDays = (dates) => {
    if (dates.length < 7) return false;

    const sortedDates = dates.sort((a, b) => a - b);
    for (let i = 0; i < sortedDates.length - 6; i++) {
        let isConsecutive = true;
        for (let j = 0; j < 7; j++) {
            const expectedDate = new Date(sortedDates[i].getTime() + j * 24 * 60 * 60 * 1000);
            if (sortedDates[i + j].toDateString() !== expectedDate.toDateString()) {
                isConsecutive = false;
                break;
            }
        }
        if (isConsecutive) return true;
    }
    return false;
};