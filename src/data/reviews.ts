export type ReviewItem = {
  id: string;
  author: string;
  vehicleName: string;
  summary: string;
  image: string;
  uploadedAt: string;
  badge: string;
  rating: number;
  status: ReviewStatus;
};

export const reviewStatuses = ["상담 완료", "즉시 연결", "재문의"] as const;

export type ReviewStatus = (typeof reviewStatuses)[number];

export type ReviewAdminSession = {
  authenticated: boolean;
};

export const defaultReviews: ReviewItem[] = [
  {
    id: "review-seed-1",
    author: "김서연 / 패밀리카",
    vehicleName: "카니발 하이리무진",
    summary: "문의 넣고 이틀 만에 승계 연락이 왔고, 진행 흐름이 진짜 빠르고 깔끔했어요.",
    image:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80",
    uploadedAt: "2026-05-02T09:00:00.000Z",
    badge: "빠른 진행",
    rating: 5,
    status: "상담 완료",
  },
  {
    id: "review-seed-2",
    author: "이민호 / 출퇴근카",
    vehicleName: "BMW 5시리즈",
    summary: "사진 톤이 좋아서 문의가 잘 붙었고, 상담 멘트도 세련되게 정리해줘서 편했습니다.",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
    uploadedAt: "2026-05-05T14:30:00.000Z",
    badge: "문의 전환",
    rating: 4,
    status: "즉시 연결",
  },
  {
    id: "review-seed-3",
    author: "정하은 / 첫 리스 승계",
    vehicleName: "아반떼 N Line",
    summary: "복잡할 줄 알았는데 필요한 것만 딱 안내해줘서 부담 없이 올릴 수 있었어요.",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    uploadedAt: "2026-05-07T06:15:00.000Z",
    badge: "입문자 추천",
    rating: 5,
    status: "상담 완료",
  },
  {
    id: "review-seed-4",
    author: "박준형 / 수입차 승계",
    vehicleName: "벤츠 E클래스",
    summary: "고급스럽게 노출돼서 브랜드 이미지가 안 깨졌고, 한 줄 후기만으로도 반응이 좋았습니다.",
    image:
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=900&q=80",
    uploadedAt: "2026-05-09T11:45:00.000Z",
    badge: "브랜드 무드",
    rating: 5,
    status: "재문의",
  },
];
