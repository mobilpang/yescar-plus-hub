import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

function Placeholder({ title, desc }: { title: string; desc: string }) {
  return (
    <section className="container-x flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span className="section-label">COMING SOON</span>
      <h1 className="mt-4 text-3xl font-bold text-primary md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-md text-base text-muted-foreground">{desc}</p>
      <Button asChild className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
        <Link to="/">홈으로 돌아가기</Link>
      </Button>
    </section>
  );
}

export const Route = createFileRoute("/transfer")({
  component: () => (
    <Placeholder
      title="내 차 승계 의뢰"
      desc="양도 의뢰 페이지는 다음 단계에서 공개됩니다."
    />
  ),
});
