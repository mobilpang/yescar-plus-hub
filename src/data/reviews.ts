export type ReviewStatus = "상담 완료" | "즉시 연결" | "재문의";

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

export type ReviewAdminSession = {
  authenticated: boolean;
};

export type ReviewStorageMode = "filesystem" | "vercel-blob" | "vercel-missing-blob";

export type ReviewStorageInfo = {
  mode: ReviewStorageMode;
  label: string;
  note: string;
  uploadsEnabled: boolean;
};

export const reviewStatuses: readonly ReviewStatus[] = ["상담 완료", "즉시 연결", "재문의"];

export const defaultReviews: ReviewItem[] = [
  {
    id: "review-seed-1",
    author: "김서연 / 패밀리카",
    vehicleName: "카니발 하이리무진",
    summary: "문의 넣고 이틀 만에 바로 연락이 왔고, 진행 흐름도 정말 빠르고 깔끔했어요.",
    image:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80",
    uploadedAt: "2026-05-02T09:00:00.000Z",
    badge: "빠른 진행",
    rating: 5,
    status: "상담 완료",
  },
  {
    id: "review-seed-2",
    author: "이현우 / 출퇴근카",
    vehicleName: "BMW 5시리즈",
    summary: "사진 톤이 좋아서 문의가 더 붙었고, 상담 멘트도 차분하게 정리해줘서 편했습니다.",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
    uploadedAt: "2026-05-05T14:30:00.000Z",
    badge: "문의 전환",
    rating: 4,
    status: "즉시 연결",
  },
  {
    id: "review-seed-3",
    author: "정하늘 / 첫차 상담",
    vehicleName: "아반떼 N Line",
    summary: "복잡한 부분이 많았는데 필요한 것만 딱 안내해줘서 부담 없이 문의할 수 있었어요.",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    uploadedAt: "2026-05-07T06:15:00.000Z",
    badge: "입문자 추천",
    rating: 5,
    status: "상담 완료",
  },
  {
    id: "review-seed-4",
    author: "박준형 / 수입차 상담",
    vehicleName: "벤츠 E클래스",
    summary: "고급스럽게 연출돼서 브랜드 이미지가 더 살아났고, 짧은 후기만으로도 반응이 좋았습니다.",
    image:
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=900&q=80",
    uploadedAt: "2026-05-09T11:45:00.000Z",
    badge: "브랜드 무드",
    rating: 5,
    status: "재문의",
  },
];
