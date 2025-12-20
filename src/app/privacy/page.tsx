import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Database, Cookie, Eye, Lock, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for Inkora - Learn how we protect your data and respect your privacy when using our manga and manhwa reader.',
  openGraph: {
    title: 'Privacy Policy - Inkora',
    description: 'Learn how we protect your data and respect your privacy.',
    url: 'https://inkora.spacely.tech/privacy',
  },
  alternates: {
    canonical: 'https://inkora.spacely.tech/privacy',
  },
};

export default function PrivacyPage() {
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
          <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-6 h-6 text-green-400" />
            <h2 className="text-lg font-bold text-white">Your Privacy Matters</h2>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Inkora is committed to protecting your privacy. This policy explains what
            information we collect, how we use it, and your rights regarding your data.
          </p>
        </div>

        {/* Quick Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <Database className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h3 className="font-bold text-white text-sm mb-1">Minimal Collection</h3>
            <p className="text-xs text-gray-400">We collect only what's necessary</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <Lock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h3 className="font-bold text-white text-sm mb-1">Local Storage</h3>
            <p className="text-xs text-gray-400">Your data stays on your device</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <Eye className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h3 className="font-bold text-white text-sm mb-1">No Tracking</h3>
            <p className="text-xs text-gray-400">We don't sell your data</p>
          </div>
        </div>

        <div className="space-y-8 text-gray-300">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Database className="w-5 h-5 text-blue-400" />
              1. Information We Collect
            </h2>

            <h3 className="font-semibold text-white mt-4 mb-2">
              Data Stored Locally (On Your Device)
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
              <li>
                <strong className="text-white">Reading History:</strong> Manhwa you've
                read and your progress
              </li>
              <li>
                <strong className="text-white">Bookmarks:</strong> Series you've saved to
                your library
              </li>
              <li>
                <strong className="text-white">Preferences:</strong> Theme settings,
                reading mode preferences
              </li>
            </ul>
            <p className="mt-3 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              ✅ This data is stored in your browser's localStorage and never leaves your
              device.
            </p>

            <h3 className="font-semibold text-white mt-6 mb-2">Data We May Collect</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
              <li>
                <strong className="text-white">Usage Analytics:</strong> Anonymous page
                views and feature usage (if analytics enabled)
              </li>
              <li>
                <strong className="text-white">Error Reports:</strong> Anonymous crash
                reports to improve the service
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Cookie className="w-5 h-5 text-amber-400" />
              2. Cookies & Local Storage
            </h2>
            <p className="mb-3">
              We use browser localStorage to enhance your experience:
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-3 text-white">Storage Key</th>
                    <th className="text-left p-3 text-white">Purpose</th>
                    <th className="text-left p-3 text-white">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-3 text-gray-400">reading_history</td>
                    <td className="p-3 text-gray-400">Track reading progress</td>
                    <td className="p-3 text-gray-400">Persistent</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-400">bookmarks</td>
                    <td className="p-3 text-gray-400">Save favorite series</td>
                    <td className="p-3 text-gray-400">Persistent</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-400">preferences</td>
                    <td className="p-3 text-gray-400">User settings</td>
                    <td className="p-3 text-gray-400">Persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Eye className="w-5 h-5 text-green-400" />
              3. How We Use Your Information
            </h2>
            <p className="mb-3">The information stored locally is used to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
              <li>Remember your reading progress across sessions</li>
              <li>Display your bookmarked series</li>
              <li>Provide personalized recommendations</li>
              <li>Improve the Service based on usage patterns</li>
            </ul>
            <p className="mt-4 font-semibold text-white">We do NOT:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
              <li>Sell your data to third parties</li>
              <li>Share your reading habits with advertisers</li>
              <li>Track your identity across websites</li>
              <li>Store your IP address or personal information</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Lock className="w-5 h-5 text-purple-400" />
              4. Data Security
            </h2>
            <p className="mb-3">
              We take reasonable measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
              <li>All connections use HTTPS encryption</li>
              <li>Personal data is stored only on your device</li>
              <li>We don't maintain user accounts or databases with personal info</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Third-Party Services</h2>
            <p className="mb-3">Our Service may interact with third-party services:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
              <li>
                <strong className="text-white">Content Sources:</strong> We fetch
                manga/manhwa from third-party websites. Their privacy policies apply to
                their sites.
              </li>
              <li>
                <strong className="text-white">Hosting Provider:</strong> Our service is
                hosted on Render/Vercel, which may collect server logs.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
              <li>
                <strong className="text-white">Access:</strong> View all data stored in
                your browser
              </li>
              <li>
                <strong className="text-white">Delete:</strong> Clear your reading history
                and bookmarks at any time
              </li>
              <li>
                <strong className="text-white">Portability:</strong> Export your data
                (coming soon)
              </li>
            </ul>
            <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-sm">
                <strong className="text-white">To delete your data:</strong> Open your
                browser's Developer Tools → Application → Local Storage → Clear all
                entries for this site.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">7. Children's Privacy</h2>
            <p>
              Our Service is not directed at children under 13. We do not knowingly
              collect information from children. If you believe a child has provided us
              with personal information, please contact us.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of
              any changes by posting the new policy on this page and updating the "Last
              updated" date.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Mail className="w-5 h-5 text-cyan-400" />
              9. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy, you may reach out through
              the contact options available on this website.
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
