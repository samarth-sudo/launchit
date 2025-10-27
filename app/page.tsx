'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-gradient-to-b from-black/90 to-black/60 backdrop-blur-sm'
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className={`font-medium transition px-3 py-2 rounded-md ${
                  scrolled
                    ? 'text-white hover:bg-white/10'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Home
              </Link>
              <Link
                href="/about"
                className={`font-medium transition px-3 py-2 rounded-md ${
                  scrolled
                    ? 'text-white hover:bg-white/10'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                About
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/sign-in"
                className={`font-medium transition px-3 py-2 rounded-md ${
                  scrolled
                    ? 'text-white hover:bg-white/10'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className={`px-6 py-2.5 rounded-md font-semibold transition ${
                  scrolled
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-black hover:bg-gray-800 text-white'
                }`}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Black Background */}
      <section className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-black">
        <div className="container mx-auto max-w-6xl text-center relative z-10 py-32">
          {/* Launch it text with triangles */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight flex items-center justify-center gap-4">
              Launch it <span className="text-6xl md:text-8xl">▶▶</span>
            </h1>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight leading-tight">
            AI for Actionable Startup Investing
          </h2>

          <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto mb-16 leading-relaxed">
            Connecting validated ideas with the right investors and early users
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto bg-white hover:bg-gray-200 text-black px-10 py-5 rounded-md font-semibold transition text-lg"
            >
              Get Started →
            </Link>
            <Link
              href="/sign-up"
              className="w-full sm:w-auto bg-transparent border-2 border-white hover:bg-white hover:text-black text-white px-10 py-5 rounded-md font-semibold transition text-lg"
            >
              Launch Your Product
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section - Alternating Layout 1 */}
      <section className="py-32 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight leading-tight">
                For Founders
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Showcase your product. Get market analysis and connect with investors and early users. Our platform helps you validate your idea and find the right audience.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-black mb-1">Upload product demos</h3>
                    <p className="text-gray-600">Share your vision with video demonstrations</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-black mb-1">Market analysis</h3>
                    <p className="text-gray-600">Get insights on demographics and market size</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-black mb-1">Test with 100 investor personas</h3>
                    <p className="text-gray-600">Synthetic testing before you pitch</p>
                  </div>
                </li>
              </ul>
              <Link
                href="/sign-up"
                className="inline-block bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-md font-semibold transition"
              >
                Start Building
              </Link>
            </div>
            <div className="relative h-96 md:h-[600px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-4xl text-white">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section - Alternating Layout 2 */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative h-96 md:h-[600px] bg-gradient-to-br from-gray-200 to-gray-100 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-4xl text-white">○</span>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight leading-tight">
                For Investors
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Discover startups faster with validated demographics and match scoring. Make data-driven investment decisions with confidence.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-black mb-1">Match scoring</h3>
                    <p className="text-gray-600">Find startups aligned with your thesis</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-black mb-1">Instant due diligence</h3>
                    <p className="text-gray-600">Access comprehensive startup analysis</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-black mb-1">Purchase intent predictions</h3>
                    <p className="text-gray-600">Understand market demand before investing</p>
                  </div>
                </li>
              </ul>
              <Link
                href="/sign-up"
                className="inline-block bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-md font-semibold transition"
              >
                Start Investing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section - Alternating Layout 3 */}
      <section className="py-32 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight leading-tight">
                For Users
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Discover products matched to your profile. Get early access to innovative products that fit your interests and needs.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-black mb-1">Personalized feed</h3>
                    <p className="text-gray-600">Products matched to your demographics</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-black mb-1">Demographic matching</h3>
                    <p className="text-gray-600">See products built for people like you</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-black mb-1">Early access</h3>
                    <p className="text-gray-600">Be the first to try new innovations</p>
                  </div>
                </li>
              </ul>
              <Link
                href="/sign-up"
                className="inline-block bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-md font-semibold transition"
              >
                Start Exploring
              </Link>
            </div>
            <div className="relative h-96 md:h-[600px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-4xl text-white">△</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simplified */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 mb-20 leading-relaxed">
            Three simple steps to connect with users
          </p>

          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="w-16 h-16 bg-black text-white rounded-lg flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                1
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Choose Your Role</h3>
              <p className="text-gray-600 leading-relaxed">
                Join as a founder, investor, or user. Complete your profile with relevant details.
              </p>
            </div>

            <div>
              <div className="w-16 h-16 bg-black text-white rounded-lg flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                2
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Analyzes Everything</h3>
              <p className="text-gray-600 leading-relaxed">
                Calculates match scores, analyzes demographics, and predicts purchase intent.
              </p>
            </div>

            <div>
              <div className="w-16 h-16 bg-black text-white rounded-lg flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                3
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Match & Connect</h3>
              <p className="text-gray-600 leading-relaxed">
                Browse products matched to your profile. When there's mutual interest, it's a match!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Immersive */}
      <section className="py-40 px-6 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <Image
            src="/launch-it-logo.png"
            alt="Launch it"
            width={800}
            height={300}
            className="w-auto h-96"
          />
        </div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="text-2xl text-gray-400 mb-16 font-light">
            Join founders, investors, and users on Launch it
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-white text-black px-12 py-6 rounded-md font-semibold transition hover:bg-gray-200 text-lg"
          >
            Get Started →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-gray-600 hover:text-black font-medium transition">
                Home
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-black font-medium transition">
                About
              </Link>
            </div>
            <div className="text-center md:text-right text-sm text-gray-600">
              <p>Made by Kangaroo Labs</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
