import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { del, get, put } from "@vercel/blob";
import { getRequest, getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import {
  defaultReviews,
  reviewStatuses,
  type ReviewAdminSession,
  type ReviewItem,
  type ReviewStatus,
  type ReviewStorageInfo,
} from "@/data/reviews";

const reviewRuntimeDirectory = path.join(process.cwd(), ".runtime");
const reviewDataFile = path.join(reviewRuntimeDirectory, "reviews.json");
const reviewUploadDirectory = path.join(process.cwd(), "public", "uploads", "reviews");
const reviewSessionCookie = "yescar-review-admin";
const reviewSessionMaxAge = 60 * 60 * 12;
const reviewUploadLimitInBytes = 3 * 1024 * 1024;
const metadataBlobPath = "reviews/store/reviews.json";
const reviewBlobImageDirectory = "reviews/images";
const metadataBlobCacheSeconds = 60;
const imageBlobCacheSeconds = 60 * 60 * 24 * 30;

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

function isBlobStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isVercelRuntime() {
  return Boolean(process.env.VERCEL);
}

function getReviewStorageMode(): ReviewStorageInfo["mode"] {
  if (isBlobStorageConfigured()) {
    return "vercel-blob";
  }

  if (isVercelRuntime()) {
    return "vercel-missing-blob";
  }

  return "filesystem";
}

function assertReviewWritesAvailable() {
  if (getReviewStorageMode() === "vercel-missing-blob") {
    throw new Error(
      "Vercel Blob이 연결되지 않아 후기 저장을 사용할 수 없습니다. Vercel Storage에서 Blob을 만들고 `BLOB_READ_WRITE_TOKEN` 환경 변수를 연결해 주세요.",
    );
  }
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

async function ensureFilesystemDirectories() {
  await fs.mkdir(reviewRuntimeDirectory, { recursive: true });
  await fs.mkdir(reviewUploadDirectory, { recursive: true });
}

async function writeFilesystemReviewsStore(reviews: ReviewItem[]) {
  await ensureFilesystemDirectories();
  await fs.writeFile(reviewDataFile, JSON.stringify(sortReviews(reviews), null, 2), "utf8");
}

async function writeBlobReviewsStore(reviews: ReviewItem[]) {
  await put(metadataBlobPath, JSON.stringify(sortReviews(reviews), null, 2), {
    access: "public",
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
    cacheControlMaxAge: metadataBlobCacheSeconds,
  });
}

async function writeReviewsStore(reviews: ReviewItem[]) {
  switch (getReviewStorageMode()) {
    case "vercel-blob":
      await writeBlobReviewsStore(reviews);
      return;
    case "filesystem":
      await writeFilesystemReviewsStore(reviews);
      return;
    case "vercel-missing-blob":
      throw new Error(
        "Vercel Blob이 연결되지 않아 후기 저장을 완료할 수 없습니다. `BLOB_READ_WRITE_TOKEN`을 먼저 설정해 주세요.",
      );
  }
}

function sanitizeFileSegment(value: string) {
  return (
    value
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "review"
  );
}

function isBlobImageUrl(imagePath: string) {
  return imagePath.includes(".blob.vercel-storage.com/");
}

async function removeStoredImage(imagePath: string) {
  if (imagePath.startsWith("/uploads/reviews/")) {
    const targetPath = path.join(reviewUploadDirectory, path.basename(imagePath));

    try {
      await fs.rm(targetPath, { force: true });
    } catch {
      // Ignore image cleanup errors so metadata deletion still succeeds.
    }

    return;
  }

  if (!isBlobImageUrl(imagePath)) {
    return;
  }

  try {
    await del(imagePath);
  } catch {
    // Ignore image cleanup errors so metadata deletion still succeeds.
  }
}

async function readBlobText(blobPath: string) {
  const blob = await get(blobPath, { access: "public" });

  if (!blob || blob.statusCode !== 200 || !blob.stream) {
    return null;
  }

  return new Response(blob.stream).text();
}

async function readBlobReviewsStore() {
  try {
    const rawValue = await readBlobText(metadataBlobPath);

    if (rawValue) {
      const parsed = JSON.parse(rawValue);

      if (Array.isArray(parsed) && parsed.every(isReviewItem)) {
        return sortReviews(parsed);
      }
    }
  } catch {
    // Fall through to reset with seeded reviews.
  }

  await writeBlobReviewsStore(defaultReviews);
  return sortReviews(defaultReviews);
}

async function readFilesystemReviewsStore() {
  await ensureFilesystemDirectories();

  try {
    const rawValue = await fs.readFile(reviewDataFile, "utf8");
    const parsed = JSON.parse(rawValue);

    if (Array.isArray(parsed) && parsed.every(isReviewItem)) {
      return sortReviews(parsed);
    }
  } catch {
    // Fall through to reset with seeded reviews.
  }

  await writeFilesystemReviewsStore(defaultReviews);
  return sortReviews(defaultReviews);
}

async function storeReviewImageOnFilesystem(imageFile: File, vehicleName: string, imageExtension: string) {
  await ensureFilesystemDirectories();

  const nextFileName = `${Date.now()}-${sanitizeFileSegment(vehicleName)}-${crypto.randomUUID()}.${imageExtension}`;
  const nextImagePath = path.join(reviewUploadDirectory, nextFileName);
  const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

  await fs.writeFile(nextImagePath, imageBuffer);

  return `/uploads/reviews/${nextFileName}`;
}

async function storeReviewImageOnBlob(imageFile: File, vehicleName: string, imageExtension: string) {
  const nextFileName = `${Date.now()}-${sanitizeFileSegment(vehicleName)}-${crypto.randomUUID()}.${imageExtension}`;
  const blob = await put(`${reviewBlobImageDirectory}/${nextFileName}`, imageFile, {
    access: "public",
    contentType: imageFile.type,
    cacheControlMaxAge: imageBlobCacheSeconds,
  });

  return blob.url;
}

async function storeReviewImage(imageFile: File, vehicleName: string, imageExtension: string) {
  if (getReviewStorageMode() === "vercel-blob") {
    return storeReviewImageOnBlob(imageFile, vehicleName, imageExtension);
  }

  return storeReviewImageOnFilesystem(imageFile, vehicleName, imageExtension);
}

export async function readReviewsStore() {
  switch (getReviewStorageMode()) {
    case "vercel-blob":
      return readBlobReviewsStore();
    case "filesystem":
      return readFilesystemReviewsStore();
    case "vercel-missing-blob":
      return sortReviews(defaultReviews);
  }
}

export function getReviewStorageInfo(): ReviewStorageInfo {
  switch (getReviewStorageMode()) {
    case "vercel-blob":
      return {
        mode: "vercel-blob",
        label: "Vercel Blob",
        note: "후기 데이터와 이미지는 Vercel Blob에 영구 저장됩니다.",
        uploadsEnabled: true,
      };
    case "filesystem":
      return {
        mode: "filesystem",
        label: "Local JSON + uploads",
        note: "후기 데이터는 `.runtime/reviews.json`에, 이미지는 `public/uploads/reviews`에 저장됩니다.",
        uploadsEnabled: true,
      };
    case "vercel-missing-blob":
      return {
        mode: "vercel-missing-blob",
        label: "Blob setup required",
        note: "Vercel 배포에서는 `BLOB_READ_WRITE_TOKEN` 환경 변수를 연결해야 후기 업로드가 영구 저장됩니다.",
        uploadsEnabled: false,
      };
  }
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
    throw new Error("관리자 로그인이 필요합니다.");
  }
}

export async function createStoredReview(input: CreateReviewInput) {
  requireReviewAdminSession();
  assertReviewWritesAvailable();

  if (input.imageFile.size > reviewUploadLimitInBytes) {
    throw new Error("이미지는 3MB 이하로 업로드해 주세요.");
  }

  const imageExtension = allowedImageTypes.get(input.imageFile.type);

  if (!imageExtension) {
    throw new Error("JPG, PNG, WEBP 이미지만 업로드할 수 있습니다.");
  }

  const nextImage = await storeReviewImage(input.imageFile, input.vehicleName, imageExtension);
  const nextReview: ReviewItem = {
    id: crypto.randomUUID(),
    author: input.author.trim(),
    vehicleName: input.vehicleName.trim(),
    summary: input.summary.trim(),
    image: nextImage,
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
  assertReviewWritesAvailable();

  const currentReviews = await readReviewsStore();
  const reviewToDelete = currentReviews.find((review) => review.id === id);

  if (!reviewToDelete) {
    throw new Error("삭제할 후기를 찾지 못했습니다.");
  }

  await removeStoredImage(reviewToDelete.image);
  await writeReviewsStore(currentReviews.filter((review) => review.id !== id));

  return { id };
}
