'use client';

import { useEffect, useState, ReactNode } from "react";
import { LegalSidebar } from "@/components/LegalSidebar";

interface TermsSectionProps {
  id: string;
  title: string;
  content: ReactNode;
}

export default function Page() {
    const [activeSection, setActiveSection] = useState<string>('');
    const sections = [
    {
      id: 'use-of-service',
      title: '1. Use of Service',
      content: (
        <>
          <p>
            To use QATrack, you must be at least 18 years of age or the age of majority in your jurisdiction. By accessing or using our platform, you represent and warrant that you meet these age requirements.
          </p>
          <p>
            You agree to use the Service in a responsible manner and in compliance with all applicable laws and regulations. You may not use the Service to:
          </p>
          <ul>
            <li>Upload, post, or transmit any harmful, illegal, or malicious content</li>
            <li>Violate intellectual property rights or copyrights without proper permission</li>
            <li>Engage in activities that could damage, disable, or impair the Service</li>
            <li>Attempt to gain unauthorized access to any part of the Service or related systems</li>
          </ul>
        </>
      ),
    },
    {
      id: 'account-responsibility',
      title: '2. Account Responsibility',
      content: (
        <>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials, including your username and password. You agree to:
          </p>
          <ul>
            <li>Keep your login credentials secure and not share them with others</li>
            <li>Notify us immediately of any unauthorized access to your account</li>
            <li>Accept responsibility for all activities that occur under your account</li>
            <li>Ensure that your account information is accurate and up-to-date</li>
          </ul>
          <p>
            QATrack is not liable for any loss or damage arising from your failure to comply with these security obligations.
          </p>
        </>
      ),
    },
    {
      id: 'subscription-payment',
      title: '3. Subscription & Payment',
      content: (
        <>
          <p>
            Access to certain features of QATrack requires a paid subscription. By subscribing to a paid plan, you agree to pay the fees associated with that plan.
          </p>
          <p>
            All payments are processed securely through our third-party payment processors. We do not store your complete payment information on our servers.
          </p>
          <p>
            Key payment terms:
          </p>
          <ul>
            <li>Subscriptions are billed on a recurring basis (monthly or annually)</li>
            <li>Pricing is subject to change with reasonable notice to existing subscribers</li>
            <li>Refunds are handled on a case-by-case basis in accordance with our refund policy</li>
            <li>You are responsible for any taxes applicable to your subscription</li>
          </ul>
        </>
      ),
    },
    {
      id: 'intellectual-property',
      title: '4. Intellectual Property',
      content: (
        <>
          <p>
            All software, designs, graphics, branding, and other materials provided as part of QATrack are the intellectual property of QATrack and are protected by copyright, trademark, and other intellectual property laws.
          </p>
          <p>
            You retain full ownership of any content, data, or materials you upload to the Service ("User Content"). However, by uploading User Content, you grant QATrack a worldwide, non-exclusive, royalty-free license to use, store, process, and display your User Content solely for the purpose of providing and improving the Service.
          </p>
          <p>
            This license terminates when you delete your User Content or close your account, except where content has been shared with others and they have not deleted it.
          </p>
        </>
      ),
    },
    {
      id: 'termination',
      title: '5. Termination',
      content: (
        <>
          <p>
            QATrack reserves the right to suspend or terminate your account at any time if you violate these Terms & Conditions or engage in conduct that we determine to be harmful to the Service or other users.
          </p>
          <p>
            You may cancel your account at any time through your account settings. Upon cancellation:
          </p>
          <ul>
            <li>Your access to paid features will continue until the end of your current billing period</li>
            <li>Your data will be retained for a limited period in accordance with our data retention policy</li>
            <li>You may request deletion of your data by contacting our support team</li>
          </ul>
          <p>
            We are not liable for any loss or damage resulting from account termination, whether initiated by you or by us.
          </p>
        </>
      ),
    },
    {
      id: 'limitation-liability',
      title: '6. Limitation of Liability',
      content: (
        <>
          <p>
            QATrack is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the Service's reliability, availability, or fitness for a particular purpose.
          </p>
          <p>
            To the maximum extent permitted by law, QATrack and its affiliates, officers, employees, and partners shall not be liable for:
          </p>
          <ul>
            <li>Any direct, indirect, incidental, or consequential damages arising from your use of the Service</li>
            <li>Loss of data, profits, or business opportunities</li>
            <li>Service interruptions, errors, or security breaches</li>
            <li>Actions or content of third parties using the Service</li>
          </ul>
          <p>
            Some jurisdictions do not allow the limitation of liability for consequential damages, so this limitation may not apply to you.
          </p>
        </>
      ),
    },
    {
      id: 'changes-terms',
      title: '7. Changes to Terms',
      content: (
        <>
          <p>
            We may update these Terms & Conditions from time to time to reflect changes in our practices, legal requirements, or Service features. When we make changes, we will:
          </p>
          <ul>
            <li>Update the "Effective Date" at the top of this page</li>
            <li>Notify you via email or through a notification in the Service</li>
            <li>Provide a reasonable period for you to review the changes</li>
          </ul>
          <p>
            Your continued use of QATrack after the updated Terms become effective constitutes your acceptance of the changes. If you do not agree to the updated Terms, you should discontinue use of the Service.
          </p>
        </>
      ),
    },
    {
      id: 'contact',
      title: '8. Contact',
      content: (
        <>
          <p>
            If you have any questions, concerns, or feedback regarding these Terms & Conditions, please contact us:
          </p>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mt-4">
            <p className="text-[#E0E0E0]">
              Email: <a href="mailto:support@qatrack.com" className="text-[#6366F1] hover:text-[#8B5CF6] transition-colors">support@qatrack.com</a>
            </p>
            <p className="text-[#AAAAAA] text-sm mt-3">
              We typically respond to all inquiries within 1-2 business days.
            </p>
          </div>
        </>
      ),
    },
    ];

      useEffect(() => {
        const handleScroll = () => {
        const scrollPosition = window.scrollY + 150;

        for (const section of sections) {
            const element = document.getElementById(section.id);
            if (element) {
            const { offsetTop, offsetHeight } = element;
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                setActiveSection(section.id);
                break;
            }
            }
        }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [sections, setActiveSection]);
  return (
    <div className="min-h-screen bg-linear-to-br from-[#0F0F0F] to-[#1A1A1A] text-[#E0E0E0]">
      <div className="flex">
        {/* Left Sidebar */}
        <LegalSidebar />
        
        {/* Main Content */}
        <main className="flex-1 ml-64">
          <div className="max-w-[900px] mx-auto px-8 py-12">
            <header className="mb-16 pt-4">
                <h1 className="text-4xl text-white mb-3">Terms & Conditions</h1>
                <div className="flex flex-col gap-2 text-[#AAAAAA]">
                    <p className="text-sm">
                    Effective Date: <span className="text-[#E0E0E0]">January 1, 2024</span>
                    </p>
                    <p className="text-sm leading-relaxed">
                    By using <span className="text-[#6366F1]">QATrack</span>, you agree to these terms.
                    </p>
                </div>
            </header>    
            <div className="flex gap-12">
                {/* Main Content */}
                <div className="flex-1">
                    {sections.map((section, index) => (
                    <div key={section.id}>
                        <TermsSection
                        id={section.id}
                        title={section.title}
                        content={section.content}
                        />
                        {index < sections.length - 1 && (
                        <div className="h-px bg-white/8 my-12" />
                        )}
                    </div>
                    ))}

                    {/* Footer */}
                    <div className="mt-16 pt-8 border-t border-white/8">
                    <p className="text-sm text-[#AAAAAA] leading-relaxed">
                        Thank you for taking the time to read our Terms & Conditions. We&apos;re committed to providing a transparent, secure, and reliable service for all our users.
                    </p>
                    </div>
                </div>

                {/* Table of Contents - Sticky */}
                <TableOfContents sections={sections} activeSection={activeSection} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export function TermsSection({ id, title, content }: TermsSectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl text-white mb-6">{title}</h2>
      <div className="space-y-6 text-[#E0E0E0] leading-relaxed">
        {content}
      </div>
    </section>
  );
}

interface TableOfContentsProps {
  sections: Array<{ id: string; title: string }>;
  activeSection: string;
}

export function TableOfContents({ sections, activeSection }: TableOfContentsProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  return (
    <aside className="hidden xl:block w-64 shrink-0">
      <div className="sticky top-12">
        <h3 className="text-xs uppercase tracking-wider text-[#AAAAAA] mb-4">On This Page</h3>
        <nav className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`
                block w-full text-left text-sm py-1.5 px-3 rounded transition-all duration-200
                ${activeSection === section.id
                  ? 'text-[#6366F1] bg-[#6366F1]/10 border-l-2 border-[#6366F1]'
                  : 'text-[#AAAAAA] hover:text-[#E0E0E0] hover:bg-white/5 border-l-2 border-transparent'
                }
              `}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

