import { type ReactNode } from "react";
import MarketingNav from "./_components/nav";
import MarketingFooter from "./_components/footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
