"use client";

import { GraduationCap, Facebook, Linkedin, Youtube, Instagram, Shield, Mail, Phone, MapPin, Globe } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "@/lib/navigation/client";
import { useSiteName } from "@/hooks/useSiteName";
import { useContactDetails } from "@/hooks/useContactDetails";
import { useLogoUrl } from "@/hooks/useLogoUrl";
import { useSocialMediaUrls } from "@/hooks/useSocialMediaUrls";
import { useFooterSettings } from "@/hooks/useFooterSettings";
import { getOptimizedImageUrl } from "@/utils/imageUtils";
import OptimizedImage from "@/components/common/OptimizedImage";
import Image from "next/image";

/**
 * Footer Component
 *
 * IMPORTANT: This footer is IDENTICAL for both logged-in and non-logged-in users.
 * There is NO conditional rendering based on authentication status.
 * All sections and links are visible and functional for ALL users.
 *
 * Text content is editable from Admin → Footer. Logo, contact, and social URLs
 * still come from Settings / Legal Pages.
 */

function FooterProviderLink({ provider, href }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="text-[#F0F4FF] hover:text-[#1A73E8] transition-colors text-xs md:text-sm inline-flex items-center py-0.5"
    >
      {provider?.name || ""}
    </Link>
  );
}

const Footer = ({
  initialProviders = [],
  initialLogoUrl = "",
  initialFooterSettings = null,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const siteName = useSiteName();
  const contactDetails = useContactDetails();
  const logoUrl = useLogoUrl(initialLogoUrl);
  const socialUrls = useSocialMediaUrls();
  const footerSettings = useFooterSettings(initialFooterSettings);
  const [providers, setProviders] = useState(initialProviders);
  const [loading, setLoading] = useState(initialProviders.length === 0);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  const providersLimit = footerSettings.providers_limit || 5;

  // Fetch providers only when not preloaded, or when limit needs more than SSR data.
  useEffect(() => {
    const hasEnoughPreloaded =
      initialProviders.length > 0 && initialProviders.length >= providersLimit;

    if (hasEnoughPreloaded) {
      setProviders(initialProviders.slice(0, providersLimit));
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchFooterData = async () => {
      try {
        const providersRes = await fetch(`${API_BASE_URL}/api/providers/`);
        if (providersRes.ok) {
          const providersData = await providersRes.json();
          if (!cancelled && Array.isArray(providersData)) {
            setProviders(
              providersData
                .filter((p) => p.is_active !== false)
                .slice(0, providersLimit)
            );
          }
        }
      } catch (error) {
        console.error("Error fetching footer data:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFooterData();
    return () => {
      cancelled = true;
    };
  }, [initialProviders.length, providersLimit, API_BASE_URL]);

  // Available resources pages (only show what exists)
  const availableResources = [
    { label: footerSettings.blogs_label, href: "/blog", exists: true },
    { label: footerSettings.faq_label, href: "/", exists: true, isFaq: true },
  ];

  // Company pages (only show if they exist - currently none exist, so empty)
  const availableCompanyPages = [];

  // Legal pages (only show if they exist)
  const availableLegalPages = [
    { label: footerSettings.privacy_policy_label, href: "/privacy-policy", exists: true },
    { label: footerSettings.terms_label, href: "/terms-and-conditions", exists: true },
    { label: footerSettings.refund_policy_label, href: "/refund-and-cancellation-policy", exists: true },
    { label: footerSettings.disclaimer_link_label, href: "/disclaimer", exists: true },
    { label: footerSettings.editor_policy_label, href: "/editor-policy", exists: true },
    { label: footerSettings.contact_us_label, href: "/contact-us", exists: true },
  ];

  // Build social links array from admin-configured URLs (only show links with URLs)
  const socialLinks = [
    { icon: Facebook, label: "Facebook", url: socialUrls.facebook },
    { icon: null, label: "Twitter", url: socialUrls.twitter },
    { icon: Linkedin, label: "LinkedIn", url: socialUrls.linkedin },
    { icon: Youtube, label: "YouTube", url: socialUrls.youtube },
    { icon: Instagram, label: "Instagram", url: socialUrls.instagram },
  ].filter((link) => link.url && link.url.trim().length > 0);

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
  const gridCols =
    visibleSections <= 2
      ? "md:grid-cols-2"
      : visibleSections <= 3
        ? "md:grid-cols-3"
        : visibleSections <= 4
          ? "md:grid-cols-4"
          : visibleSections <= 5
            ? "md:grid-cols-5"
            : "md:grid-cols-6";

  // Helper function to get provider URL
  const getProviderUrl = (provider) => {
    if (provider.slug) {
      return `/providers/${provider.slug}`;
    }
    if (provider.name) {
      const slug = provider.name.toLowerCase().replace(/\s+/g, "-");
      return `/providers/${slug}`;
    }
    return "#";
  };

  const handleFooterFAQClick = (event) => {
    event.preventDefault();

    const scrollToFaq = () => {
      if (typeof document === "undefined") return;
      const el =
        document.getElementById("faq-list") ||
        document.getElementById("faq-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    if (pathname === "/") {
      scrollToFaq();
    } else {
      router.push("/");
      setTimeout(scrollToFaq, 600);
    }
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-gradient-to-br from-[#0C1A35] to-[#0E2444] text-white border-t border-[#1A73E8]/20">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${gridCols} gap-4 md:gap-6 mb-6 md:mb-8`}>
          {/* Providers Section - Only show if providers exist */}
          {hasProviders && (
            <div>
              <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3 text-[#F5F8FF]">
                {footerSettings.providers_title}
              </h3>
              <ul className="space-y-1 md:space-y-1.5">
                {loading ? (
                  <li className="text-[#F0F4FF] text-xs md:text-sm">
                    {footerSettings.loading}
                  </li>
                ) : providers.length > 0 ? (
                  providers.map((provider, index) => (
                    <li key={index}>
                      <FooterProviderLink
                        provider={provider}
                        href={getProviderUrl(provider)}
                      />
                    </li>
                  ))
                ) : (
                  <li className="text-[#F0F4FF]/85 text-xs md:text-sm">
                    {footerSettings.no_providers}
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Resources Section - Only show if resources exist */}
          {hasResources && (
            <div>
              <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3 text-[#F5F8FF]">
                {footerSettings.resources_title}
              </h3>
              <ul className="space-y-1 md:space-y-1.5">
                {availableResources
                  .filter((resource) => resource.exists)
                  .map((resource, index) => (
                    <li key={index}>
                      {resource.isFaq ? (
                        <button
                          type="button"
                          onClick={handleFooterFAQClick}
                          className="text-left text-[#F0F4FF] hover:text-[#1A73E8] transition-colors text-xs md:text-sm py-0.5 inline-flex items-center"
                        >
                          {resource.label}
                        </button>
                      ) : (
                        <Link
                          href={resource.href}
                          prefetch={false}
                          className="text-[#F0F4FF] hover:text-[#1A73E8] transition-colors text-xs md:text-sm inline-flex items-center py-0.5"
                        >
                          {resource.label}
                        </Link>
                      )}
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
                      prefetch={false}
                      className="text-[#F0F4FF] hover:text-[#1A73E8] transition-colors text-xs md:text-sm inline-flex items-center py-0.5"
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
              <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3 text-[#F5F8FF]">
                {footerSettings.legal_title}
              </h3>
              <ul className="space-y-1 md:space-y-1.5">
                {availableLegalPages.map((page, index) => (
                  <li key={index}>
                    <Link
                      href={page.href}
                      prefetch={false}
                      className="text-[#F0F4FF] hover:text-[#1A73E8] transition-colors text-xs md:text-sm inline-flex items-center py-0.5"
                    >
                      {page.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Us Section */}
          {hasContactDetails && (
            <div>
              <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3 text-[#F5F8FF]">
                {footerSettings.contact_title}
              </h3>
              <ul className="space-y-1.5 md:space-y-2">
                {hasEmail && (
                  <li className="flex items-start gap-2">
                    <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#1A73E8] mt-0.5 flex-shrink-0" />
                    <a
                      href={`mailto:${contactDetails.email.trim()}`}
                      className="text-[#F0F4FF] hover:text-[#1A73E8] transition-colors text-xs md:text-sm break-all inline-flex items-center py-0.5"
                    >
                      {contactDetails.email.trim()}
                    </a>
                  </li>
                )}

                {hasPhone && (
                  <li className="flex items-start gap-2">
                    <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#1A73E8] mt-0.5 flex-shrink-0" />
                    <a
                      href={`tel:${contactDetails.phone.trim().replace(/\s+/g, "")}`}
                      className="text-[#F0F4FF] hover:text-[#1A73E8] transition-colors text-xs md:text-sm inline-flex items-center py-0.5"
                    >
                      {contactDetails.phone.trim()}
                    </a>
                  </li>
                )}
                {hasAddress && (
                  <li className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#1A73E8] mt-0.5 flex-shrink-0" />
                    <p className="text-[#F0F4FF] text-xs md:text-sm whitespace-pre-line">
                      {contactDetails.address}
                    </p>
                  </li>
                )}
                {hasWebsite && (
                  <li className="flex items-start gap-2">
                    <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#1A73E8] mt-0.5 flex-shrink-0" />
                    <a
                      href={
                        contactDetails.website.trim().startsWith("http")
                          ? contactDetails.website.trim()
                          : `https://${contactDetails.website.trim()}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#F0F4FF] hover:text-[#1A73E8] transition-colors text-xs md:text-sm break-all inline-flex items-center py-0.5"
                    >
                      {contactDetails.website.trim().replace(/^https?:\/\//, "")}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-[#1A73E8]/15 pt-4 md:pt-5 mt-4 md:mt-5 flex flex-col md:flex-row justify-between items-center md:items-start gap-4 md:gap-8">
          {/* Logo with copyright underneath */}
          <div className="flex flex-col items-center md:items-start gap-2 shrink-0">
            {logoUrl ? (
              <span className="relative block h-16 w-[180px] shrink-0">
                <OptimizedImage
                  src={getOptimizedImageUrl(logoUrl, 180, 64, "fit")}
                  alt={siteName || "Logo"}
                  fill
                  sizes="180px"
                  className="object-contain object-left"
                  objectFit="contain"
                  crop="fit"
                />
              </span>
            ) : (
              <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-[#1A73E8]" />
            )}

            {/* Social media icons under the logo */}
            {footerSettings.show_social_links && socialLinks.length > 0 && (
              <div className="flex items-center gap-3 md:gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#F0F4FF] hover:text-[#1A73E8] transition-colors inline-flex items-center justify-center p-1.5 rounded-md"
                    aria-label={`${social.label} (opens in a new tab)`}
                  >
                    {social.label === "Twitter" ? (
                      <Image
                        src="/twitter_logo.png"
                        alt="Twitter"
                        width={20}
                        height={20}
                        className="w-4 h-4 md:w-5 md:h-5 object-contain"
                      />
                    ) : (
                      <social.icon className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </a>
                ))}
              </div>
            )}

            <div className="text-center md:text-left text-[#E8EDF7] text-xs md:text-sm space-y-0.5">
              <p>{footerSettings.copyright}</p>
              <p className="text-[10px] md:text-xs text-[#D4DFF0]">
                {footerSettings.brand_line}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          {footerSettings.show_disclaimer && (
            <div className="flex-1 max-w-3xl">
              <p className="text-[#D8E3F5] text-[10px] md:text-xs leading-relaxed text-left">
                <strong className="text-[#F5F8FF]">
                  {footerSettings.disclaimer_label}
                </strong>{" "}
                <span>{footerSettings.disclaimer_text}</span>
              </p>
            </div>
          )}

          <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-[#F0F4FF] shrink-0">
            <Shield className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>{footerSettings.ssl_secure}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
