import { useState } from "react";
import { Phone, MessageCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function FloatingActions() {
  const [open, setOpen] = useState<null | "kakao" | "phone">(null);

  return (
    <>
      <div className="fixed bottom-5 right-5 z-30 flex flex-col gap-3 md:hidden">
        <button
          aria-label="카카오톡 상담"
          onClick={() => setOpen("kakao")}
          className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
          style={{ backgroundColor: "#FEE500", color: "#1A1A1A" }}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
        <button
          aria-label="전화 상담"
          onClick={() => setOpen("phone")}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
        >
          <Phone className="h-6 w-6" />
        </button>
      </div>

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {open === "kakao" ? "카카오톡 상담" : "전화 상담"}
            </DialogTitle>
            <DialogDescription>
              {open === "kakao"
                ? "카카오톡 채널로 연결됩니다. 평일 09:00 - 19:00 답변드립니다."
                : "대표번호 1588-0000으로 연결됩니다."}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex flex-col gap-2">
            {open === "kakao" ? (
              <Button
                style={{ backgroundColor: "#FEE500", color: "#1A1A1A" }}
                className="hover:opacity-90"
                onClick={() => window.open("https://pf.kakao.com/", "_blank")}
              >
                카카오톡 채널 열기
              </Button>
            ) : (
              <Button asChild className="bg-primary text-primary-foreground">
                <a href="tel:1588-0000">1588-0000 전화 걸기</a>
              </Button>
            )}
            <Button variant="ghost" onClick={() => setOpen(null)}>
              <X className="mr-1 h-4 w-4" /> 닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
