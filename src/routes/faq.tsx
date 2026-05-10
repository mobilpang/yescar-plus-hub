import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/faq")({
  component: () => (
    <section className="container-x flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span className="section-label">FAQ</span>
      <h1 className="mt-4 text-3xl font-bold text-primary md:text-5xl">자주 묻는 질문</h1>
      <p className="mt-4 max-w-md text-base text-muted-foreground">
        전체 FAQ 페이지는 다음 단계에서 공개됩니다.
      </p>
      <Button asChild className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
        <Link to="/">홈으로 돌아가기</Link>
      </Button>
    </section>
  ),
});
