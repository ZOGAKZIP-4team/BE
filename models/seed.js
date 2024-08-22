import mongoose from 'mongoose';
import Post from './Post.js';
import { DATABASE_URL } from '../env.js';

mongoose.connect(DATABASE_URL)
  .then(() => console.log('DB에 연결되었습니다.'))
  .catch(err => console.error('DB 연결 실패:', err));

const seedPosts = async () => {
  try {
    const posts = [
      {
        groupId: mongoose.Types.ObjectId("64e3caadfc13ae1ab4000001"), 
        nickname: "김철수",
        title: "맛집 탐방: 서울의 숨은 맛집",
        content: "서울에 숨겨진 맛집들을 탐방해보았습니다. 다양한 음식을 즐길 수 있는 곳을 소개합니다.",
        postPassword: "pass1234",
        groupPassword: "groupPass1",
        imageUrl: "http://example.com/image1.jpg",
        tags: ["맛집", "서울", "탐방"],
        location: "서울, 대한민국",
        moment: new Date("2024-08-19T10:00:00.000+00:00"),
        isPublic: true,
        likeCount: 12,
        commentCount: 3
      },
      {
        groupId: mongoose.Types.ObjectId("64e3caadfc13ae1ab4000002"), 
        nickname: "이영희",
        title: "주말 여행: 제주도 힐링 여행기",
        content: "제주도의 아름다운 풍경과 함께 힐링 여행을 다녀왔습니다. 사진과 함께 여행기를 공유합니다.",
        postPassword: "pass5678",
        groupPassword: "groupPass1",
        imageUrl: "http://example.com/image2.jpg",
        tags: ["여행", "제주도", "힐링"],
        location: "제주도, 대한민국",
        moment: new Date("2024-08-20T15:30:00.000+00:00"),
        isPublic: false,
        likeCount: 20,
        commentCount: 5
      },
      {
        groupId: mongoose.Types.ObjectId("64e3caadfc13ae1ab4000002"), 
        nickname: "박민수",
        title: "사진 촬영 팁: 인물 사진 잘 찍는 법",
        content: "인물 사진을 잘 찍기 위한 몇 가지 팁을 공유합니다. 초보자도 쉽게 따라할 수 있는 방법들입니다.",
        postPassword: "pass9012",
        groupPassword: "groupPass2",
        imageUrl: "http://example.com/image3.jpg",
        tags: ["사진", "촬영", "팁"],
        location: "인천, 대한민국",
        moment: new Date("2024-08-21T08:45:00.000+00:00"),
        isPublic: true,
        likeCount: 30,
        commentCount: 10
      },
      {
        groupId: mongoose.Types.ObjectId("64e3caadfc13ae1ab4000003"), // 또 다른 그룹의 ObjectId
        nickname: "정현아",
        title: "독서 후기: 올해의 베스트셀러",
        content: "올해 읽은 책들 중 베스트셀러 몇 권을 추천드립니다. 각 책의 내용과 느낌을 간단히 정리했습니다.",
        postPassword: "pass3456",
        groupPassword: "groupPass2",
        imageUrl: "http://example.com/image4.jpg",
        tags: ["독서", "베스트셀러", "후기"],
        location: "부산, 대한민국",
        moment: new Date("2024-08-22T14:20:00.000+00:00"),
        isPublic: true,
        likeCount: 25,
        commentCount: 7
      }
    ];

    await Post.insertMany(posts);
    console.log('Seed 데이터가 성공적으로 추가되었습니다.');
  } catch (err) {
    console.error('Seed 데이터 추가 중 오류가 발생했습니다:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedPosts();
