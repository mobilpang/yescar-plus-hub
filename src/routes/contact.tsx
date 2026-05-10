import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  component: () => (
    <section className="container-x flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span className="section-label">CONTACT</span>
      <h1 className="mt-4 text-3xl font-bold text-primary md:text-5xl">상담 신청</h1>
      <p className="mt-4 max-w-md text-base text-muted-foreground">
        상담 신청 폼은 다음 단계에서 공개됩니다. 급하시면 1588-0000으로 연락 주세요.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <a href="tel:1588-0000">전화 상담</a>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">홈으로</Link>
        </Button>
      </div>
    </section>
  ),
});
