import { CallToActionSection } from '../components/home/CallToActionSection';
import { CourseCategoriesSection } from '../components/home/CourseCategoriesSection';
import { FaqSection } from '../components/home/FaqSection';
import { FeaturedCoursesSection } from '../components/home/FeaturedCoursesSection';
import { HeroSection } from '../components/home/HeroSection';
import { LearningProcessSection } from '../components/home/LearningProcessSection';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { TrustIndicators } from '../components/home/TrustIndicators';
import { WhyChooseUsSection } from '../components/home/WhyChooseUsSection';

export function HomePage() {
  return (
    <div className="landing-page">
      <HeroSection />
      <TrustIndicators />
      <CourseCategoriesSection />
      <FeaturedCoursesSection />
      <WhyChooseUsSection />
      <LearningProcessSection />
      <TestimonialsSection />
      <CallToActionSection />
      <FaqSection />
    </div>
  );
}
