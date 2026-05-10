import { createFileRoute } from "@tanstack/react-router";
import { ReviewsPage } from "@/components/reviews-page";
import { getReviewAdminSession, getReviews } from "@/lib/reviews.functions";

export const Route = createFileRoute("/reviews")({
  loader: async () => {
    const [initialReviews, adminSession] = await Promise.all([
      getReviews(),
      getReviewAdminSession(),
    ]);

    return {
      adminSession,
      initialReviews,
    };
  },
  component: ReviewsRouteComponent,
});

function ReviewsRouteComponent() {
  const { adminSession, initialReviews } = Route.useLoaderData();

  return (
    <ReviewsPage
      initialAuthenticated={adminSession.authenticated}
      initialReviews={initialReviews}
    />
  );
}
