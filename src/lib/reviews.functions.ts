import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { reviewStatuses } from "@/data/reviews";
import {
  createStoredReview,
  deleteStoredReview,
  getReviewAdminSessionState,
  loginReviewAdminSession,
  logoutReviewAdminSession,
  readReviewsStore,
} from "@/lib/reviews.server";

const reviewStatusSchema = z.enum(reviewStatuses);

const loginReviewAdminSchema = z.object({
  password: z.string().min(1, "관리자 비밀번호를 입력해 주세요."),
});

const deleteReviewSchema = z.object({
  id: z.string().min(1),
});

function createReviewFormValidator(data: unknown) {
  if (!(data instanceof FormData)) {
    throw new Error("후기 업로드 요청 형식이 올바르지 않습니다.");
  }

  const imageFile = data.get("image");

  if (!(imageFile instanceof File)) {
    throw new Error("후기 이미지를 선택해 주세요.");
  }

  return z
    .object({
      author: z.string().trim().min(1, "고객명 또는 차량 태그를 입력해 주세요."),
      vehicleName: z.string().trim().min(1, "차량명을 입력해 주세요."),
      summary: z.string().trim().min(1, "한 줄 후기를 입력해 주세요."),
      badge: z.string().trim().max(20).optional().default(""),
      rating: z.number().int().min(1).max(5),
      status: reviewStatusSchema,
      imageFile: z.instanceof(File),
    })
    .parse({
      author: data.get("author"),
      vehicleName: data.get("vehicleName"),
      summary: data.get("summary"),
      badge: data.get("badge"),
      rating: Number(data.get("rating")),
      status: data.get("status"),
      imageFile,
    });
}

export const getReviews = createServerFn({ method: "GET" }).handler(async () => {
  return readReviewsStore();
});

export const getReviewAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  return getReviewAdminSessionState();
});

export const loginReviewAdmin = createServerFn({ method: "POST" })
  .inputValidator(loginReviewAdminSchema)
  .handler(async ({ data }) => {
    return loginReviewAdminSession(data.password);
  });

export const logoutReviewAdmin = createServerFn({ method: "POST" }).handler(async () => {
  return logoutReviewAdminSession();
});

export const createReview = createServerFn({ method: "POST" })
  .inputValidator(createReviewFormValidator)
  .handler(async ({ data }) => {
    return createStoredReview(data);
  });

export const deleteReview = createServerFn({ method: "POST" })
  .inputValidator(deleteReviewSchema)
  .handler(async ({ data }) => {
    return deleteStoredReview(data.id);
  });
