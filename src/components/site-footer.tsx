import { Link } from "@tanstack/react-router";

const branches = [
  { name: "부천 직영점", address: "경기 부천시 원미구 (예시 주소)" },
  { name: "인천 직영점", address: "인천 남동구 (예시 주소)" },
  { name: "수원 직영점", address: "경기 수원시 영통구 (예시 주소)" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="font-display text-2xl font-extrabold">
              YESCAR<span className="text-accent">+</span>
            </div>
            <p className="mt-3 text-sm text-primary-foreground/70">
              리스·렌트 승계 알선 전문 그룹
              <br />
              예스카 플러스
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-primary-foreground/90">사업자 정보</h4>
            <ul className="mt-3 space-y-1.5 text-sm text-primary-foreground/65">
              <li>상호: 예스카 플러스</li>
              <li>대표: 홍길동</li>
              <li>사업자등록번호: 000-00-00000</li>
              <li>자동차매매업 등록번호: 000-00-00000</li>
              <li>대표전화: 1588-0000</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-primary-foreground/90">직영 매매상사</h4>
            <ul className="mt-3 space-y-1.5 text-sm text-primary-foreground/65">
              {branches.map((b) => (
                <li key={b.name}>
                  <span className="text-primary-foreground/90">{b.name}</span>
                  <br />
                  <span className="text-xs">{b.address}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-primary-foreground/90">고객 지원</h4>
            <ul className="mt-3 space-y-1.5 text-sm text-primary-foreground/65">
              <li>
                <Link to="/faq" className="hover:text-primary-foreground">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-foreground">
                  상담 신청
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground">개인정보처리방침</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground">이용약관</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} YESCAR PLUS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
