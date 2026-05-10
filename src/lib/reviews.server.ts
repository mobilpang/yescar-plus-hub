import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getRequest, getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import { defaultReviews, reviewStatuses, type ReviewAdminSession, type ReviewItem, type ReviewStatus } from "@/data/reviews";

const reviewRuntimeDirectory = path.join(process.cwd(), ".runtime");
const reviewDataFile = path.join(reviewRuntimeDirectory, "reviews.json");
const reviewUploadDirectory = path.join(process.cwd(), "public", "uploads", "reviews");
const reviewSessionCookie = "yescar-review-admin";
const reviewSessionMaxAge = 60 * 60 * 12;
const reviewUploadLimitInBytes = 3 * 1024 * 1024;

const allowedImageTypes = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

type CreateReviewInput = {
  author: string;
  vehicleName: string;
  summary: string;
  badge: string;
  rating: number;
  status: ReviewStatus;
  imageFile: File;
};

function getAdminPassword() {
  return process.env.REVIEWS_ADMIN_PASSWORD ?? "yescar-admin-2026!";
}

function getAdminSecret() {
  return process.env.REVIEWS_ADMIN_SECRET ?? `${getAdminPassword()}::review-session`;
}

function encodeBase64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function decodeBase64Url(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function createSessionSignature(payload: string) {
  return crypto.createHmac("sha256", getAdminSecret()).update(payload).digest("base64url");
}

function serializeSessionCookie(value: string, maxAge: number) {
  const request = getRequest();
  const isSecureRequest = new URL(request.url).protocol === "https:";
  const cookieParts = [
    `${reviewSessionCookie}=${value}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${maxAge}`,
  ];

  if (isSecureRequest) {
    cookieParts.splice(1, 0, "Secure");
  }

  return cookieParts.join("; ");
}

function parseCookieValue(cookieName: string) {
  const cookieHeader = getRequestHeader("cookie");

  if (!cookieHeader) {
    return null;
  }

  for (const cookiePart of cookieHeader.split(/;\s*/)) {
    const separatorIndex = cookiePart.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    if (cookiePart.slice(0, separatorIndex) === cookieName) {
      return cookiePart.slice(separatorIndex + 1);
    }
  }

  return null;
}

function createAdminSessionToken() {
  const payload = encodeBase64Url(
    JSON.stringify({
      scope: "review-admin",
      exp: Date.now() + reviewSessionMaxAge * 1000,
    }),
  );
  const signature = createSessionSignature(payload);

  return `${payload}.${signature}`;
}

function readAdminSessionToken() {
  const token = parseCookieValue(reviewSessionCookie);

  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = createSessionSignature(payload);

  if (signature.length !== expectedSignature.length) {
    return null;
  }

  const isSignatureValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );

  if (!isSignatureValid) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as { exp?: number; scope?: string };

    if (parsed.scope !== "review-admin") {
      return null;
    }

    if (typeof parsed.exp !== "number" || parsed.exp <= Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function sortReviews(reviews: ReviewItem[]) {
  return [...reviews].sort((left, right) => {
    return new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime();
  });
}

function isReviewStatus(value: unknown): value is ReviewStatus {
  return typeof value === "string" && reviewStatuses.includes(value as ReviewStatus);
}

function isReviewItem(value: unknown): value is ReviewItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const review = value as Record<string, unknown>;

  return (
    typeof review.id === "string" &&
    typeof review.author === "string" &&
    typeof review.vehicleName === "string" &&
    typeof review.summary === "string" &&
    typeof review.image === "string" &&
    typeof review.uploadedAt === "string" &&
    typeof review.badge === "string" &&
    typeof review.rating === "number" &&
    review.rating >= 1 &&
    review.rating <= 5 &&
    isReviewStatus(review.status)
  );
}

async function ensureReviewDirectories() {
  await fs.mkdir(reviewRuntimeDirectory, { recursive: true });
  await fs.mkdir(reviewUploadDirectory, { recursive: true });
}

async function writeReviewsStore(reviews: ReviewItem[]) {
  await ensureReviewDirectories();
  await fs.writeFile(reviewDataFile, JSON.stringify(sortReviews(reviews), null, 2), "utf8");
}

function sanitizeFileSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || "review";
}

