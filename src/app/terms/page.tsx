'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle, XCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-white">Terms of Service</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-6 h-6 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Agreement to Terms</h2>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            By accessing and using Inkora (&quot;the Service&quot;), you agree to be bound
            by these Terms of Service. If you do not agree with any part of these terms,
            please do not use our service.
          </p>
        </div>

        <div className="space-y-8 text-gray-300">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              1. Description of Service
            </h2>
            <p className="mb-3">
              Inkora is a web-based manga/manhwa reader application that aggregates and
              displays content from various third-party sources. The Service provides:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
              <li>A user-friendly reading interface</li>
              <li>Search and discovery features</li>
              <li>Personal reading history and bookmarks (stored locally)</li>
              <li>Content recommendations</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Acceptable Use</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Allowed */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <h3 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                  <CheckCircle size={18} /> You May
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Use the Service for personal, non-commercial reading</li>
                  <li>• Create bookmarks and track your reading history</li>
                  <li>• Share links to the Service with others</li>
                  <li>• Report bugs or suggest improvements</li>
                </ul>
              </div>

              {/* Not Allowed */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <h3 className="font-bold text-red-400 mb-3 flex items-center gap-2">
                  <XCircle size={18} /> You May Not
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Scrape, copy, or redistribute our service</li>
                  <li>• Use automated tools to access the Service</li>
                  <li>• Attempt to bypass any security measures</li>
                  <li>• Use the Service for any illegal activities</li>
                  <li>• Claim ownership of any content</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              3. Intellectual Property
            </h2>
            <p className="mb-3">
              All manga, manhwa, and comic content accessible through our Service belongs
              to their respective copyright holders. We do not claim ownership of any
              content.
            </p>
            <p>
              The Inkora name, logo, and website design are our property. You may not use
              our branding without explicit permission.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Third-Party Content</h2>
            <p className="mb-3">
              Our Service displays content from third-party websites. We:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
              <li>Do not control or guarantee the accuracy of third-party content</li>
              <li>Are not responsible for content availability</li>
              <li>Do not endorse any third-party websites</li>
              <li>Cannot guarantee content will remain accessible</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              5. Disclaimer of Warranties
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-sm">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES
                OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL
                BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              6. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Inkora shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages resulting
              from your use or inability to use the Service.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users
              of significant changes by posting a notice on the Service. Continued use of
              the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">8. Termination</h2>
            <p>
              We reserve the right to terminate or suspend access to the Service
              immediately, without prior notice, for any conduct that we believe violates
              these Terms or is harmful to other users or the Service.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">9. Contact</h2>
            <p>
              For any questions about these Terms, you may reach out through the contact
              options available on this website.
            </p>
          </section>

          {/* Last Updated */}
          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-gray-500 text-sm">Last updated: December 5, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}
