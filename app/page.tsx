"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { isUrdu } from "@/lib/uiLanguage";
import { DataCollectionChart } from "@/app/components/DataCollectionChartMain";
import { LandingNavbar } from "@/app/components/LandingNavbar";
import logoTevta from "./images/tevta.png";
import logoNavttc from "./images/navttc.png";
import logoDaad from "./images/daad.png";
import logoDfki from "./images/dfki.png";
import logoMachvis from "./images/machvis.png";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user, isLoading } = useAuth();
  const urdu = isUrdu((user as { preferredLanguage?: string } | null)?.preferredLanguage);

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
  const partnerLogoWarmTone =
    "[filter:grayscale(100%)_sepia(72%)_saturate(48%)_hue-rotate(343deg)_contrast(1.04)_brightness(1.12)]";
  const partnerLogos = [
    { name: "TEVTA", src: logoTevta, compact: true },
    { name: "NAVTTC", src: logoNavttc },
    { name: "DAAD", src: logoDaad, compact: true },
    { name: "DFKI", src: logoDfki, large: true },
    { name: "MachVIS", src: logoMachvis },
  ];

  return (
    <div className={`min-h-screen bg-white text-black ${urdu ? "urdu-text" : ""}`}>
      <LandingNavbar />

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
          {!isLoading && (
            <Link
              href="/course1"
              className="inline-block bg-[#c3bebb] text-black px-8 py-3 rounded font-medium transition-all duration-300 hover:bg-[#b8b2af] transform hover:scale-[1.02] hover:shadow-md"
            >
              {urdu ? "شروع کریں" : "Get Started"}
            </Link>
          )}
        </div>

        <div className="mt-12 sm:mt-14 w-full">
          <div className="grid w-full grid-cols-5 gap-6 sm:gap-10 lg:gap-14 items-center">
            {partnerLogos.map((partner, index) => (
              <div
                key={partner.name}
                className="flex h-[7rem] sm:h-[8rem] items-center justify-center px-1 animate-logo-reveal opacity-0"
                style={{ animationDelay: `${index * 0.35}s` }}
              >
                <Image
                  src={partner.src}
                  alt={`${partner.name} logo`}
                  className={`h-auto w-full max-w-full object-contain ${partnerLogoWarmTone} ${
                    partner.compact
                      ? "max-h-[4.25rem] sm:max-h-[5rem]"
                      : partner.large
                        ? "max-h-[7.5rem] sm:max-h-[8.5rem]"
                        : "max-h-[5.75rem] sm:max-h-[6.5rem]"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 group relative overflow-hidden rounded-lg">
          <img
            src="/images/image1.png"
            alt="Car engine maintenance"
            className="w-full h-auto object-contain transition-all duration-500 group-hover:shadow-2xl"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end">
            <div className="p-6 sm:p-8 text-white max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-semibold mb-2">
                {urdu ? "آپ کا مستقبل، آپ کی مہارت" : "Your Future, Your Skills"}
              </h3>
              <p className="text-sm sm:text-base text-gray-100 leading-relaxed">
                {urdu
                  ? "عملی تربیت، اسمارٹ سفارشات اور ذاتی رہنمائی کے ساتھ جاب ریڈی مہارتیں حاصل کریں۔"
                  : "Build job-ready vocational skills through practical training, smart recommendations, and personalized guidance."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Courses Section */}
      <section id="explore-courses" className="px-8 py-5 max-w-7xl mx-auto scroll-mt-24">
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
            {urdu
              ? "ابتدائی سطح پر عملی تجربہ حاصل کریں۔ یہ کورس مہارت پر مبنی سیکھنے کے ذریعے آپ کی تکنیکی بنیاد مضبوط کرتا ہے اور حقیقی دنیا کے کاموں کے لیے اعتماد کے ساتھ تیار کرتا ہے۔"
              : "Gain practical, hands-on experience as an entry-level helper. This course focuses on skill-based learning to strengthen your technical foundations and prepare you for real-world tasks with confidence."}
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
            {urdu
              ? "عملی اور مہارت پر مبنی تربیت کے ذریعے مہارت پیدا کریں۔ یہ کورس آپ کی تکنیکی بنیاد مضبوط کرتا ہے اور بطور الیکٹریشن حقیقی دنیا کا تجربہ فراہم کرتا ہے۔"
              : "Develop hands-on expertise through practical, skill-based training. This course helps you strengthen your technical foundation and gain real-world experience as an electrician."}
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
            {urdu
              ? "اعلیٰ آٹو الیکٹرکس میں صنعت پر مبنی اور عملی تربیت کے ذریعے مہارت حاصل کریں۔ یہ کورس آپ کو پیشہ ورانہ آٹوموٹیو ماحول میں کامیابی کے لیے مضبوط عملی قابلیت دیتا ہے۔"
              : "Gain mastery in advanced auto electrics with immersive, industry-focused, skill-based training. This course equips you with practical expertise to excel in professional automotive environments."}
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
                {urdu
                  ? "اپنی پسندیدہ زبان میں سیکھیں تاکہ بہتر سمجھ، آسان رسائی اور جامع تعلیمی تجربہ حاصل ہو۔"
                  : "Learn in the language you're most comfortable with, ensuring better understanding, accessibility, and an inclusive learning experience."}
              </p>
            </div>

            <div className="p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-md border border-transparent hover:border-gray-100">
              <h3 className="text-xl font-semibold">{urdu ? "پرسنلائزڈ مواد کی تیاری" : "Personalized Content Generation"}</h3>
              <p className="text-gray-500 mt-2 text-base leading-relaxed">
                {urdu
                  ? "اپنی رفتار، پیش رفت اور ترجیحات کے مطابق ذاتی مواد حاصل کریں تاکہ آپ اہم حصوں پر بہتر توجہ دے سکیں۔"
                  : "Receive learning materials customized to your pace, progress, and preferences, helping you focus on areas that matter most."}
              </p>
            </div>

            <div className="p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-md border border-transparent hover:border-gray-100">
              <h3 className="text-xl font-semibold">{urdu ? "خودکار کوئزز" : "Automated Quizzes"}</h3>
              <p className="text-gray-500 mt-2 text-base leading-relaxed">
                {urdu
                  ? "سسٹم سے تیار کردہ کوئزز اور اسیسمنٹس کے ذریعے فوراً اپنا علم جانچیں اور فوری فیڈبیک سے اپنی بہتری کو ٹریک کریں۔"
                  : "Test your knowledge instantly with system-generated quizzes and assessments, providing immediate feedback to track your improvement."}
              </p>
            </div>

            <div className="p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-md border border-transparent hover:border-gray-100">
              <h3 className="text-xl font-semibold">{urdu ? "مضمون مخصوص چیٹ بوٹ" : "Subject Specific Chatbot"}</h3>
              <p className="text-gray-500 mt-2 text-base leading-relaxed">
                {urdu
                  ? "مخصوص مضامین میں تربیت یافتہ اے آئی چیٹ بوٹ سے بات کریں اور جب چاہیں درست اور ذہین رہنمائی حاصل کریں۔"
                  : "Interact with an AI-powered chatbot trained in specific subjects to get accurate, intelligent guidance whenever you need it."}
              </p>
            </div>

            <div className="p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-md border border-transparent hover:border-gray-100">
              <h3 className="text-xl font-semibold">{urdu ? "ہسٹری محفوظ کرنا" : "History Saving"}</h3>
              <p className="text-gray-500 mt-2 text-base leading-relaxed">
                {urdu
                  ? "آپ کی تعلیمی ہسٹری محفوظ رہتی ہے تاکہ آئندہ مواد آپ کی بڑھتی مہارت اور پیش رفت کے مطابق ہو۔"
                  : "Your learning history is stored to personalize your experience, ensuring future content aligns with your evolving skills and progress."}
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

      <DataCollectionChart urdu={urdu} />

      {/* Why Choose Us Section */}
      <section className="px-8 py-10 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-10">{urdu ? "ہمیں کیوں منتخب کریں" : "Why Choose Us"}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div
            className="p-6 rounded-lg shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-default border border-gray-300"
            style={{ backgroundColor: "#c3bebb" }}
          >
            <h3 className="font-semibold text-lg mb-2">{urdu ? "اے آئی سے چلنے والی تعلیم" : "AI-Powered Learning"}</h3>
            <p className="text-black text-sm leading-relaxed">
              {urdu
                ? "مصنوعی ذہانت کی طاقت سے اپنی رفتار اور پیش رفت کے مطابق ذاتی تربیت حاصل کریں۔ نظام آپ کی کارکردگی کا تجزیہ کرتا ہے، بہتری کے حصے بتاتا ہے اور بہتر فہم کے لیے مواد ایڈجسٹ کرتا ہے۔ اے آئی رہنمائی کے ساتھ ہر سیکھنے والا اعتماد اور مؤثریت سے کامیاب ہو سکتا ہے۔"
                : "Harness the power of artificial intelligence for adaptive, personalized training tailored to your pace and progress. The system analyzes your performance, identifies areas for improvement, and adjusts content for clearer understanding. With AI-guided support, every learner can succeed efficiently and confidently."}
            </p>
          </div>

          {/* Card 2 */}
          <div
            className="p-6 rounded-lg shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-default border border-gray-300"
            style={{ backgroundColor: "#c3bebb" }}
          >
            <h3 className="font-semibold text-lg mb-2">
              {urdu ? "صنعت سے متعلقہ مہارتیں" : "Industry-Relevant Skills"}
            </h3>
            <p className="text-black text-sm leading-relaxed">
              {urdu
                ? "صنعتی ماہرین کے تعاون سے بنائے گئے کورسز کے ذریعے عملی اور جاب ریڈی مہارتیں حاصل کریں۔ ہر ماڈیول حقیقی کام کی ضروریات کے مطابق ہے تاکہ آپ موجودہ مارکیٹ کی طلب سے ہم آہنگ ہاتھ سے کام کی صلاحیت حاصل کریں۔"
                : "Build practical, job-ready expertise through courses crafted in collaboration with industry professionals. Each module reflects real workplace requirements, ensuring you gain hands-on skills that align with current market demands and prepare you to perform confidently on the job."}
            </p>
          </div>

          {/* Card 3 */}
          <div
            className="p-6 rounded-lg shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-default border border-gray-300"
            style={{ backgroundColor: "#c3bebb" }}
          >
            <h3 className="font-semibold text-lg mb-2">{urdu ? "سرکاری طور پر تصدیق شدہ" : "Government Certified"}</h3>
            <p className="text-black text-sm leading-relaxed">
              {urdu
                ? "ہمارے پروگرام NAVTTC اور TEVTA کے معیارات کے مطابق ہیں، جس سے آپ قومی سطح پر منظور شدہ رہنما اصولوں کے مطابق تربیت حاصل کرتے ہیں۔ تکمیل پر آپ کو معتبر، سرکاری طور پر تسلیم شدہ سرٹیفکیٹ ملتا ہے جو آپ کی ملازمت کے مواقع بڑھاتا ہے۔"
                : "Our programs strictly follow NAVTTC and TEVTA standards, ensuring you receive training that meets nationally approved guidelines. Upon completion, you earn a credible, government-recognized certification that enhances your employability and is trusted by industries across the country."}
            </p>
          </div>

          {/* Card 4 */}
          <div
            className="p-6 rounded-lg shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-default border border-gray-300"
            style={{ backgroundColor: "#c3bebb" }}
          >
            <h3 className="font-semibold text-lg mb-2">{urdu ? "ملازمت کے لیے تیار نتائج" : "Job-Ready Outcomes"}</h3>
            <p className="text-black text-sm leading-relaxed">
              {urdu
                ? "مضبوط تکنیکی مہارت، عملی تجربے اور تسلیم شدہ سرٹیفکیشن کے ساتھ ورک فورس کے لیے مکمل طور پر تیار ہوں۔ ہماری تربیت آپ میں وہ اعتماد اور صلاحیت پیدا کرتی ہے جو کامیاب کیریئر کے آغاز اور ترقی کے لیے ضروری ہے۔"
                : "Graduate fully prepared for the workforce with strong technical skills, practical experience, and recognized certification. Our training builds the confidence and competence you need to begin your career successfully or take the next step toward advancement."}
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-8 py-10 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-10">{urdu ? "ہماری سیکھنے والوں کی رائے" : "What Our Learners Say"}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="transform rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:border-gray-300 hover:shadow-2xl">
            <p className="mb-6 text-lg font-medium italic leading-relaxed text-gray-900 md:text-xl">
              {urdu
                ? "“میں یوٹیوب سے جوڑ توڑ سیکھ رہا تھا۔ یہاں یونٹس واقعی ایک دوسرے پر بنتے ہیں—مجھے ڈائیگنوسٹکس سمجھ آ گئی، صرف اصطلاحیں نہیں۔”"
                : "“I was piecing things together from random videos. Here the units actually stack—you learn diagnostics, not just jargon.”"}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">H</div>
              <div>
                <h4 className="text-sm font-semibold">{urdu ? "حسن رضا" : "Hassan Raza"}</h4>
                <p className="text-xs text-gray-500">
                  {urdu ? "لاہور · الیکٹریشن کی تربیت" : "Lahore · Electrical trainee"}
                </p>
              </div>
            </div>
          </div>

          <div className="transform rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:border-gray-300 hover:shadow-2xl">
            <p className="mb-6 text-lg font-medium italic leading-relaxed text-gray-900 md:text-xl">
              {urdu
                ? "“مجھے صرف شام کا وقت ملتا تھا۔ سبق، کوئز، اور جب میں اٹک جاتا تو اسپارکی—سب ایک ہی جگہ ہونے کی وجہ سے یہ ممکن ہوا۔”"
                : "“Evenings were all I had. Having lessons, quizzes, and Sparky when I got stuck in one place is what made it doable.”"}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">F</div>
              <div>
                <h4 className="text-sm font-semibold">{urdu ? "فاطمہ نور" : "Fatima Noor"}</h4>
                <p className="text-xs text-gray-500">
                  {urdu ? "اسلام آباد · کام کے ساتھ سیکھنے والی" : "Islamabad · Learning alongside a day job"}
                </p>
              </div>
            </div>
          </div>

          <div className="transform rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:border-gray-300 hover:shadow-2xl">
            <p className="mb-6 text-lg font-medium italic leading-relaxed text-gray-900 md:text-xl">
              {urdu
                ? "“سپروائزر نے کہا کہ قومی معیار کے مطابق تیار مواد انٹرویو میں کام آئے گا۔ پہلے ورکشاپ انٹرویو پر کم گھبراہٹ تھی کیونکہ میں مکمل ماڈیول دکھا سکتا تھا۔”"
                : "“Our supervisor said the aligned coursework would matter in interviews. I was less shaky in my first workshop visit because I could point to modules I actually finished.”"}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">U</div>
              <div>
                <h4 className="text-sm font-semibold">{urdu ? "عثمان طارق" : "Usman Tariq"}</h4>
                <p className="text-xs text-gray-500">
                  {urdu ? "کراچی · کورس 2 مکمل" : "Karachi · Completed Course 2"}
                </p>
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
          {!isLoading && (
            <Link
              href="/course1"
              className="inline-block bg-white text-black px-10 py-3 rounded font-semibold transition-all duration-300 hover:bg-gray-100 transform hover:scale-105 hover:shadow-xl"
            >
              {urdu ? "شروع کریں" : "Get Started"}
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
      <footer className="text-black px-8 py-14" style={{ backgroundColor: "#c3bebb" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#6f6461] text-white flex items-center justify-center font-bold text-lg">T</div>
                <h3 className="text-2xl font-bold">Teachus</h3>
              </div>
            </div>

            <div className="md:col-span-3">
              <h4 className="font-semibold mb-4 uppercase tracking-wide text-sm text-[#4a3f3c]">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/#explore-courses" className="hover:text-[#6f6461] transition-colors">
                    Courses
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#6f6461] transition-colors">
                    User Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/assessment" className="hover:text-[#6f6461] transition-colors">
                    Automated Assessment
                  </Link>
                </li>
                <li>
                  <Link href="/sparky" className="hover:text-[#6f6461] transition-colors">
                    Sparky
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4">
              <h4 className="font-semibold mb-4 uppercase tracking-wide text-sm text-[#4a3f3c]">Contact Us</h4>
              <ul className="space-y-2 text-sm text-[#2e2624]">
                <li>
                  <a href="mailto:support@teachus.com" className="hover:text-[#6f6461] transition-colors">
                    support@teachus.com
                  </a>
                </li>
                <li>
                  <a href="tel:+923001234567" className="hover:text-[#6f6461] transition-colors">
                    +92 300 1234567
                  </a>
                </li>
                <li>Islamabad, Pakistan</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[#9f9490]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-[#4a3f3c]">© {new Date().getFullYear()} Teachus. All rights reserved.</p>
            <p className="text-xs text-[#5a4f4c]">Built for employability, inclusion, and youth empowerment.</p>
          </div>
        </div>
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

        @keyframes logo-reveal {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-logo-reveal {
          animation: logo-reveal 0.55s ease-out forwards;
        }
      `}</style>
    </div>
  );
}