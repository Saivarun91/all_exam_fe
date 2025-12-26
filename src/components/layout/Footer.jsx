"use client";

import { GraduationCap, Facebook, Twitter, Linkedin, Youtube, Shield, Mail, Phone, MapPin, Globe } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSiteName } from "@/hooks/useSiteName";
import { useContactDetails } from "@/hooks/useContactDetails";
import { useLogoUrl } from "@/hooks/useLogoUrl";
import { getOptimizedImageUrl } from "@/utils/imageUtils";

/**
 * Footer Component
 * 
 * IMPORTANT: This footer is IDENTICAL for both logged-in and non-logged-in users.
 * There is NO conditional rendering based on authentication status.
 * All sections and links are visible and functional for ALL users.
 * 
 * This footer dynamically fetches data from the API and only shows what exists in the website.
 */
const Footer = () => {
  const pathname = usePathname();
  const siteName = useSiteName();
  const contactDetails = useContactDetails();
  const logoUrl = useLogoUrl();

  // Don't show footer on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  // Fetch providers dynamically
  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        // Fetch providers
        const providersRes = await fetch(`${API_BASE_URL}/api/providers/`);
        if (providersRes.ok) {
          const providersData = await providersRes.json();
          if (Array.isArray(providersData)) {
            setProviders(providersData.filter(p => p.is_active !== false).slice(0, 10)); // Limit to 10 providers
          }
        }
      } catch (error) {
        console.error("Error fetching footer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  // Available resources pages (only show what exists)
  const availableResources = [
    { name: "Blog", href: "/blog", exists: true },
    { name: "FAQ", href: "/FAQ", exists: true },
  ];

  // Company pages (only show if they exist - currently none exist, so empty)
  const availableCompanyPages = [];

  // Legal pages (only show if they exist)
  const availableLegalPages = [
    { name: "Privacy Policy", href: "/privacy-policy", exists: true },
    { name: "Terms & Conditions", href: "/terms-and-conditions", exists: true },
    { name: "Refund & Cancellation Policy", href: "/refund-and-cancellation-policy", exists: true },
    { name: "Disclaimer", href: "/disclaimer", exists: true },
    { name: "Contact Us", href: "/contact-us", exists: true },
  ];

  const socialLinks = [
    { icon: Facebook, label: "Facebook", url: "https://www.facebook.com" },
    { icon: Twitter, label: "Twitter", url: "https://www.twitter.com" },
    { icon: Linkedin, label: "LinkedIn", url: "https://www.linkedin.com" },
    { icon: Youtube, label: "YouTube", url: "https://www.youtube.com" },
  ];

  // Check if any contact details are available (must be non-empty strings)
  const hasEmail = contactDetails.email && contactDetails.email.trim().length > 0;
  const hasPhone = contactDetails.phone && contactDetails.phone.trim().length > 0;
  const hasAddress = contactDetails.address && contactDetails.address.trim().length > 0;
  const hasWebsite = contactDetails.website && contactDetails.website.trim().length > 0;
  const hasContactDetails = hasEmail || hasPhone || hasAddress || hasWebsite;

  // Calculate grid columns based on available sections
  const hasProviders = providers.length > 0;
  const hasResources = availableResources.length > 0;
  const hasCompany = availableCompanyPages.length > 0;
  const hasLegal = availableLegalPages.length > 0;
  
  const visibleSections = [hasProviders, hasResources, hasCompany, hasLegal, hasContactDetails].filter(Boolean).length;
  const gridCols = visibleSections <= 2 ? 'md:grid-cols-2' : 
                   visibleSections <= 3 ? 'md:grid-cols-3' : 
                   visibleSections <= 4 ? 'md:grid-cols-4' : 
                   visibleSections <= 5 ? 'md:grid-cols-5' : 'md:grid-cols-6';


  // Helper function to get provider URL
  const getProviderUrl = (provider) => {
    if (provider.slug) {
      return `/exams/${provider.slug}`;
    }
    if (provider.name) {
      const slug = provider.name.toLowerCase().replace(/\s+/g, '-');
      return `/exams/${slug}`;
    }
    return "#";
  };

  return (
    <footer className="bg-gradient-to-br from-[#0C1A35] to-[#0E2444] text-white border-t border-[#1A73E8]/20">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${gridCols} gap-4 md:gap-6 mb-6 md:mb-8`}>
          {/* Providers Section - Only show if providers exist */}
          {hasProviders && (
            <div>
              <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3 text-[#F5F8FF]">Providers</h3>
              <ul className="space-y-1 md:space-y-1.5">
                {loading ? (
                  <li className="text-[#F0F4FF] text-xs md:text-sm">Loading...</li>
                ) : providers.length > 0 ? (
                  providers.map((provider, index) => (
                    <li key={index}>
                      <Link
                        href={getProviderUrl(provider)}
                        className="text-[#F0F4FF] hover:text-[#1A73E8] transition-colors text-xs md:text-sm"
                      >
                        {provider.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-[#F0F4FF]/85 text-xs md:text-sm">No providers available</li>
                )}
              </ul>
            </div>
          )}

          {/* Resources Section - Only show if resources exist */}
          {hasResources && (
            <div>
              <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3 text-[#F5F8FF]">Resources</h3>
              <ul className="space-y-1 md:space-y-1.5">
                {availableResources.filter(resource => resource.exists).map((resource, index) => (
                  <li key={index}>
                    <Link
                      href={resource.href}
                      className="text-[#F0F4FF] hover:text-[#1A73E8] transition-colors text-xs md:text-sm"
                    >
                      {resource.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Company Section - Only show if company pages exist */}
          {hasCompany && (
            <div>
              <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3 text-[#F5F8FF]">Company</h3>
              <ul className="space-y-1 md:space-y-1.5">
                {availableCompanyPages.map((page, index) => (
                  <li key={index}>
                    <Link
                      href={page.href}
                      className="text-[#F0F4FF] hover:text-[#1A73E8] transition-colors text-xs md:text-sm"
                    >
                      {page.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal Section - Only show if legal pages exist */}
          {hasLegal && (
            <div>
              <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3 text-[#F5F8FF]">Legal</h3>
              <ul className="space-y-1 md:space-y-1.5">
                {availableLegalPages.map((page, index) => (
                  <li key={index}>
                    <Link
                      href={page.href}
                      className="text-[#F0F4FF] hover:text-[#1A73E8] transition-colors text-xs md:text-sm"
                    >
                      {page.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Us Section */}
          {hasContactDetails && (
            <div>
              <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3 text-[#F5F8FF]">Contact Us</h3>
              <ul className="space-y-1.5 md:space-y-2">
                {hasEmail && (
                  <li className="flex items-start gap-2">
                    <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#1A73E8] mt-0.5 flex-shrink-0" />
                    <a 
                      href={`mailto:${contactDetails.email.trim()}`}
                      className="text-[#F0F4FF] hover:text-[#1A73E8] transition-colors text-xs md:text-sm break-all"
                    >
                      {contactDetails.email.trim()}
                    </a>
                  </li>
                )}
                {hasPhone && (
                  <li className="flex items-start gap-2">
                    <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#1A73E8] mt-0.5 flex-shrink-0" />
                    <a 
                      href={`tel:${contactDetails.phone.trim().replace(/\s+/g, '')}`}
                      className="text-[#F0F4FF] hover:text-[#1A73E8] transition-colors text-xs md:text-sm"
                    >
                      {contactDetails.phone.trim()}
                    </a>
                  </li>
                )}
                {hasAddress && (
                  <li className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#1A73E8] mt-0.5 flex-shrink-0" />
                    <span className="text-[#F0F4FF] text-xs md:text-sm whitespace-pre-line">
                      {contactDetails.address.trim()}
                    </span>
                  </li>
                )}
                {hasWebsite && (
                  <li className="flex items-start gap-2">
                    <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#1A73E8] mt-0.5 flex-shrink-0" />
                    <a 
                      href={contactDetails.website.trim().startsWith('http') ? contactDetails.website.trim() : `https://${contactDetails.website.trim()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#F0F4FF] hover:text-[#1A73E8] transition-colors text-xs md:text-sm break-all"
                    >
                      {contactDetails.website.trim().replace(/^https?:\/\//, '')}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-[#1A73E8]/15 pt-4 md:pt-5 mt-4 md:mt-5 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img 
                // src={getOptimizedImageUrl(logoUrl, 100, 24)} 
                src={logoUrl}
                alt={siteName || "Logo"} 
                width={100}
                height={24}
                className="h-6 w-auto  object-contain"
                style={{ height: 'auto' }}
                loading="lazy"
                sizes="(max-width: 768px) 80px, 100px"
                decoding="async"
              />
            ) : (
            <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-[#1A73E8]" />
            )}
            {siteName && siteName.trim() && (
            <span className="font-bold text-base md:text-lg text-[#F5F8FF]">{siteName}</span>
            )}
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F0F4FF] hover:text-[#1A73E8] transition-colors"
                  aria-label={social.label}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-[#F0F4FF]">
              <Shield className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>SSL Secure</span>
            </div>
          </div>
        </div>

        <div className="text-center text-[#E7ECF6] text-xs md:text-sm mt-4 md:mt-5 space-y-0.5 md:space-y-1">
          <p>© 2025 {siteName && siteName.trim() ? siteName : "AllExamQuestions"}. All rights reserved.</p>
          <p className="text-[10px] md:text-xs text-[#E7ECF6]/85">
            A Brand of TutorKhoj Private Limited
          </p>
        </div>

        <div className="border-t border-[#1A73E8]/15 pt-4 md:pt-5 mt-4 md:mt-5">
          <p className="text-[#E7ECF6] text-[10px] md:text-xs leading-relaxed max-w-4xl mx-auto text-center">
            <strong className="text-[#F5F8FF]">Disclaimer:</strong> All the course names, logos, and certification titles we use are their respective owners' property. The firm, service, or product names on the website are solely for identification purposes. We do not own, endorse or have the copyright of any brand/logo/name in any manner. Few graphics on our website are freely available on public domains.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
