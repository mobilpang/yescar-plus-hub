import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/listings/$id")({
  component: ListingDetail,
});

function ListingDetail() {
  const { id } = Route.useParams();
  return (
    <section className="container-x flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span className="section-label">COMING SOON</span>
      <h1 className="mt-4 text-3xl font-bold text-primary md:text-5xl">
        매물 상세 ({id})
      </h1>
      <p className="mt-4 max-w-md text-base text-muted-foreground">
        매물 상세 페이지는 다음 단계에서 공개됩니다.
      </p>
      <Button asChild className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
        <Link to="/">홈으로 돌아가기</Link>
      </Button>
    </section>
  );
}