async function removeStoredImage(imagePath: string) {
  if (!imagePath.startsWith("/uploads/reviews/")) {
    return;
  }

  const targetPath = path.join(reviewUploadDirectory, path.basename(imagePath));

  try {
    await fs.rm(targetPath, { force: true });
  } catch {
    // Ignore image cleanup errors so metadata deletion still succeeds.
  }
}

export async function readReviewsStore() {
  await ensureReviewDirectories();

  try {
    const rawValue = await fs.readFile(reviewDataFile, "utf8");
    const parsed = JSON.parse(rawValue);

    if (Array.isArray(parsed) && parsed.every(isReviewItem)) {
      return sortReviews(parsed);
    }
  } catch {
    // Fall through to reset with seeded reviews.
  }

  await writeReviewsStore(defaultReviews);
  return sortReviews(defaultReviews);
}

export function getReviewAdminSessionState(): ReviewAdminSession {
  return {
    authenticated: readAdminSessionToken() !== null,
  };
}

export function loginReviewAdminSession(password: string): ReviewAdminSession {
  if (password !== getAdminPassword()) {
    throw new Error("관리자 비밀번호가 올바르지 않습니다.");
  }

  setResponseHeader("Set-Cookie", serializeSessionCookie(createAdminSessionToken(), reviewSessionMaxAge));

  return { authenticated: true };
}

export function logoutReviewAdminSession(): ReviewAdminSession {
  setResponseHeader("Set-Cookie", serializeSessionCookie("", 0));
  return { authenticated: false };
}

export function requireReviewAdminSession() {
  if (!readAdminSessionToken()) {
    throw new Error("관리자 로그인 후 사용할 수 있습니다.");
  }
}

export async function createStoredReview(input: CreateReviewInput) {
  requireReviewAdminSession();

  if (input.imageFile.size > reviewUploadLimitInBytes) {
    throw new Error("이미지는 3MB 이하로 업로드해 주세요.");
  }

  const imageExtension = allowedImageTypes.get(input.imageFile.type);

  if (!imageExtension) {
    throw new Error("JPG, PNG, WEBP 이미지로 업로드해 주세요.");
  }

  await ensureReviewDirectories();

  const nextFileName = `${Date.now()}-${sanitizeFileSegment(input.vehicleName)}-${crypto.randomUUID()}.${imageExtension}`;
  const nextImagePath = path.join(reviewUploadDirectory, nextFileName);
  const imageBuffer = Buffer.from(await input.imageFile.arrayBuffer());

  await fs.writeFile(nextImagePath, imageBuffer);

  const nextReview: ReviewItem = {
    id: crypto.randomUUID(),
    author: input.author.trim(),
    vehicleName: input.vehicleName.trim(),
    summary: input.summary.trim(),
    image: `/uploads/reviews/${nextFileName}`,
    uploadedAt: new Date().toISOString(),
    badge: input.badge.trim() || input.status,
    rating: input.rating,
    status: input.status,
  };

  const currentReviews = await readReviewsStore();
  const nextReviews = [nextReview, ...currentReviews];

  await writeReviewsStore(nextReviews);

  return nextReview;
}

export async function deleteStoredReview(id: string) {
  requireReviewAdminSession();

  const currentReviews = await readReviewsStore();
  const reviewToDelete = currentReviews.find((review) => review.id === id);

  if (!reviewToDelete) {
    throw new Error("삭제할 후기를 찾지 못했습니다.");
  }

  await removeStoredImage(reviewToDelete.image);
  await writeReviewsStore(currentReviews.filter((review) => review.id !== id));

  return { id };
}
