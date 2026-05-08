import Link from "next/link";
import { Wrench, Star, Shield, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-indigo-600 text-xl">
              <Wrench className="h-6 w-6" />
              FixBridge
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Device Repair,
            <br />
            <span className="text-indigo-600">Simplified</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Connect with verified repair shops for PCs, laptops, gaming
            consoles, and mobile phones. Get quotes, track repairs, and leave
            reviews — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-indigo-600 text-white text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Get Your Device Fixed
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-indigo-600 text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              List Your Repair Shop
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-indigo-600" />}
            title="Verified Providers"
            description="All repair shops are verified and vetted by our team to ensure quality service."
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-indigo-600" />}
            title="Fast Quotes"
            description="Get multiple quotes from providers and choose the best one for your needs."
          />
          <FeatureCard
            icon={<Star className="h-8 w-8 text-indigo-600" />}
            title="Real Reviews"
            description="Read authentic reviews from other customers before choosing a provider."
          />
        </div>
      </section>

      {/* How It Works - Customers */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How It Works for Customers
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Step
              number="1"
              title="Submit Request"
              description="Tell us what's wrong with your device and upload photos."
            />
            <Step
              number="2"
              title="Get Quotes"
              description="Receive quotes from verified repair shops in your area."
            />
            <Step
              number="3"
              title="Get It Fixed"
              description="Choose a provider, track your repair, and pick up your device."
            />
          </div>
        </div>
      </section>

      {/* How It Works - Providers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How It Works for Providers
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Step
              number="1"
              title="Register Your Shop"
              description="Create your profile with shop details and services offered."
            />
            <Step
              number="2"
              title="Browse Requests"
              description="See repair requests matching your expertise and accept them."
            />
            <Step
              number="3"
              title="Grow Your Business"
              description="Build your reputation with reviews and attract more customers."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of customers and providers on FixBridge today.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-indigo-600 text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-white text-xl mb-4 md:mb-0">
              <Wrench className="h-5 w-5" />
              FixBridge
            </div>
            <p className="text-sm">© 2025 FixBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
      <div className="inline-flex p-3 rounded-xl bg-indigo-50 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white text-xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
