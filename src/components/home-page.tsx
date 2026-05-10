import { Link } from "@tanstack/react-router";

import {
  Phone,
  Car,
  Search,
  ArrowRight,
  CheckCircle2,
  Youtube,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ListingCard } from "@/components/listing-card";
import { featuredListings } from "@/data/listings";

const stats = [
  { value: "17만+", label: "유튜브 구독자", highlight: false },
  { value: "3개", label: "직영 매매상사", highlight: false },
  { value: "1,200+", label: "누적 승계 알선", highlight: true },
  { value: "평균 7일", label: "승계 처리 기간", highlight: false },
];

const processSteps = [
  {
    t: "상담 접수",
    d: "차량·금융 정보를 받아 예스카플러스 매니저가 1:1 상담을 진행합니다.",
  },
  {
    t: "차량 분석",
    d: "잔여 리스/렌트 조건과 시세를 정밀 분석해 최적의 승계 전략을 제안합니다.",
  },
  {
    t: "성능 점검 & 광고 제작",
    d: "직영 매매상사에서 성능 점검 후 전문 사진·영상을 촬영하고 17만 채널과 플랫폼에 광고합니다.",
  },
  {
    t: "구매자 매칭 & 판매 완료",
    d: "구매자 상담부터 명의 이전, 판매 완료까지 예스카플러스 매니저가 전 과정을 책임집니다.",
  },
];

const faqs = [
  { q: "리스 승계 시 신용등급이 안 좋아도 가능한가요?", a: "캐피탈사별 심사 기준이 다르며, 다수의 제휴사를 통해 가능 여부를 검토해 드립니다." },
  { q: "위약금이 정말 0원인가요?", a: "정상적인 승계 절차로 진행되는 경우 양도자에게 부과되는 중도 해지 위약금은 발생하지 않습니다." },
  { q: "양수받을 때 보증금이 별도로 있나요?", a: "매물에 따라 보증금 유무가 다르며, 무보증금 매물도 다수 보유하고 있습니다." },
  { q: "잔여 기간이 6개월 남았는데 가능한가요?", a: "잔여 기간이 짧은 차량도 충분히 승계 가능하며, 오히려 인기 매물입니다." },
  { q: "수입차도 가능한가요?", a: "BMW, 벤츠, 아우디, 포르쉐 등 주요 수입 브랜드 모두 승계 알선이 가능합니다." },
];

const branches = [
  { name: "부천 직영점", area: "경기 부천시 원미구" },
  { name: "인천 직영점", area: "인천 남동구" },
  { name: "수원 직영점", area: "경기 수원시 영통구" },
];

