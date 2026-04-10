"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth, getDisplayName } from "@/contexts/AuthContext";
import { User } from "lucide-react";
import { isUrdu } from "@/lib/uiLanguage";
import { urduFont } from "@/lib/urduFont";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user, isLoggedIn } = useAuth();
  const urdu = isUrdu((user as { preferredLanguage?: string } | null)?.preferredLanguage) || !isLoggedIn;

  const faqs = [
    {
      q: urdu ? "کیا یہ کورسز نئے سیکھنے والوں کے لیے موزوں ہیں؟" : "Are the courses beginner friendly?",
      a: urdu ? "جی ہاں، تمام کورسز مکمل ابتدائی طلبہ کے لیے مرحلہ وار رہنمائی کے ساتھ تیار کیے گئے ہیں۔" : "Yes, all courses are designed for complete beginners with step-by-step guidance.",
    },
    {
      q: urdu ? "کیا مجھے سرٹیفکیٹ ملے گا؟" : "Do I get a certificate?",
      a: urdu ? "جی ہاں، تمام کورسز NAVTTC اور TEVTA کے ذریعے سرکاری طور پر تسلیم شدہ سرٹیفکیٹ فراہم کرتے ہیں۔" : "Yes, all courses provide government-recognized certification through NAVTTC & TEVTA.",
    },
    {
      q: urdu ? "کیا سیکھنا اپنی رفتار کے مطابق ہے؟" : "Is the learning self-paced?",
      a: urdu ? "جی ہاں، آپ AI پرسنلائزڈ سپورٹ کے ساتھ اپنی رفتار کے مطابق کسی بھی وقت سیکھ سکتے ہیں۔" : "Yes, you can learn anytime at your own pace with AI-personalized support.",
    },
    {
      q: urdu ? "کیا پہلے سے تکنیکی علم ضروری ہے؟" : "Do I need prior technical knowledge?",
      a: urdu ? "نہیں، تمام کورسز بنیادی سطح سے شروع ہو کر بتدریج اعلیٰ مہارتوں تک لے جاتے ہیں۔" : "No, all courses start from basics and gradually move to advanced skills.",
    },
  ];

  return (
    <div className={`min-h-screen bg-white text-black ${urdu ? urduFont.className : ""}`}>
      {/* Navigation with subtle shadow */}
      <nav className="flex items-center justify-between px-8 py-4 sticky top-0 bg-white/95 backdrop-blur-sm z-50 shadow-sm">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-lg font-bold text-black tracking-wide transition-colors duration-200 group-hover:text-gray-700">
              Teachus
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-sm cursor-pointer hover:text-gray-700 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full">
              {urdu ? "اسپارکی" : "Sparky"}
            </span>
            <span className="text-sm cursor-pointer hover:text-gray-700 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full">
              {urdu ? "خودکار اسیسمنٹ" : "Automated Assessment"}
            </span>
            <span className="text-sm cursor-pointer hover:text-gray-700 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full">
              {urdu ? "کورسز" : "Courses"}
            </span>
            <Link href="/dashboard" className="text-sm cursor-pointer hover:text-gray-700 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full">
              {urdu ? "یوزر ڈیش بورڈ" : "User Dashboard"}
            </Link>
          </div>
        </div>

        {isLoggedIn && user ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
          >
            <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
              <User className="w-4 h-4" />
            </span>
            <span className="max-w-[120px] truncate">{getDisplayName(user)}</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="bg-black text-white px-6 py-2 rounded text-sm font-medium transition-all duration-300 hover:bg-gray-800 transform hover:scale-105 hover:shadow-lg"
          >
            {urdu ? "لاگ اِن" : "Login"}
          </Link>
        )}
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-16 max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold mb-6 leading-tight animate-fade-in">
            {urdu ? "کثیر لسانی اور ذاتی نوعیت کی" : "Multilingual Personalized"}
            <br />
            {urdu ? "ووکیشنل ٹریننگ" : "Vocational Training"}
          </h1>
          <p className="text-gray-600 mb-8 text-lg animate-fade-in-delay">
            {urdu
              ? "پرسنلائزڈ اور کثیر لسانی تربیت جو جدید ریکمینڈیشن انٹیلیجنس سے چلتی ہے تاکہ مہارتیں بہتر ہوں، روزگار کے مواقع بڑھیں اور نوجوان بااختیار بنیں۔"
              : "Personalized, multilingual training powered by Recommendation Intelligence to enhance skills, boost employability, and drive youth empowerment."}
          </p>
          {!isLoggedIn && (
            <Link
              href="/register"
              className="inline-block bg-black text-white px-8 py-3 rounded font-medium transition-all duration-300 hover:bg-gray-800 transform hover:scale-105 hover:shadow-xl"
            >
              {urdu ? "ابھی رجسٹر کریں!" : "Register now !"}
            </Link>
          )}
        </div>

        <div className="mt-12 group">
          <img
            src="/images/image1.png"
            alt="Car engine maintenance"
            className="rounded-lg w-full h-auto object-contain transition-all duration-500 hover:shadow-2xl"
          />
        </div>
      </section>

      {/* Explore Courses Section */}
      <section className="px-8 py-5 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">{urdu ? "کورسز دریافت کریں" : "Explore Courses"}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Course 1 */}
          <a
        href="/course1"
        className="group rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer bg-white block"
          >
        <div className="w-full h-[400px] overflow-hidden relative">
          <img
            src="/images/image2.png"
            alt="Course 1"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
        </div>
        <div className="p-6 bg-white">
          <h3 className="font-semibold text-xl mt-4 transition-colors duration-200 group-hover:text-gray-700">Course 1</h3>
          <p className="text-md font-medium text-gray-700 mt-1">
            {urdu ? "دورانیہ: 3 ماہ" : "Duration: 3 Months"}
          </p>
          <p className="text-gray-500 mt-2 text-base leading-relaxed">
            Gain practical, hands-on experience as an entry-level helper.
            This course focuses on skill-based learning to strengthen your
            technical foundations and prepare you for real-world tasks with
            confidence.
          </p>
        </div>
          </a>

          {/* Course 2 */}
          <a
        href="/course2"
        className="group rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer bg-white block"
          >
        <div className="w-full h-[400px] overflow-hidden relative">
          <img
            src="/images/image3.png"
            alt="Course 2"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
        </div>
        <div className="p-6 bg-white">
          <h3 className="font-semibold text-xl mt-4 transition-colors duration-200 group-hover:text-gray-700">Course 2</h3>
          <p className="text-md font-medium text-gray-700 mt-1">
            {urdu ? "دورانیہ: 6 ماہ" : "Duration: 6 Months"}
          </p>
          <p className="text-gray-500 mt-2 text-base leading-relaxed">
            Develop hands-on expertise through practical, skill-based
            training. This course helps you strengthen your technical
            foundation and gain real-world experience as an electrician.
          </p>
        </div>
          </a>

          {/* Course 3 */}
          <a
        href="/course3"
        className="group rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer bg-white block"
          >
        <div className="w-full h-[400px] overflow-hidden relative">
          <img
            src="/images/image4.png"
            alt="Course 3"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
        </div>
        <div className="p-6 bg-white">
          <h3 className="font-semibold text-xl mt-4 transition-colors duration-200 group-hover:text-gray-700">Course 3</h3>
          <p className="text-md font-medium text-gray-700 mt-1">
            {urdu ? "دورانیہ: 12 ماہ" : "Duration: 12 Months"}
          </p>
          <p className="text-gray-500 mt-2 text-base leading-relaxed">
            Gain mastery in advanced auto electrics with immersive,
            industry-focused, skill-based training. This course equips you
            with practical expertise to excel in professional automotive
            environments.
          </p>
        </div>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-8 py-20 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">{urdu ? "خصوصیات" : "Features"}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Text Side */}
          <div className="space-y-6">
            <div className="p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-md border border-transparent hover:border-gray-100">
              <h3 className="text-xl font-semibold">{urdu ? "کثیر لسانی سپورٹ (اردو اور انگریزی)" : "Multilingual Support (Urdu & English)"}</h3>
              <p className="text-gray-500 mt-2 text-base leading-relaxed">
                Learn in the language you're most comfortable with, ensuring
                better understanding, accessibility, and an inclusive learning
                experience.
              </p>
            </div>

            <div className="p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-md border border-transparent hover:border-gray-100">
              <h3 className="text-xl font-semibold">{urdu ? "پرسنلائزڈ مواد کی تیاری" : "Personalized Content Generation"}</h3>
              <p className="text-gray-500 mt-2 text-base leading-relaxed">
                Receive learning materials customized to your pace, progress,
                and preferences, helping you focus on areas that matter most.
              </p>
            </div>

            <div className="p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-md border border-transparent hover:border-gray-100">
              <h3 className="text-xl font-semibold">{urdu ? "خودکار کوئزز" : "Automated Quizzes"}</h3>
              <p className="text-gray-500 mt-2 text-base leading-relaxed">
                Test your knowledge instantly with system-generated quizzes and
                assessments, providing immediate feedback to track your
                improvement.
              </p>
            </div>

            <div className="p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-md border border-transparent hover:border-gray-100">
              <h3 className="text-xl font-semibold">{urdu ? "مضمون مخصوص چیٹ بوٹ" : "Subject Specific Chatbot"}</h3>
              <p className="text-gray-500 mt-2 text-base leading-relaxed">
                Interact with an AI-powered chatbot trained in specific subjects
                to get accurate, intelligent guidance whenever you need it.
              </p>
            </div>

            <div className="p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-md border border-transparent hover:border-gray-100">
              <h3 className="text-xl font-semibold">{urdu ? "ہسٹری محفوظ کرنا" : "History Saving"}</h3>
              <p className="text-gray-500 mt-2 text-base leading-relaxed">
                Your learning history is stored to personalize your experience,
                ensuring future content aligns with your evolving skills and
                progress.
              </p>
            </div>
          </div>

          {/* Right Image Side */}
          <div className="pt-2">
            <img
              src="/images/image5.png"
              alt="Robot hand reaching human hand"
              className="rounded-lg w-full h-auto object-cover transition-all duration-500 hover:shadow-2xl transform hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="px-8 py-10 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-10">{urdu ? "ہمیں کیوں منتخب کریں" : "Why Choose Us"}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div
            className="p-6 rounded-lg shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-default border border-gray-300"
            style={{ backgroundColor: "#c3bebb" }}
          >
            <h3 className="font-semibold text-lg mb-2">AI-Powered Learning</h3>
            <p className="text-black text-sm leading-relaxed">
              Harness the power of artificial intelligence for adaptive,
              personalized training tailored to your pace and progress. The
              system analyzes your performance, identifies areas for
              improvement, and adjusts content for clearer understanding. With
              AI-guided support, every learner can succeed efficiently and
              confidently.
            </p>
          </div>

          {/* Card 2 */}
          <div
            className="p-6 rounded-lg shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-default border border-gray-300"
            style={{ backgroundColor: "#c3bebb" }}
          >
            <h3 className="font-semibold text-lg mb-2">
              Industry-Relevant Skills
            </h3>
            <p className="text-black text-sm leading-relaxed">
              Build practical, job-ready expertise through courses crafted in
              collaboration with industry professionals. Each module reflects
              real workplace requirements, ensuring you gain hands-on skills
              that align with current market demands and prepare you to perform
              confidently on the job.
            </p>
          </div>

          {/* Card 3 */}
          <div
            className="p-6 rounded-lg shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-default border border-gray-300"
            style={{ backgroundColor: "#c3bebb" }}
          >
            <h3 className="font-semibold text-lg mb-2">Government Certified</h3>
            <p className="text-black text-sm leading-relaxed">
              Our programs strictly follow NAVTTC and TEVTA standards, ensuring
              you receive training that meets nationally approved guidelines.
              Upon completion, you earn a credible, government-recognized
              certification that enhances your employability and is trusted by
              industries across the country.
            </p>
          </div>

          {/* Card 4 */}
          <div
            className="p-6 rounded-lg shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-default border border-gray-300"
            style={{ backgroundColor: "#c3bebb" }}
          >
            <h3 className="font-semibold text-lg mb-2">Job-Ready Outcomes</h3>
            <p className="text-black text-sm leading-relaxed">
              Graduate fully prepared for the workforce with strong technical
              skills, practical experience, and recognized certification. Our
              training builds the confidence and competence you need to begin
              your career successfully or take the next step toward
              advancement.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-8 py-10 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-10">{urdu ? "ہماری سیکھنے والوں کی رائے" : "What Our Learners Say"}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonial 1 */}
          <div className="p-6 rounded-xl border border-gray-200 shadow-sm bg-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:border-gray-300">
            <p className="text-xl font-medium italic mb-6">
              "A terrific piece of praise"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                N
              </div>
              <div>
                <h4 className="font-semibold text-sm">Name</h4>
                <p className="text-gray-500 text-xs">Description</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="p-6 rounded-xl border border-gray-200 shadow-sm bg-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:border-gray-300">
            <p className="text-xl font-medium italic mb-6">
              "A fantastic bit of feedback"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                N
              </div>
              <div>
                <h4 className="font-semibold text-sm">Name</h4>
                <p className="text-gray-500 text-xs">Description</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="p-6 rounded-xl border border-gray-200 shadow-sm bg-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:border-gray-300">
            <p className="text-xl font-medium italic mb-6">
              "A genuinely glowing review"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                N
              </div>
              <div>
                <h4 className="font-semibold text-sm">Name</h4>
                <p className="text-gray-500 text-xs">Description</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-20"></div>

      {/* Call To Action Section */}
      <section
        className="px-8 py-20 text-black text-center relative overflow-hidden"
        style={{ backgroundColor: "#c3bebb" }}
      >
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-6">
            {urdu ? "اپنا تعلیمی سفر آج ہی شروع کریں" : "Start Your Learning Journey Today"}
          </h2>
          <p className="text-black text-lg mb-8">
            {urdu
              ? "ہزاروں سیکھنے والوں میں شامل ہوں جو Teachus کے ساتھ مطلوبہ ووکیشنل مہارتیں سیکھ رہے ہیں۔"
              : "Join thousands of learners building in-demand vocational skills with Teachus."}
          </p>
          {!isLoggedIn && (
            <Link
              href="/register"
              className="inline-block bg-white text-black px-10 py-3 rounded font-semibold transition-all duration-300 hover:bg-gray-100 transform hover:scale-105 hover:shadow-xl"
            >
              {urdu ? "ابھی رجسٹر کریں" : "Register Now"}
            </Link>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-8 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-10">{urdu ? "اکثر پوچھے گئے سوالات" : "Frequently Asked Questions"}</h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 hover:bg-gray-50 transition-colors duration-200 rounded-lg px-4">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="flex justify-between items-center w-full text-left py-4"
              >
                <h3 className="font-semibold text-lg">{faq.q}</h3>
                <span className="text-gray-500 transition-transform duration-300" style={{ transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  {openFaq === index ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 12h-15"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  )}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openFaq === index ? "max-h-96 mt-2" : "max-h-0"
                }`}
              >
                <p className="text-gray-600 pb-4">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="text-black px-8 py-12"
        style={{ backgroundColor: "#c3bebb" }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Logo */}
          <div>
            <h3 className="text-xl font-bold">Teachus</h3>
            <p className="text-black mt-2 text-sm">
              Empowering youth with modern vocational skills.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-black text-sm">
              <li className="cursor-pointer hover:text-gray-700 transition-all duration-200 hover:translate-x-1">
                Courses
              </li>
              <li className="cursor-pointer hover:text-gray-700 transition-all duration-200 hover:translate-x-1">
                User Dashboard
              </li>
              <li className="cursor-pointer hover:text-gray-700 transition-all duration-200 hover:translate-x-1">
                Automated Assessment
              </li>
              <li className="cursor-pointer hover:text-gray-700 transition-all duration-200 hover:translate-x-1">
                Sparky
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-black text-sm">
              <li className="cursor-pointer hover:text-gray-700 transition-all duration-200 hover:translate-x-1">
                Email: support@teachus.com
              </li>
              <li className="cursor-pointer hover:text-gray-700 transition-all duration-200 hover:translate-x-1">
                Phone: +92 300 1234567
              </li>
              <li>Location: Islamabad, Pakistan</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-black text-sm mt-10">
          © {new Date().getFullYear()} Teachus. All rights reserved.
        </p>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
}