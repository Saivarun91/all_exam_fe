import Header from "@/components/layout/Header";
import HeroSection from "@/components/HeroSection";
import TopCategories from "@/components/TopCategories";
import FeaturedExams from "@/components/FeaturedExams";
import ValuePropositions from "@/components/ValuePropositions";
import AnalyticsSection from "@/components/AnalyticsSection";
import PopularProviders from "@/components/PopularProviders";
import RecentlyUpdated from "@/components/RecentlyUpdated";
import BlogSection from "@/components/BlogSection";
import EmailSubscribe from "@/components/EmailSubscribe";
import HomeFAQ from "@/components/HomeFAQ";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <TopCategories />
        <FeaturedExams />
        <ValuePropositions />
        <AnalyticsSection />
        <PopularProviders />
        <RecentlyUpdated />
        <BlogSection />
        <EmailSubscribe />
        <HomeFAQ />
      </main>
      <Footer />
    </div>
  );
}
