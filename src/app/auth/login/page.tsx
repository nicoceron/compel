import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/components/ui";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Compel
          </h1>
          <p className="text-gray-600">
            Commit to your goals with real stakes
          </p>
        </div>

        <Card variant="elevated">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">
              Sign In
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Welcome back! Sign in to your account
            </p>
          </CardHeader>

          <CardBody>
            <AuthForm mode="login" />

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">
                Don&apos;t have an account?{" "}
              </span>
              <Link
                href="/auth/signup"
                className="text-blue-600 hover:text-blue-700 text-blue-400 hover:text-blue-300 font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

