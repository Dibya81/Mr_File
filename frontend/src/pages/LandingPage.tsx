import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import TrustBar from '../components/landing/TrustBar';
import ProblemSection from '../components/landing/ProblemSection';
import DetectionSection from '../components/landing/DetectionSection';
import ProcessingSection from '../components/landing/ProcessingSection';
import ExtractionSection from '../components/landing/ExtractionSection';
import OrganizationSection from '../components/landing/OrganizationSection';
import SecuritySection from '../components/landing/SecuritySection';
import SharingSection from '../components/landing/SharingSection';
import CTASection from '../components/landing/CTASection';
import LandingFooter from '../components/landing/LandingFooter';
import ScrollProgress from '../components/landing/ScrollProgress';
import { useThemeSync } from '../hooks/useThemeSync';

export default function LandingPage() {
  useThemeSync();
  return (
    <div className="min-h-screen">
      <ScrollProgress />
      <LandingNavbar />
      <main>
        <HeroSection />
        <TrustBar />
        <ProblemSection />
        <DetectionSection />
        <ProcessingSection />
        <ExtractionSection />
        <OrganizationSection />
        <SecuritySection />
        <SharingSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
