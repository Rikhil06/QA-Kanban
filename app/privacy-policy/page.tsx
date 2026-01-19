'use client';

import { Sidebar } from "@/components/PrivacySidebar";
import { useEffect, useState } from "react";

export default function PrivacyPolicyPage() {
    const [activeSection, setActiveSection] = useState('intro');

    useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      let current = 'intro';

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) {
          current = section.getAttribute('data-section') || 'intro';
        }
      });

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };


  return (
    <div className="min-h-screen bg-linear-to-br from-[#0F0F0F] to-[#1A1A1A] text-[#E0E0E0]">
        <div className="flex max-w-[1400px] mx-auto">
        {/* Sidebar */}
        <Sidebar activeSection={activeSection} onNavigate={scrollToSection} />

        {/* Main Content */}
        <div className="flex-1 pl-0 lg:pl-64">
          <div className="max-w-[800px] mx-auto px-6 md:px-12 py-16 md:py-24">
            {/* Header */}
            <header className="mb-16 md:mb-24">
              <h1 className="text-[2.5rem] md:text-[3.5rem] mb-4 tracking-tight text-white">
                Privacy Policy
              </h1>
              <p className="text-[#AAAAAA] mb-2">
                Effective Date: December 23, 2024
              </p>
              <p className="text-[#AAAAAA] text-sm">
                Your privacy is important to us.
              </p>
            </header>

            {/* Content */}
            <div className="space-y-16 md:space-y-20">
                {/* Introduction */}
                <section data-section="intro">
                    <p className="leading-relaxed text-[#E0E0E0]">
                    This Privacy Policy describes how we collect, use, and protect your personal information when you use our issue-tracking and QA tool. We are committed to ensuring that your privacy is protected and that we comply with all applicable data protection laws.
                    </p>
                </section>

                <div className="border-t border-white/8" />

                {/* Information We Collect */}
                <section data-section="collect">
                    <h2 className="text-[1.75rem] md:text-[2rem] mb-8 text-white tracking-tight">
                    1. Information We Collect
                    </h2>
                    <div className="space-y-6 leading-relaxed">
                    <div>
                        <h3 className="text-white mb-3">Account Information</h3>
                        <p className="text-[#E0E0E0]">
                        When you create an account, we collect your name, email address, and password. This information is necessary to provide you with access to our service and to communicate with you about your account.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white mb-3">Content Data</h3>
                        <p className="text-[#E0E0E0]">
                        We collect and store content that you create or upload to our platform, including screenshots, annotations, comments, issue descriptions, and other user-generated content. This data is essential for the core functionality of our service.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white mb-3">Usage Data</h3>
                        <p className="text-[#E0E0E0]">
                        We automatically collect information about how you interact with our service, including pages visited, features used, errors encountered, and performance metrics. This helps us understand how our service is being used and identify areas for improvement.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white mb-3">Device & Cookies</h3>
                        <p className="text-[#E0E0E0]">
                        We use cookies and similar technologies to enhance your experience, maintain your session, and analyze performance. This includes information about your device, browser type, IP address, and operating system.
                        </p>
                    </div>
                    </div>
                </section>

                <div className="border-t border-white/8" />

                {/* How We Use Your Data */}
                <section data-section="use">
                    <h2 className="text-[1.75rem] md:text-[2rem] mb-8 text-white tracking-tight">
                    2. How We Use Your Data
                    </h2>
                    <div className="space-y-6 leading-relaxed">
                    <p className="text-[#E0E0E0]">
                        We use the information we collect for the following purposes:
                    </p>

                    <div>
                        <h3 className="text-white mb-3">Provide and Maintain Service</h3>
                        <p className="text-[#E0E0E0]">
                        To deliver our core issue-tracking and QA functionality, manage your account, process your requests, and ensure the service operates smoothly and securely.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white mb-3">Communicate Updates and Support</h3>
                        <p className="text-[#E0E0E0]">
                        To send you important service announcements, product updates, security alerts, and respond to your support requests and questions. We may also send you relevant information about new features that we believe will improve your experience.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white mb-3">Analyze Usage to Improve Features</h3>
                        <p className="text-[#E0E0E0]">
                        To understand how users interact with our platform, identify bugs and performance issues, and develop new features and improvements based on usage patterns and feedback.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white mb-3">Comply with Legal Obligations</h3>
                        <p className="text-[#E0E0E0]">
                        To comply with applicable laws, regulations, legal processes, and enforceable governmental requests. We may also use your information to protect the rights, property, or safety of our company, our users, or others.
                        </p>
                    </div>
                    </div>
                </section>

                <div className="border-t border-white/8" />
                {/* Sharing Your Data */}
                <section data-section="sharing">
                    <h2 className="text-[1.75rem] md:text-[2rem] mb-8 text-white tracking-tight">
                    3. Sharing Your Data
                    </h2>
                    <div className="space-y-6 leading-relaxed">
                    <div>
                        <h3 className="text-white mb-3">No Selling of Personal Information</h3>
                        <p className="text-[#E0E0E0]">
                        We do not sell, rent, or trade your personal information to third parties for their marketing purposes. Your data is yours, and we respect that.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white mb-3">Trusted Service Providers</h3>
                        <p className="text-[#E0E0E0]">
                        We may share your information with carefully selected service providers who assist us in operating our platform, such as cloud storage providers, analytics services, and customer support tools. These providers are contractually obligated to protect your data and use it only for the purposes we specify.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white mb-3">Legal Requirements</h3>
                        <p className="text-[#E0E0E0]">
                        We may disclose your information if required to do so by law or in response to valid requests by public authorities. We may also share information when we believe it is necessary to protect our rights, your safety, or the safety of others, investigate fraud, or respond to a government request.
                        </p>
                    </div>
                    </div>
                </section>

                <div className="border-t border-white/8" />

                {/* Security */}
                <section data-section="security">
                    <h2 className="text-[1.75rem] md:text-[2rem] mb-8 text-white tracking-tight">
                    4. Security
                    </h2>
                    <div className="space-y-6 leading-relaxed">
                    <p className="text-[#E0E0E0]">
                        We take the security of your personal information seriously and implement industry-standard security measures to protect it from unauthorized access, disclosure, alteration, and destruction.
                    </p>

                    <div>
                        <h3 className="text-white mb-3">Encryption and Secure Storage</h3>
                        <p className="text-[#E0E0E0]">
                        All data transmitted between your device and our servers is encrypted using TLS/SSL protocols. Your data is stored securely using encryption at rest, and we regularly review and update our security practices to ensure they meet current industry standards.
                        </p>
                    </div>

                    <p className="text-[#E0E0E0]">
                        While we strive to protect your personal information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but are committed to protecting your data to the best of our ability.
                    </p>
                    </div>
                </section>

                <div className="border-t border-white/8" />
                {/* Your Rights */}
                <section data-section="rights">
                    <h2 className="text-[1.75rem] md:text-[2rem] mb-8 text-white tracking-tight">
                    5. Your Rights
                    </h2>
                        <div className="space-y-6 leading-relaxed">
                        <p className="text-[#E0E0E0]">
                            You have the right to access, correct, or delete your personal information at any time. If you would like to:
                        </p>

                        <ul className="list-disc list-inside space-y-2 text-[#E0E0E0] pl-2">
                            <li>Access the personal data we hold about you</li>
                            <li>Request corrections to inaccurate information</li>
                            <li>Request deletion of your account and associated data</li>
                            <li>Export your data in a portable format</li>
                            <li>Withdraw consent for data processing</li>
                        </ul>

                        <p className="text-[#E0E0E0]">
                            Please contact us at{' '}
                            <a 
                            href="mailto:privacy@yourcompany.com" 
                            className="text-white hover:text-[#6B7CFF] transition-colors underline decoration-white/30 hover:decoration-[#6B7CFF]/50"
                            >
                            privacy@yourcompany.com
                            </a>
                            . We will respond to your request within 30 days.
                        </p>
                    </div>
                </section>

                <div className="border-t border-white/8" />

                {/* Changes to This Policy */}
                <section data-section="changes">
                    <h2 className="text-[1.75rem] md:text-[2rem] mb-8 text-white tracking-tight">
                    6. Changes to This Policy
                    </h2>
                    <div className="space-y-6 leading-relaxed">
                    <p className="text-[#E0E0E0]">
                        We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make changes, we will update the &quot;Effective Date&quot; at the top of this page.
                    </p>

                    <p className="text-[#E0E0E0]">
                        If we make material changes to how we handle your personal information, we will notify you via email or through a prominent notice on our service prior to the changes taking effect. We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
                    </p>
                    </div>
                </section>

                <div className="border-t border-white/8" />

                    {/* Contact */}
                    <section data-section="contact">
                        <h2 className="text-[1.75rem] md:text-[2rem] mb-8 text-white tracking-tight">
                        7. Contact
                        </h2>
                        <div className="space-y-6 leading-relaxed">
                        <p className="text-[#E0E0E0]">
                            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please don&apos;t hesitate to contact us:
                        </p>

                        <div className="bg-white/3 border border-white/8 rounded-lg p-6">
                            <p className="text-[#E0E0E0]">
                            Email:{' '}
                            <a 
                                href="mailto:privacy@yourcompany.com" 
                                className="text-white hover:text-[#6B7CFF] transition-colors underline decoration-white/30 hover:decoration-[#6B7CFF]/50"
                            >
                                privacy@yourcompany.com
                            </a>
                            </p>
                            <p className="text-[#E0E0E0] mt-3">
                            Support:{' '}
                            <a 
                                href="mailto:support@yourcompany.com" 
                                className="text-white hover:text-[#6B7CFF] transition-colors underline decoration-white/30 hover:decoration-[#6B7CFF]/50"
                            >
                                support@yourcompany.com
                            </a>
                            </p>
                        </div>

                        <p className="text-[#AAAAAA] text-sm pt-8">
                            We are committed to working with you to obtain a fair resolution of any complaint or concern about privacy.
                        </p>
                        </div>
                    </section>

                    {/* Footer spacing */}
                    <div className="h-16" />
                    </div>
                </div>
             </div>
        </div>
    </div>
  )
}
