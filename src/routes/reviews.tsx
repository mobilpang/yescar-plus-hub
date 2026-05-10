import { createFileRoute } from "@tanstack/react-router";
import { ReviewsPage } from "@/components/reviews-page";
import { getReviewAdminSession, getReviews, getReviewStorage } from "@/lib/reviews.functions";

export const Route = createFileRoute("/reviews")({
  loader: async () => {
    const [initialReviews, adminSession, storageInfo] = await Promise.all([
      getReviews(),
      getReviewAdminSession(),
      getReviewStorage(),
    ]);

    return {
      adminSession,
      initialReviews,
      storageInfo,
    };
  },
  component: ReviewsRouteComponent,
});

function ReviewsRouteComponent() {
  const { adminSession, initialReviews, storageInfo } = Route.useLoaderData();

  return (
    <ReviewsPage
      initialAuthenticated={adminSession.authenticated}
      initialReviews={initialReviews}
      initialStorageInfo={storageInfo}
    />
  );
}
