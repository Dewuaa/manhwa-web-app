'use client';

import Link from 'next/link';
import { ArrowLeft, AlertTriangle, ExternalLink } from 'lucide-react';

export default function DisclaimerPage() {
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
          <h1 className="text-xl font-bold text-white">Disclaimer</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Warning Banner */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8 flex gap-4">
          <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-lg font-bold text-amber-500 mb-2">Important Notice</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              This website is a third-party application and is NOT affiliated with,
              endorsed by, or connected to any manga/manhwa publishers, authors, or
              official distributors.
            </p>
          </div>
        </div>

        <div className="space-y-8 text-gray-300">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">
                1
              </span>
              No Content Hosting
            </h2>
            <div className="pl-10 space-y-3">
              <p>
                Inkora does{' '}
                <strong className="text-white">NOT host, store, or upload</strong> any
                manga, manhwa, manhua, or comic content on its servers. All content
                displayed through this application is sourced from third-party websites
                that are publicly accessible on the internet.
              </p>
              <p>
                We function solely as an{' '}
                <strong className="text-white">aggregator and reader interface</strong>{' '}
                that helps users discover and read content from external sources. Think of
                us as a specialized web browser for manga content.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold">
                2
              </span>
              Copyright & DMCA
            </h2>
            <div className="pl-10 space-y-3">
              <p>
                All manga/manhwa content, including but not limited to artwork,
                characters, storylines, and translations, are the property of their
                respective{' '}
                <strong className="text-white">
                  copyright holders, authors, artists, and publishers
                </strong>
                .
              </p>
              <p>
                If you are a copyright holder and believe that content accessible through
                our service infringes your rights, please contact the original hosting
                website directly. As we do not host any content, we cannot remove content
                from third-party servers.
              </p>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-sm text-gray-400">
                  <strong className="text-white">For DMCA requests:</strong> Please
                  contact the source websites directly as they are the content hosts. We
                  can only remove links to specific content upon valid legal request.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 text-sm font-bold">
                3
              </span>
              Support Official Releases
            </h2>
            <div className="pl-10 space-y-3">
              <p>
                We strongly encourage users to{' '}
                <strong className="text-white">support the official releases</strong> of
                manga and manhwa. If you enjoy a series, please consider:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-400">
                <li>Purchasing official volumes and merchandise</li>
                <li>Subscribing to official digital platforms</li>
                <li>Supporting authors on their official channels</li>
                <li>Attending official events and exhibitions</li>
              </ul>
              <div className="flex flex-wrap gap-3 mt-4">
                <a
                  href="https://www.viz.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-all border border-white/10"
                >
                  VIZ Media <ExternalLink size={14} />
                </a>
                <a
                  href="https://www.webtoons.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-all border border-white/10"
                >
                  Webtoon <ExternalLink size={14} />
                </a>
                <a
                  href="https://tapas.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-all border border-white/10"
                >
                  Tapas <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 text-sm font-bold">
                4
              </span>
              Limitation of Liability
            </h2>
            <div className="pl-10 space-y-3">
              <p>
                This service is provided <strong className="text-white">"as is"</strong>{' '}
                without any warranties, express or implied. We are not responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-400">
                <li>The accuracy, legality, or appropriateness of third-party content</li>
                <li>Any damages arising from the use of this service</li>
                <li>Content availability or service interruptions</li>
                <li>Actions of third-party websites we link to</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold">
                5
              </span>
              User Responsibility
            </h2>
            <div className="pl-10 space-y-3">
              <p>By using this service, you acknowledge that:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-400">
                <li>You are responsible for complying with your local laws</li>
                <li>You will not use this service for any illegal purposes</li>
                <li>You understand the content is sourced from third parties</li>
                <li>You will support official releases when possible</li>
              </ul>
            </div>
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
