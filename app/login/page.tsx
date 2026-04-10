"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

type FormState = {
  email: string;
  password: string;
  preferredLanguage: "english" | "urdu";
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const { setUser } = useAuth();
  const [form, setForm] = useState<FormState>({ email: "", password: "", preferredLanguage: "english" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      let data: { error?: string; user?: { name?: string; email: string } };
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Login API returned non-JSON:", text?.slice(0, 200));
        throw new Error(
          "Server error. Check that the API and database are configured (e.g. MONGODB_URI in .env.local)."
        );
      }
      try {
        data = await response.json();
      } catch {
        throw new Error("Server error. Invalid response. Please try again.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      setMessage({ type: "success", text: "Login successful! Redirecting..." });
      setUser(data.user!);
      setTimeout(() => router.push(returnTo), 900);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-white text-black flex items-center justify-center px-6 py-12">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div
          className="hidden lg:block h-full rounded-3xl p-10 shadow-lg"
          style={{ backgroundColor: "#c3bebb" }}
        >
          <p className="text-sm uppercase tracking-wide font-semibold mb-4 text-black/80">
            Teachus
          </p>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Welcome back to your personalized learning space
          </h1>
          <p className="text-black/80 text-lg leading-relaxed">
            Access courses, track assessments, and continue your AI-personalized journey.
            Login to pick up where you left off.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-wide font-semibold text-gray-500">
              Welcome back
            </p>
            <h2 className="text-3xl font-bold mt-2">Login</h2>
            <p className="text-gray-500 mt-1">Continue learning with Teachus.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email")(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password")(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Learning Language Preference</label>
              <div className="flex items-center gap-6 rounded-xl border border-gray-200 px-4 py-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="preferredLanguage"
                    checked={form.preferredLanguage === "english"}
                    onChange={() => handleChange("preferredLanguage")("english")}
                  />
                  English
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="preferredLanguage"
                    checked={form.preferredLanguage === "urdu"}
                    onChange={() => handleChange("preferredLanguage")("urdu")}
                  />
                  Urdu
                </label>
              </div>
            </div>

            {message && (
              <div
                className={`rounded-xl px-4 py-3 text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold transition-transform duration-300 hover:scale-[1.01] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            New to Teachus?{" "}
            <Link href="/register" className="font-semibold text-black hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

