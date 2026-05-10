import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import type { Listing } from "@/data/listings";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={listing.imageUrl}
          alt={`${listing.brand} ${listing.model}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge
            variant="secondary"
            className="bg-accent/10 text-accent hover:bg-accent/10"
          >
            {listing.financeType === "lease" ? "리스" : "렌트"}
          </Badge>
          {listing.deposit === 0 && (
            <Badge className="bg-success text-success-foreground hover:bg-success">
              무보증금
            </Badge>
          )}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-base font-bold text-primary">
            {listing.brand} {listing.model}
          </h3>
          <span className="text-xs text-muted-foreground">{listing.year}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {listing.mileage.toLocaleString()} km · {listing.fuelType}
        </p>

        <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="text-[11px] text-muted-foreground">월 납입금</p>
            <p className="font-display text-2xl font-bold text-primary">
              {listing.monthlyPayment}
              <span className="ml-0.5 text-sm font-semibold">만원</span>
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>
              잔여 <span className="font-semibold text-foreground">{listing.remainingMonths}개월</span>
            </p>
            <p className="mt-0.5">
              인수금 <span className="font-semibold text-foreground">{listing.takeoverFee}만원</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
