import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { startTransition, useEffect, useId, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Camera,
  CarFront,
  ImagePlus,
  LockKeyhole,
  LogOut,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { reviewStatuses, type ReviewItem, type ReviewStatus } from "@/data/reviews";
import { createReview, deleteReview, loginReviewAdmin, logoutReviewAdmin } from "@/lib/reviews.functions";
import { cn } from "@/lib/utils";

const uploadLimitInBytes = 3 * 1024 * 1024;

const gridClasses = [
  "md:col-span-7",
  "md:col-span-5",
  "md:col-span-5",
  "md:col-span-7",
] as const;

const accentClasses = [
  "from-primary/90 via-primary/65 to-accent/55",
  "from-slate-950/85 via-primary/70 to-accent/60",
  "from-accent/90 via-primary/75 to-primary/55",
  "from-foreground/90 via-primary/75 to-accent/55",
] as const;

const statusClasses: Record<ReviewStatus, string> = {
  "상담 완료": "bg-emerald-400/90 text-slate-950",
  "즉시 연결": "bg-amber-300/90 text-slate-950",
  "재문의": "bg-white/85 text-primary",
};

type ReviewsPageProps = {
  initialAuthenticated: boolean;
  initialReviews: ReviewItem[];
};

function formatUploadDate(uploadedAt: string) {
  const date = new Date(uploadedAt);

  if (Number.isNaN(date.getTime())) {
    return "최근 등록";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function renderStars(rating: number, tone: "light" | "dark") {
  return Array.from({ length: 5 }, (_, index) => {
    const isFilled = index < rating;

    return (
      <Star
        key={`${tone}-${rating}-${index}`}
        className={cn(
          "h-4 w-4",
          tone === "light"
            ? isFilled
              ? "fill-amber-300 text-amber-300"
              : "text-white/35"
            : isFilled
              ? "fill-amber-400 text-amber-400"
              : "text-primary/20",
        )}
      />
    );
  });
}

function revokePreviewUrl(url: string) {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function ReviewsPage({ initialAuthenticated, initialReviews }: ReviewsPageProps) {
  const createReviewFn = useServerFn(createReview);
  const deleteReviewFn = useServerFn(deleteReview);
  const loginReviewAdminFn = useServerFn(loginReviewAdmin);
  const logoutReviewAdminFn = useServerFn(logoutReviewAdmin);

  const [reviews, setReviews] = useState(initialReviews);
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [isComposerOpen, setIsComposerOpen] = useState(initialAuthenticated);
  const [author, setAuthor] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [summary, setSummary] = useState("");
  const [badge, setBadge] = useState("");
  const [status, setStatus] = useState<ReviewStatus>("상담 완료");
  const [rating, setRating] = useState(5);
  const [adminPassword, setAdminPassword] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const fileInputId = useId();

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  useEffect(() => {
    setIsAuthenticated(initialAuthenticated);
    setIsComposerOpen(initialAuthenticated);
  }, [initialAuthenticated]);

  useEffect(() => {
    return () => {
      revokePreviewUrl(previewImage);
    };
  }, [previewImage]);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFeedback("");
    setErrorMessage("");

    if (file.size > uploadLimitInBytes) {
      setErrorMessage("이미지는 3MB 이하로 업로드해 주세요.");
      setFileInputKey((current) => current + 1);
      return;
    }

    const nextPreviewImage = URL.createObjectURL(file);

    revokePreviewUrl(previewImage);
    setPreviewImage(nextPreviewImage);
    setSelectedImage(file);
    setFeedback("이미지 준비가 완료됐습니다.");
  }

  function resetComposer() {
    setAuthor("");
    setVehicleName("");
    setSummary("");
    setBadge("");
    setStatus("상담 완료");
    setRating(5);
    setSelectedImage(null);
    revokePreviewUrl(previewImage);
    setPreviewImage("");
    setFileInputKey((current) => current + 1);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsAuthenticating(true);
    setFeedback("");
    setErrorMessage("");

    try {
      const session = await loginReviewAdminFn({
        data: { password: adminPassword },
      });

      startTransition(() => {
        setIsAuthenticated(session.authenticated);
        setIsComposerOpen(session.authenticated);
      });
      setAdminPassword("");
      setFeedback("관리자 로그인이 완료됐습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "로그인에 실패했습니다.");
    } finally {
      setIsAuthenticating(false);
    }
  }

  async function handleLogout() {
    setIsAuthenticating(true);
    setFeedback("");
    setErrorMessage("");

    try {
      await logoutReviewAdminFn();
      startTransition(() => {
        setIsAuthenticated(false);
        setIsComposerOpen(false);
      });
      resetComposer();
      setFeedback("관리자 로그아웃이 완료됐습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "로그아웃에 실패했습니다.");
    } finally {
      setIsAuthenticating(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setErrorMessage("");

    if (!selectedImage) {
      setErrorMessage("후기 이미지를 먼저 업로드해 주세요.");
      return;
    }

    const formData = new FormData();
    formData.set("author", author);
    formData.set("vehicleName", vehicleName);
    formData.set("summary", summary);
    formData.set("badge", badge);
    formData.set("status", status);
    formData.set("rating", String(rating));
    formData.set("image", selectedImage);

    setIsSubmitting(true);

    try {
      const createdReview = await createReviewFn({ data: formData });

      startTransition(() => {
        setReviews((current) => [createdReview, ...current]);
      });
      resetComposer();
      setIsComposerOpen(false);
      setFeedback("후기 카드가 서버에 저장됐습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "후기 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingReviewId(id);
    setFeedback("");
    setErrorMessage("");

    try {
      await deleteReviewFn({ data: { id } });
      startTransition(() => {
        setReviews((current) => current.filter((review) => review.id !== id));
      });
      setFeedback("후기 카드가 서버에서 삭제됐습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "후기 삭제에 실패했습니다.");
    } finally {
      setDeletingReviewId("");
    }
  }

  const customReviewCount = reviews.filter((review) => !review.id.startsWith("review-seed-")).length;
  const seedReviewCount = reviews.length - customReviewCount;

  return (
    <div className="bg-[linear-gradient(180deg,rgba(88,28,135,0.08),transparent_26%),linear-gradient(180deg,#fff,#f8f5ff_100%)]">
      <section className="relative overflow-hidden border-b border-border/70">
        <div
          className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.24),transparent_40%),radial-gradient(circle_at_top_right,rgba(79,70,229,0.18),transparent_42%)]"
          aria-hidden
        />
        <div className="container-x relative grid gap-8 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
          <div className="max-w-2xl">
            <span className="section-label">REVIEWS</span>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-sm font-medium text-primary shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-accent" />
              실제 상담 후기로 신뢰를 쌓는 섹션
            </div>
            <h1 className="mt-6 font-display text-4xl font-black leading-[1.05] tracking-tight text-primary md:text-6xl">
              후기 탭에서
              <br />
              사진 한 장과 한 줄 감도로
              <br />
              분위기를 만듭니다
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-foreground/70 md:text-lg">
              관리자가 직접 사진과 짧은 후기를 올리면 피드처럼 바로 쌓이는 구조입니다.
              지금은 브라우저 임시 저장이 아니라 서버 파일에 저장되도록 바꿔서, 관리자용 운영
              탭으로 바로 쓸 수 있게 연결했습니다.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(61,24,94,0.08)] backdrop-blur">
                <div className="text-sm font-medium text-muted-foreground">기본 후기</div>
                <div className="mt-2 font-display text-3xl font-black text-primary">
                  {seedReviewCount}
                </div>
              </div>
              <div className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(61,24,94,0.08)] backdrop-blur">
                <div className="text-sm font-medium text-muted-foreground">관리자 추가</div>
                <div className="mt-2 font-display text-3xl font-black text-primary">
                  {customReviewCount}
                </div>
              </div>
              <div className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(61,24,94,0.08)] backdrop-blur">
                <div className="text-sm font-medium text-muted-foreground">저장 위치</div>
                <div className="mt-2 text-lg font-bold text-primary">Server JSON + Uploads</div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-[0_30px_80px_rgba(61,24,94,0.12)] backdrop-blur md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/7 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  ADMIN UPLOAD
                </div>
                <h2 className="mt-4 text-2xl font-bold text-primary">
                  {isAuthenticated ? "후기 등록 패널" : "관리자 로그인"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {isAuthenticated
                    ? "사진, 차종, 별점, 상담 상태를 함께 올려서 더 운영감 있게 관리할 수 있습니다."
                    : "관리자 비밀번호를 통과하면 서버 저장형 후기 업로드 패널이 열립니다."}
                </p>
              </div>
              {isAuthenticated ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant={isComposerOpen ? "secondary" : "default"}
                    className={cn(
                      "h-11 rounded-full px-5",
                      isComposerOpen
                        ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        : "bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                    onClick={() => {
                      setIsComposerOpen((current) => !current);
                      setFeedback("");
                      setErrorMessage("");
                    }}
                  >
                    {isComposerOpen ? "업로드 닫기" : "관리자 업로드"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11 rounded-full px-4 text-primary hover:text-primary"
                    onClick={handleLogout}
                    disabled={isAuthenticating}
                  >
                    <LogOut className="h-4 w-4" /> 로그아웃
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="mt-6 rounded-[28px] bg-[linear-gradient(135deg,rgba(88,28,135,0.94),rgba(168,85,247,0.92))] p-5 text-primary-foreground">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-primary-foreground/70">
                    추천 운영 방식
                  </div>
                  <div className="mt-2 text-xl font-bold">
                    차량 사진 + 짧은 후기 + 별점 + 진행 배지
                  </div>
                </div>
                {isAuthenticated ? (
                  <Camera className="mt-1 h-6 w-6 text-accent-foreground" />
                ) : (
                  <LockKeyhole className="mt-1 h-6 w-6 text-accent-foreground" />
                )}
              </div>
              <p className="mt-4 text-sm leading-6 text-primary-foreground/78">
                무거운 장문 후기보다, 실제 사진과 한 줄 코멘트에 차종과 별점을 얹는 방식이
                모바일에서 더 빨리 읽히고 문의 전환에도 유리합니다.
              </p>
            </div>

            {!isAuthenticated ? (
              <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-primary" htmlFor="review-admin-password">
                    관리자 비밀번호
                  </label>
                  <Input
                    id="review-admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(event) => setAdminPassword(event.target.value)}
                    placeholder="운영 비밀번호 입력"
                    className="h-12 rounded-2xl border-border/80 bg-white"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-11 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
                  disabled={isAuthenticating}
                >
                  관리자 로그인
                </Button>
              </form>
            ) : null}

            {isAuthenticated && isComposerOpen ? (
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary" htmlFor="review-author">
                      고객명 또는 차량 태그
                    </label>
                    <Input
                      id="review-author"
                      value={author}
                      onChange={(event) => setAuthor(event.target.value)}
                      placeholder="예: 김서연 / 패밀리카"
                      className="h-11 rounded-2xl border-border/80 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary" htmlFor="review-vehicle-name">
                      차량명
                    </label>
                    <Input
                      id="review-vehicle-name"
                      value={vehicleName}
                      onChange={(event) => setVehicleName(event.target.value)}
                      placeholder="예: 카니발 하이리무진"
                      className="h-11 rounded-2xl border-border/80 bg-white"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary" htmlFor="review-badge">
                      짧은 배지 문구
                    </label>
                    <Input
                      id="review-badge"
                      value={badge}
                      onChange={(event) => setBadge(event.target.value)}
                      placeholder="예: 문의 전환"
                      className="h-11 rounded-2xl border-border/80 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary" htmlFor="review-status">
                      상담 상태
                    </label>
                    <select
                      id="review-status"
                      value={status}
                      onChange={(event) => setStatus(event.target.value as ReviewStatus)}
                      className="flex h-11 w-full rounded-2xl border border-input bg-white px-3 text-sm font-medium text-primary shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {reviewStatuses.map((statusOption) => (
                        <option key={statusOption} value={statusOption}>
                          {statusOption}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-primary" htmlFor="review-summary">
                    한 줄 후기
                  </label>
                  <Textarea
                    id="review-summary"
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    placeholder="예: 상담이 빨라서 생각보다 훨씬 수월하게 올렸어요."
                    className="min-h-28 rounded-[24px] border-border/80 bg-white px-4 py-3"
                  />
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-primary">별점</div>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((ratingOption) => (
                      <button
                        key={ratingOption}
                        type="button"
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-3 py-2 text-sm font-semibold transition-colors",
                          rating === ratingOption
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-white text-primary hover:border-primary/35",
                        )}
                        onClick={() => setRating(ratingOption)}
                      >
                        <Star className={cn("h-4 w-4", rating === ratingOption ? "fill-current" : "")} />
                        {ratingOption}점
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-primary" htmlFor={fileInputId}>
                    후기 사진
                  </label>
                  <label
                    htmlFor={fileInputId}
                    className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-primary/25 bg-primary/[0.03] px-5 py-8 text-center transition-colors hover:bg-primary/[0.05]"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-primary">클릭해서 사진 업로드</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        JPG, PNG, WEBP / 3MB 이하
                      </div>
                    </div>
                  </label>
                  <Input
                    key={fileInputKey}
                    id={fileInputId}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                <div className="rounded-[24px] border border-border/80 bg-neutral-bg p-4">
                  {previewImage ? (
                    <div className="grid gap-4 md:grid-cols-[180px_1fr] md:items-center">
                      <div className="overflow-hidden rounded-[20px] bg-white">
                        <img
                          src={previewImage}
                          alt="업로드할 후기 미리보기"
                          className="aspect-[4/5] h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-primary">업로드 미리보기</div>
                        <div className="mt-2 flex items-center gap-1">
                          {renderStars(rating, "dark")}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          저장 버튼을 누르면 서버에 저장되고, 차종과 상담 상태까지 함께 피드 맨 앞에
                          노출됩니다.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-28 flex-col items-center justify-center gap-2 text-center">
                      <ImagePlus className="h-6 w-6 text-primary/55" />
                      <div className="text-sm font-medium text-primary/75">
                        업로드한 사진 미리보기가 여기에 표시됩니다
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="submit"
                    className="h-11 rounded-full bg-accent px-6 text-accent-foreground hover:bg-accent/90"
                    disabled={isSubmitting}
                  >
                    후기 올리기
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11 rounded-full px-5 text-primary hover:text-primary"
                    onClick={resetComposer}
                  >
                    입력 초기화
                  </Button>
                </div>
              </form>
            ) : null}

            {errorMessage ? (
              <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </div>
            ) : null}
            {feedback ? (
              <div className="mt-4 rounded-2xl border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">
                {feedback}
              </div>
            ) : null}

            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              후기 데이터는 서버의 `.runtime/reviews.json`에 저장되고, 업로드 이미지는
              `public/uploads/reviews`에 저장됩니다.
            </p>
          </div>
        </div>
      </section>

      <section className="container-x py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="section-label">FEED</span>
            <h2 className="mt-3 text-3xl font-bold text-primary md:text-5xl">실제 후기 피드</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              과장된 배너보다, 실제 사용자가 남긴 짧은 한 줄과 이미지가 더 빠르게 신뢰를
              만듭니다. 여기에 차종, 별점, 상담 상태를 함께 붙여서 운영팀이 후기 품질을 더
              세밀하게 관리할 수 있게 만들었습니다.
            </p>
          </div>
          <div className="rounded-full border border-primary/10 bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm">
            총 {reviews.length}개 후기 노출 중
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-12">
          {reviews.map((review, index) => (
            <article
              key={review.id}
              className={cn(
                "group relative overflow-hidden rounded-[30px] border border-white/80 bg-white shadow-[0_20px_60px_rgba(49,16,78,0.08)]",
                gridClasses[index % gridClasses.length],
              )}
            >
              <div className="relative">
                <img
                  src={review.image}
                  alt={`${review.author} 후기 이미지`}
                  className={cn(
                    "w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]",
                    index % 3 === 0 ? "aspect-[4/4.4]" : "aspect-[4/3.4]",
                  )}
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t",
                    accentClasses[index % accentClasses.length],
                  )}
                  aria-hidden
                />
                <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      {review.badge}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold backdrop-blur",
                        statusClasses[review.status],
                      )}
                    >
                      {review.status}
                    </span>
                  </div>
                  {isAuthenticated ? (
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur transition hover:bg-black/35"
                      onClick={() => handleDelete(review.id)}
                      aria-label="후기 삭제"
                      disabled={deletingReviewId === review.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-6">
                  <div className="flex items-center gap-1">{renderStars(review.rating, "light")}</div>
                  <div className="mt-3 flex items-start gap-3">
                    <Quote className="mt-0.5 h-5 w-5 shrink-0 text-white/85" />
                    <p className="text-base font-medium leading-7 text-white/95 md:text-lg">
                      {review.summary}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-6">
                <div>
                  <div className="font-semibold text-primary">{review.author}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <CarFront className="h-3.5 w-3.5" /> {review.vehicleName}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {formatUploadDate(review.uploadedAt)} 업로드
                  </div>
                </div>
                <div className="rounded-full bg-primary/[0.04] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-primary">
                  REVIEW
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border/70 bg-white/70">
        <div className="container-x flex flex-col items-start justify-between gap-6 py-14 md:flex-row md:items-center">
          <div>
            <span className="section-label">NEXT</span>
            <h2 className="mt-3 text-3xl font-bold text-primary md:text-4xl">
              후기에서 신뢰를 만들고
              <br />
              상담 전환까지 이어가세요
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="h-12 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
              <Link to="/contact">상담 요청하기</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full px-6">
              <Link to="/listings">매물 둘러보기</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
