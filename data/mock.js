const groupsData = [
  {
    name: "짱구네 가족",
    password: "pw123",
    imageUrl: "string",
    isPublic: true,
    likeCount: 9,
    badges: ['그룹 생성 후 1년 달성'],
    postCount: 0,
    createdAt: "2022-08-07T07:47:49.803Z",
    introduction: "화목한 짱구네 가족 이야기"
  },
  {
    name: "도라에몽 친구들",
    password: "pw123",
    imageUrl: "string",
    isPublic: true,
    likeCount: 5,
    badges: [],
    postCount: 0,
    createdAt: "2024-08-08T07:47:49.803Z",
    introduction: "도라에몽과 친구들의 모험 이야기"
  },
  {
    name: "포켓몬 트레이너",
    password: "pw123",
    imageUrl: "string",
    isPublic: false,
    likeCount: 0,
    badges: ['7일 연속 추억 등록', '추억 수 20개 이상 등록'],
    postCount: 21,
    createdAt: "2024-08-10T07:47:49.803Z",
    introduction: "지우와 이슬이, 웅이와 함께한 피카츄의 추억"
  },
  {
    name: "원피스 해적단",
    password: "pw123",
    imageUrl: "string",
    isPublic: false,
    likeCount: 6,
    badges: [],
    postCount: 3,
    createdAt: "2024-08-11T07:47:49.803Z",
    introduction: "루피의 보물 찾기 대작전"
  },
  {
    name: "세일러문",
    password: "pw123",
    imageUrl: "string",
    isPublic: true,
    likeCount: 0,
    badges: [],
    postCount: 0,
    createdAt: "2024-08-11T09:47:49.803Z",
    introduction: "달빛 아래 추억들"
  },
  {
    name: "알라딘",
    password: "pw123",
    imageUrl: "string",
    isPublic: false,
    likeCount: 0,
    badges: [],
    postCount: 0,
    createdAt: "2024-08-12T07:47:49.803Z",
    introduction: "알라딘과 자스민 공주의 추억"
  },
  {
    name: "겨울왕국",
    password: "pw123",
    imageUrl: "string",
    isPublic: true,
    likeCount: 0,
    badges: [],
    postCount: 0,
    createdAt: "2024-08-12T13:47:49.803Z",
    introduction: "자매(엘사와 안나)의 여행 기록"
  },
  {
    name: "인사이드아웃",
    password: "pw123",
    imageUrl: "string",
    isPublic: true,
    likeCount: 0,
    badges: [],
    postCount: 0,
    createdAt: "2024-08-13T13:47:49.803Z",
    introduction: "기쁨이와 슬픔이의 우정 여행 기록"
  },
  {
    name: "라일리의 성장 기록",
    password: "pw123",
    imageUrl: "string",
    isPublic: true,
    likeCount: 0,
    badges: [],
    postCount: 0,
    createdAt: "2024-08-13T19:47:49.803Z",
    introduction: "감정변화를 겪으며 성장해가는 라일리의 성장 기록입니다!"
  },
  {
    name: "미니언즈",
    password: "pw123",
    imageUrl: "string",
    isPublic: true,
    likeCount: 0,
    badges: [],
    postCount: 0,
    createdAt: "2024-08-14T13:47:49.803Z",
    introduction: "우리의 보스가 되어줄 악당을 찾아서~"
  },
  
];

const postsData = [
  {
    groupId: "66c74fc68434f6495980e5b7", 
    nickname: "김철수",
    title: "맛집 탐방: 서울의 숨은 맛집",
    content: "서울에 숨겨진 맛집들을 탐방해보았습니다. 다양한 음식을 즐길 수 있는 곳을 소개합니다.",
    postPassword: "pass1234",
    groupPassword: "groupPass1",
    imageUrl: "http://example.com/image1.jpg",
    tags: ['맛집', '서울'],
    location: "서울, 대한민국",
    moment: new Date("2024-08-12T10:00:00.000+00:00"),
    isPublic: true,
    likeCount: 12,
    commentCount: 3
  },
  {
    groupId: "66c74fc68434f6495980e5b7", 
    nickname: "이영희",
    title: "주말 여행: 제주도 힐링 여행기",
    content: "제주도의 아름다운 풍경과 함께 힐링 여행을 다녀왔습니다. 사진과 함께 여행기를 공유합니다.",
    postPassword: "pass5678",
    groupPassword: "groupPass1",
    imageUrl: "http://example.com/image2.jpg",
    tags: [],
    location: "제주도, 대한민국",
    moment: new Date("2024-08-17T10:00:00.000+00:00"),
    isPublic: false,
    likeCount: 20,
    commentCount: 5
  },
  {
    groupId: "66c74fc68434f6495980e5b7", 
    nickname: "박민수",
    title: "사진 촬영 팁: 인물 사진 잘 찍는 법",
    content: "인물 사진을 잘 찍기 위한 몇 가지 팁을 공유합니다. 초보자도 쉽게 따라할 수 있는 방법들입니다.",
    postPassword: "pass9012",
    groupPassword: "groupPass2",
    imageUrl: "http://example.com/image3.jpg",
    tags: ['사진'],
    location: "인천, 대한민국",
    moment: new Date("2024-08-19T10:00:00.000+00:00"),
    isPublic: true,
    likeCount: 30,
    commentCount: 10
  },
  {
    groupId: "66c74fc68434f6495980e5b7", // 또 다른 그룹의 ObjectId
    nickname: "정현아",
    title: "독서 후기: 올해의 베스트셀러",
    content: "올해 읽은 책들 중 베스트셀러 몇 권을 추천드립니다. 각 책의 내용과 느낌을 간단히 정리했습니다.",
    postPassword: "pass3456",
    groupPassword: "groupPass2",
    imageUrl: "http://example.com/image4.jpg",
    tags: ['독서', '베스트셀러'],
    location: "부산, 대한민국",
    moment: new Date("2024-08-19T10:00:00.000+00:00"),
    isPublic: true,
    likeCount: 25,
    commentCount: 7
  }
];

export default { groupsData, postsData };