export function HomePage() {
  const [processTab, setProcessTab] = useState<"seller" | "buyer">("seller");

  return (
    <div className="flex flex-col">
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 grid-pattern opacity-100" aria-hidden />
        <div className="absolute right-6 top-6 z-10 hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium backdrop-blur md:flex">
          <Phone className="h-4 w-4 text-accent" />
          <span>즉시 상담 1588-0000</span>
        </div>

        <div className="container-x relative grid min-h-[100vh] items-center gap-10 py-20 md:grid-cols-2 md:py-0">
          <div className="z-10">
            <span className="section-label">YESCAR PLUS</span>
            <h1 className="mt-4 text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[60px]">
              리스·렌트,
              <br />
              끝나기 전에 <span className="text-accent">넘기세요</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-primary-foreground/75 md:text-lg">
              위약금 없이, 평균 7일 안에 승계 완료. 17만 구독자가 검증한
              예스카의 승계 알선 서비스.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link to="/transfer">
                  <Car className="mr-2 h-5 w-5" /> 내 차 승계 맡기기
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              >
                <Link to="/listings">
                  <Search className="mr-2 h-5 w-5" /> 승계 매물 보기
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative z-10 hidden md:block">
            <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
              <img
                src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=80&auto=format&fit=crop"
                alt="프리미엄 차량"
                className="h-full w-full object-cover opacity-90"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust stats */}
      <section className="border-y border-border bg-background">
        <div className="container-x grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-background px-6 py-10 text-center">
              <div
                className={`font-display text-[32px] font-bold leading-none tracking-tight md:text-[48px] ${
                  s.highlight ? "text-success" : "text-primary"
                }`}
              >
                {s.value}
              </div>
              <div className="mt-3 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Audience */}
      <section className="bg-neutral-bg py-20 md:py-24">
        <div className="container-x">
          <div className="text-center">
            <span className="section-label">SERVICE</span>
            <h2 className="mt-3 text-3xl font-bold text-primary md:text-4xl">
              이런 분들이 이용합니다
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              {
                num: "①",
                title: "리스 위약금이 부담되시나요?",
                body: "남은 기간 납입금이 부담되거나 차를 정리해야 한다면, 위약금 없이 양도하세요.",
                cta: "승계 의뢰하기",
                href: "/transfer",
              },
              {
                num: "②",
                title: "초기비용 없이 차를 타고 싶으신가요?",
                body: "신차 출고 대기 없이, 검증된 매물을 합리적인 인수금으로 즉시 인수하세요.",
                cta: "매물 보기",
                href: "/listings",
              },
            ].map((c) => (
              <Card
                key={c.num}
                className="relative overflow-hidden border-border p-8 transition-all hover:-translate-y-1 hover:shadow-md md:p-10"
              >
                <span
                  className="pointer-events-none absolute -right-2 -top-6 font-display text-[200px] font-extrabold leading-none text-primary"
                  style={{ opacity: 0.08 }}
                >
                  {c.num}
                </span>
                <h3 className="text-xl font-bold text-primary md:text-2xl">{c.title}</h3>
                <p className="mt-3 max-w-md text-base text-muted-foreground">{c.body}</p>
                <Button asChild className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to={c.href}>
                    {c.cta} <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Process */}
      <section className="py-20 md:py-24">
        <div className="container-x">
          <div className="text-center">
            <span className="section-label">PROCESS</span>
            <h2 className="mt-3 text-3xl font-bold text-primary md:text-4xl">
              승계 프로세스
            </h2>
          </div>

          <p className="mx-auto mt-4 max-w-xl text-center text-base text-muted-foreground">
            상담부터 판매 완료까지, 예스카플러스 매니저가 모든 과정을 책임지고 진행합니다.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {processSteps.map((s, i) => (
              <div
                key={s.t}
                className="relative rounded-2xl border border-border bg-card p-6"
              >
                <div className="font-display text-sm font-bold text-accent">
                  STEP {String(i + 1).padStart(2, "0")}
                </div>
                <h4 className="mt-3 text-lg font-bold text-primary">{s.t}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured listings */}
      <section className="bg-neutral-bg py-20 md:py-24">
        <div className="container-x">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="section-label">FEATURED</span>
              <h2 className="mt-3 text-3xl font-bold text-primary md:text-4xl">
                추천 승계 매물
              </h2>
            </div>
            <Button asChild variant="ghost" className="text-accent hover:text-accent">
              <Link to="/listings">
                전체 보기 <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 -mx-6 overflow-x-auto px-6 pb-2 md:mx-0 md:px-0">
            <div className="grid grid-flow-col auto-cols-[80%] gap-5 md:grid-flow-row md:auto-cols-auto md:grid-cols-3">
              {featuredListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. About / YESCAR group */}
      <section className="py-20 md:py-24">
        <div className="container-x grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <span className="section-label">TRUSTED BY</span>
            <h2 className="mt-3 text-3xl font-bold text-primary md:text-4xl">
              17만 구독자가 선택한 신뢰
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              유튜브 채널 '예스카'는 17만 명의 구독자와 함께 자동차 금융의
              궁금증을 풀어드리고 있습니다.
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500 text-white">
                  <Youtube className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-primary">YESCAR 예스카</div>
                  <div className="text-sm text-muted-foreground">구독자 17만+</div>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-5 w-full border-border"
              >
                <a href="https://youtube.com" target="_blank" rel="noreferrer">
                  유튜브 채널 보기
                </a>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {branches.map((b) => (
              <div
                key={b.name}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="aspect-[4/3] bg-muted">
                  <img
                    src={`https://images.unsplash.com/photo-1493238792000-8113da705763?w=600&q=70&auto=format&fit=crop&sig=${b.name}`}
                    alt={b.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="font-bold text-primary">{b.name}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {b.area}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="bg-neutral-bg py-20 md:py-24">
        <div className="container-x max-w-3xl">
          <div className="text-center">
            <span className="section-label">FAQ</span>
            <h2 className="mt-3 text-3xl font-bold text-primary md:text-4xl">
              자주 묻는 질문 Top 5
            </h2>
          </div>

          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`q${i}`} className="border-border">
                <AccordionTrigger className="text-left text-base font-semibold text-primary hover:no-underline">
                  <span className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    {f.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-8 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-10 text-center">
            <Button asChild variant="outline">
              <Link to="/faq">전체 FAQ 보기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 8. Last CTA */}
      <section className="bg-accent text-accent-foreground">
        <div className="container-x py-16 text-center md:py-20">
          <h2 className="text-2xl font-bold md:text-4xl">
            지금 상담 신청하면 24시간 내 회신드립니다
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-accent-foreground/85">
            전문 컨설턴트가 차량 가치와 승계 가능성을 무료로 검토합니다.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-14 bg-white px-10 text-base font-bold text-accent transition-transform hover:scale-105 hover:bg-white"
          >
            <Link to="/contact">상담 신청하기</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
