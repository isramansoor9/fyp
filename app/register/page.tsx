"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { urduFont } from "@/lib/urduFont";


const PAKISTAN_CITIES = [
  "Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Multan", "Hyderabad",
  "Gujranwala", "Peshawar", "Islamabad", "Quetta", "Sialkot", "Bahawalpur",
  "Sargodha", "Sukkur", "Larkana", "Sheikhupura", "Mardan", "Rahim Yar Khan",
  "Gujrat", "Kasur", "Dera Ghazi Khan", "Mingora", "Sahiwal", "Nawabshah",
  "Okara", "Mirpur Khas", "Chiniot", "Kamoke", "Sadiqabad", "Burewala",
  "Jacobabad", "Muzaffargarh", "Muridke", "Jhang", "Mandi Bahauddin",
  "Sanghar", "Chakwal", "Tando Adam Khan", "Gojra", "Bahawalnagar",
  "Pakpattan", "Daska", "Turbat", "Other"
];

type FormState = {
  firstName: string;
  lastName: string;
  city: string;
  phone: string;
  cnic: string;
  email: string;
  password: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [uiLanguage, setUiLanguage] = useState<"english" | "urdu">("english");
  const urdu = uiLanguage === "urdu";
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    city: "",
    phone: "",
    cnic: "",
    email: "",
    password: "",
  });
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
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, preferredLanguage: uiLanguage }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Register API returned non-JSON:", text?.slice(0, 200));
        throw new Error(
          "Server error. Add MONGODB_URI to .env.local and ensure MongoDB is running."
        );
      }
      let data: { error?: string };
      try {
        data = await response.json();
      } catch {
        throw new Error("Server error. Please try again.");
      }
      if (!response.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      setMessage({ type: "success", text: "Account created! Redirecting to login..." });
      setTimeout(() => router.push("/login"), 900);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-white text-black flex items-center justify-center px-6 py-12 ${urdu ? `${urduFont.className} urdu-text` : ""}`}>
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div
          className="hidden lg:block h-full rounded-3xl p-10 shadow-lg"
          style={{ backgroundColor: "#c3bebb" }}
        >
          <p className="text-sm uppercase tracking-wide font-semibold mb-4 text-black/80">
            Teachus
          </p>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            {urdu ? "کثیر لسانی ذاتی ووکیشنل پلیٹ فارم میں شامل ہوں" : "Join the Multilingual Personalized Vocational Training Platform"}
          </h1>
          <p className="text-black/80 text-lg leading-relaxed">
            {urdu
              ? "اے آئی ذاتی لرننگ پاتھ کے ساتھ جاب ریڈی مہارتیں بنائیں۔ رجسٹر کریں اور کورسز، اسیسمنٹس اور اپنا ڈیش بورڈ حاصل کریں۔"
              : "Build job-ready skills with AI-personalized learning paths. Register now to unlock courses, assessments, and your tailored dashboard."}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-wide font-semibold text-gray-500">
              {urdu ? "اکاؤنٹ بنائیں" : "Create Account"}
            </p>
            <h2 className="text-3xl font-bold mt-2">{urdu ? "رجسٹر کریں" : "Register"}</h2>


            <p className="text-gray-500 mt-1">
              {urdu ? "اپنا تعلیمی سفر چند منٹ میں شروع کریں۔" : "Start your learning journey in minutes."}
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{urdu ? "انٹرفیس زبان" : "Interface Language"}</label>
            <div className="flex items-center gap-6 rounded-xl border border-gray-200 px-4 py-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="radio" checked={!urdu} onChange={() => setUiLanguage("english")} />
                English
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="radio" checked={urdu} onChange={() => setUiLanguage("urdu")} />
                اردو
              </label>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  required
                  type="text"
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName")(e.target.value)}
                  placeholder="Enter your first name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  required
                  type="text"
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName")(e.target.value)}
                  placeholder="Enter your last name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region (City in Pakistan)</label>
                <select
                  required
                  value={form.city}
                  onChange={(e) => handleChange("city")(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition bg-white"
                >
                  <option value="">Select your city</option>
                  {PAKISTAN_CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone")(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CNIC</label>
              <input
              required
              type="text"
              value={form.cnic}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 13) handleChange("cnic")(value);
              }}
              placeholder="13-digit CNIC"
              maxLength={13}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition"
              />
              <p className="text-xs text-gray-400 mt-1">13 digits, no dashes.</p>
            </div>
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
                minLength={6}
                value={form.password}
                onChange={(e) => handleChange("password")(e.target.value)}
                placeholder="Create a password"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition"
              />
              <p className="text-xs text-gray-400 mt-1">At least 6 characters.</p>
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-black hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
