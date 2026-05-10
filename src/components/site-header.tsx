import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const navItems = [
  { label: "서비스 안내", to: "/transfer" },
  { label: "매물 보기", to: "/listings" },
  { label: "회사 소개", to: "/about" },
  { label: "FAQ", to: "/faq" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-x flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-1">
          <span className="font-display text-xl font-extrabold tracking-tight text-primary">
            YESCAR
          </span>
          <span className="font-display text-xl font-extrabold text-accent">+</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-foreground/75 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/contact">상담 신청</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="메뉴 열기"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-primary hover:bg-muted"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-primary text-primary-foreground">
              <SheetTitle className="text-primary-foreground">메뉴</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-medium text-primary-foreground/85 hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="mt-3 rounded-md bg-accent px-3 py-3 text-center text-base font-semibold text-accent-foreground"
                >
                  상담 신청
                </Link>
                <a
                  href="tel:1588-0000"
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-3 py-3 text-sm font-medium"
                >
                  <Phone className="h-4 w-4" /> 1588-0000
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
