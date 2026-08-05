import { LandingHeader } from "../features/landing/components/LandingHeader";
import { LandingHero } from "../features/landing/components/LandingHero";
import { FeatureHighlights } from "../features/landing/components/FeatureHighlights";
import { LandingFooter } from "../features/landing/components/LandingFooter";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-text-primary">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <FeatureHighlights />
      </main>
      <LandingFooter />
    </div>
  );
}

export default LandingPage;
