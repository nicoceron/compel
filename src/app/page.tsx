import Link from "next/link";
import { Button } from "@/components/ui";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white from-gray-900 to-gray-800">
      {/* Navigation */}
      <nav className="bg-white/80 bg-gray-800/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Compel</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Commit to Your Goals
            <br />
            <span className="text-blue-600">With Real Stakes</span>
          </h1>
          <p className="text-xl text-gray-600 text-gray-300 mb-8 max-w-2xl mx-auto">
            Put your money where your mouth is. Set goals, stake money, and stay
            accountable. Fail to deliver, and your stake goes to a charity,
            anti-charity, friend, or us.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg">Start Your First Goal</Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="ghost" size="lg">
                How It Works
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="how-it-works" className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-blue-100 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Set Your Goal
            </h3>
            <p className="text-gray-600">
              Define what you want to achieve and set a monetary stake that
              motivates you.
            </p>
          </div>

          <div className="text-center p-8 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-blue-100 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Choose Where It Goes
            </h3>
            <p className="text-gray-600">
              Pick who gets the money if you fail: charity, anti-charity, a
              friend, or us.
            </p>
          </div>

          <div className="text-center p-8 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-blue-100 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Stay Accountable
            </h3>
            <p className="text-gray-600">
              Check in regularly to prove your progress. Miss check-ins, lose
              your stake.
            </p>
          </div>
        </div>

        {/* Why Compel */}
        <div className="mt-32 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Why Compel Works
          </h2>
          <p className="text-lg text-gray-600 text-gray-300 max-w-3xl mx-auto mb-12">
            Studies show that commitment devices with real consequences
            dramatically increase success rates. When your money is on the line,
            you&apos;re more likely to follow through.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-white rounded-lg shadow-sm text-left">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">3.5x</h3>
              <p className="text-gray-600">
                Higher success rate when financial stakes are involved
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm text-left">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">82%</h3>
              <p className="text-gray-600">
                Of users report increased motivation with commitment contracts
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-32 text-center pb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Commit?
          </h2>
          <p className="text-lg text-gray-600 text-gray-300 mb-8">
            Join thousands of people achieving their goals with Compel
          </p>
          <Link href="/auth/signup">
            <Button size="lg">Create Your First Goal</Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2025 Compel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
