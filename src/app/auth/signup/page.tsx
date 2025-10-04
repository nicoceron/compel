import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/components/ui";
import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Compel
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Commit to your goals with real stakes
          </p>
        </div>

        <Card variant="elevated">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Create Account
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Start your commitment journey today
            </p>
          </CardHeader>

          <CardBody>
            <AuthForm mode="signup" />

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
              </span>
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

