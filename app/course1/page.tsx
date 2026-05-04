"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Calendar, Globe, TrendingUp, BarChart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import EnrollModal from "@/components/EnrollModal";
import { isUrdu } from "@/lib/uiLanguage";
import { LandingNavbar } from "@/app/components/LandingNavbar";

const COURSE_NAME = "Course 1";
const COURSE_LEARN_PATH = "/course1/learn";

const FOUNDATION_BROWN = "#968e8a";

const courseContentPanelClass =
  "rounded-2xl border border-gray-200/70 bg-[#f4f3f2] overflow-hidden shadow-none";

export default function Course1() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const urdu = isUrdu((user as { preferredLanguage?: string } | null)?.preferredLanguage);

  const enrolledCourse = (user as { course?: string; courseEnrolled?: string } | null)?.course ?? (user as { courseEnrolled?: string } | null)?.courseEnrolled ?? null;
  const isEnrolledInThis = enrolledCourse === COURSE_NAME;
  const isEnrolledInOther = enrolledCourse != null && enrolledCourse !== COURSE_NAME;

  const doEnroll = async () => {
    if (!user) return;
    const u = user as { userId?: string; email?: string };
    setEnrolling(true);
    try {
      const res = await fetch("http://localhost:5000/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.userId, email: u.email, course: COURSE_NAME }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (urdu ? "داخلہ ناکام ہوگیا" : "Enrollment failed"));
      setUser({ ...user, ...data.user });
      router.push(COURSE_LEARN_PATH);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : (urdu ? "داخلہ ناکام ہوگیا" : "Enrollment failed"));
    } finally {
      setEnrolling(false);
      setShowEnrollModal(false);
    }
  };

  const handleStartCourse = () => {
    if (!user) {
      router.push("/login?returnTo=/course1");
      return;
    }
    if (isEnrolledInThis) {
      router.push(COURSE_LEARN_PATH);
      return;
    }
    if (isEnrolledInOther) {
      setShowEnrollModal(true);
      return;
    }
    doEnroll();
  };

  const handleConfirmSwitch = () => doEnroll();

  const courseModules = [
    { no: 1, component: "Basic Knowledge", theory: 6, practical: 30, total: 36 },
    { no: 2, component: "Measuring", theory: 0, practical: 30, total: 30 },
    { no: 3, component: "Basics of Electrician", theory: 0, practical: 69, total: 69 },
    { no: 4, component: "Bench Work", theory: 6, practical: 0, total: 6 },
    { no: 5, component: "Battery", theory: 3, practical: 30, total: 33 },
    { no: 6, component: "Starting System", theory: 3, practical: 30, total: 33 },
    { no: 7, component: "Charging System", theory: 6, practical: 30, total: 36 },
    { no: 8, component: "Ignition System", theory: 6, practical: 30, total: 36 },
    { no: 9, component: "Electrical and Electronic Devices", theory: 6, practical: 0, total: 6 },
    { no: 10, component: "Wiring Circuits & Wiring Board", theory: 0, practical: 63, total: 63 },
    { no: 11, component: "Work Ethics", theory: 0, practical: 12, total: 12 },
  ];

  const skillProficiencyItems = [
    {
      en: "Use auto electrician workshop tools and equipment efficiently",
      ur: "آٹو الیکٹریشن ورکشاپ کے اوزار اور سامان مؤثر طریقے سے استعمال کر سکے۔",
    },
    {
      en: "Maintain and charge the batteries.",
      ur: "بیٹریوں کی دیکھ بھال اور چارجنگ کر سکے۔",
    },
    {
      en: "Perform simple workshop techniques as series and parallel circuits, making tester, jumper wires, soldering, tapping, sleeving, connecting thimble etc.",
      ur: "سادہ ورکشاپ تکنیکیں جیسے سیریز اور پارلل سرکٹس، ٹیسٹر بنانا، جمپر وائر، سولڈنگ، ٹپنگ، سلِیوز، تھمبل کنیکشن وغیرہ کر سکے۔",
    },
    {
      en: "Disassemble and assemble the self-starters and to check and its service.",
      ur: "سیلف اسٹارٹرز کو کھول کر دوبارہ جمع کر سکے، ان کی جانچ اور سروس کر سکے۔",
    },
    {
      en: "Disassemble and assemble the AC-generators for check & service.",
      ur: "ای سی جنریٹرز (آلٹرنیٹر) کو کھول کر جمع کر سکے، جانچ اور سروس کر سکے۔",
    },
    {
      en: "Draw the wiring diagrams of popular vehicles in the country.",
      ur: "ملک میں مقبول گاڑیوں کی وائرنگ ڈائگرام بنا سکے۔",
    },
    {
      en: "Install components, switches, Fuses and relays.",
      ur: "جزو، سوئچز، فیوز اور ریلے نصب کر سکے۔",
    },
    {
      en: "Wire up the electrical circuits.",
      ur: "برقی سرکٹس وائر اپ کر سکے۔",
    },
    {
      en: "Locate the faults and apply the remedies for starting, charging & ignition systems.",
      ur: "سٹارٹنگ، چارجنگ اور اگنیشن نظاموں میں خرابیاں تلاش کر کے ان کا علاج لاگو کر سکے۔",
    },
  ];

  const knowledgeProficiencyItems = [
    {
      en: "Define the basic workshop rules, and safety precautions",
      ur: "بنیادی ورکشاپ قوانین اور حفاظتی احتیاطی تدابیر بیان کر سکے۔",
    },
    {
      en: "Define the basic electric terms.",
      ur: "بنیادی برقی اصطلاحات بیان کر سکے۔",
    },
    {
      en: "Explain the names and use of workshop tools.",
      ur: "ورکشاپ کے اوزار کے نام اور ان کے استعمال بیان کر سکے۔",
    },
    {
      en: "Explain the various electrical components, their location, operation, and function.",
      ur: "مختلف برقی اجزاء، ان کی جگہ، طریقۂ کار اور فعل بیان کر سکے۔",
    },
    {
      en: "Describe the construction and function of battery.",
      ur: "بیٹری کی تعمیر اور کام بیان کر سکے۔",
    },
    {
      en: "Describe the construction and function of self-starter.",
      ur: "سیلف اسٹارٹر کی تعمیر اور کام بیان کر سکے۔",
    },
    {
      en: "Express the construction and function of Alternator.",
      ur: "آلٹرنیٹر کی تعمیر اور کام واضح طور پر پیش کر سکے۔",
    },
    {
      en: "Express the construction and function of voltage Regulators.",
      ur: "وولٹیج ریگولیٹرز کی تعمیر اور کام واضح طور پر پیش کر سکے۔",
    },
    {
      en: "Explain the construction and function of Relays.",
      ur: "ریلے کی تعمیر اور کام بیان کر سکے۔",
    },
    {
      en: "Explain the various electrical components",
      ur: "مختلف برقی اجزاء بیان کر سکے۔",
    },
    {
      en: "Define the different circuits applied in a Car wiring.",
      ur: "کار وائرنگ میں استعمال ہونے والے مختلف سرکٹس بیان کر سکے۔",
    },
    {
      en: "Understand the components of charging, ignition & starting systems.",
      ur: "چارجنگ، اگنیشن اور اسٹارٹنگ نظاموں کے اجزاء کو سمجھ سکے۔",
    },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] text-gray-600 ${urdu ? "urdu-text" : ""}`}>
      <LandingNavbar />

      {/* Hero Section */}
      <section className="px-4 pt-8 pb-3 sm:px-6 sm:pt-10 sm:pb-3 max-w-7xl mx-auto text-gray-600">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 p-5 sm:p-8 lg:p-12">
            {/* Left Content */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                Automotive Electrical <br/><span className="text-[#968e8a]">Foundations</span>
                <span className="block text-gray-500 text-xl font-medium mt-2">{urdu ? "کورس 1 (3 ماہ کا انٹینسیو پروگرام)" : "Course 1 (3 Month Intensive)"}</span>
              </h1>
              
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {urdu
                  ? "یہ کورس ابتدائی طلبہ کے لیے ڈیزائن کیا گیا ہے تاکہ وہ آٹو الیکٹریکل سسٹمز میں عملی مہارت حاصل کریں۔ تین ماہ میں بیٹری، چارجنگ اور وائرنگ پر ہاتھ سے کام سیکھیں اور اپنے کیریئر کا مضبوط آغاز کریں۔"
                  : "Designed for beginners to master practical skills in automotive electrical systems. Over three months, gain rapid hands-on experience with batteries, charging, and wiring. This intensive program prioritizes real-world safety and basic troubleshooting to jumpstart your career."}
              </p>

              <button
              onClick={handleStartCourse}
              disabled={enrolling}
              className="bg-black text-white px-12 py-5 rounded-2xl font-bold hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isEnrolledInThis
                ? (urdu ? "سیکھنا جاری رکھیں" : "Continue Learning")
                : (urdu ? "کورس شروع کریں" : "Start Course")}
            </button>
            </div>

            {/* Right - Course Stats */}
            <div className="bg-[#f4f3f2] rounded-xl p-8 border border-[#c3bebb]/30">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">{urdu ? "کریکولم کی جھلک" : "Curriculum Salients"}</h3>
              
              <div className="space-y-4">
                {[
                  { icon: <TrendingUp className="w-5 h-5" />, label: urdu ? "داخلہ لیول" : "Entry Level", val: urdu ? "مڈل" : "Middle" },
                  { icon: <Calendar className="w-5 h-5" />, label: urdu ? "کل دورانیہ" : "Total Duration", val: urdu ? "3 ماہ" : "3 Months" },
                  { icon: <Globe className="w-5 h-5" />, label: urdu ? "زبانِ تدریس" : "Instruction Medium", val: "Urdu / English" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border-l-4 border-[#c3bebb]">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <span className="font-bold text-gray-900">{item.val}</span>
                  </div>
                ))}

                <div className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-[#c3bebb]">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">{urdu ? "کل تربیتی گھنٹے" : "Total Training Hours"}</span>
                  </div>
                  <div className="ml-8 grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-[#c3bebb]/10 p-2 rounded text-center flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-gray-500">{urdu ? "کل" : "Total"}</span>
                      <strong className="text-gray-900 text-base">360 Hrs</strong>
                    </div>
                    <div className="bg-[#c3bebb]/10 p-2 rounded text-center flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-gray-500">{urdu ? "ہفتہ وار" : "Weekly"}</span>
                      <strong className="text-gray-900 text-base">30 Hrs</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border-l-4 border-[#c3bebb]">
                  <div className="flex items-center gap-3">
                    <BarChart className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">{urdu ? "طریقہ کار" : "Methodology"}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{urdu ? "عملی 90%" : "Practical 90%"}</span>
                    <span className="text-xs text-gray-500 block">{urdu ? "نظری 10%" : "Theory 10%"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Training Objectives */}
      <section className="px-6 py-3 max-w-7xl mx-auto">
        <div className={courseContentPanelClass}>
          <div className="p-7 md:p-9">
            <h3 className="text-2xl font-bold text-gray-900 mb-5">
              {urdu ? "یہ کورس کیوں؟" : "What this course sets out to do"}
            </h3>
            <div>
              <p className="text-lg leading-relaxed text-gray-600">
                {urdu
                  ? "موٹر گاڑیاں دن بہ دن بڑھ رہی ہیں اور لوگوں کی ضرورت بن چکی ہیں۔ گاڑیوں کو چلتے رہنے کے لیے تربیت یافتہ افراد کی ضرورت ہے۔ یہ نصاب جاب مارکیٹ کی مانگ کو مدِّنظر رکھ کر تیار کیا گیا ہے تاکہ تربیت حاصل کرنے والوں کو گاڑیوں کے برقی سرکٹس، بیٹری، سیلف اسٹارٹر اور الٹرنیٹر کی مرمت، ٹربل شوٹنگ اور دیکھ بھال کی ضروری مہارت اور علم دیا جا سکے — اخلاقی اقدار کے ساتھ۔"
                  : "Automobiles are increasing day by day as an essential need of the people. In order to keep vehicles in working condition, trained technicians are required. This curriculum is designed and developed to impart the skills and theoretical knowledge required for repairing, troubleshooting, and maintenance of electric circuits, batteries, self-starters, and alternators equipping trainees to meet job market demand alongside strong ethical values."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Modules */}
      <section className="px-6 py-3 max-w-7xl mx-auto">
        <div className={courseContentPanelClass}>
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {urdu ? "فہرستِ مضامین" : "Table of Contents"}
            </h2>
            <div className="overflow-x-auto rounded-xl bg-[#ebe8e6]">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: FOUNDATION_BROWN }}>
                    <th className="text-left px-4 py-3 text-base font-bold text-white">Sr. No.</th>
                    <th className="text-left px-4 py-3 text-base font-bold text-white">Course Component</th>
                    <th className="text-center px-4 py-3 text-base font-bold text-white">Theory (Hrs)</th>
                    <th className="text-center px-4 py-3 text-base font-bold text-white">Practical (Hrs)</th>
                    <th className="text-center px-4 py-3 text-base font-bold text-white">Total (Hrs)</th>
                  </tr>
                </thead>
                <tbody>
                  {courseModules.map((module, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-300/40 last:border-b-0 ${index % 2 === 0 ? "bg-[#f5f4f3]" : "bg-[#e8e4e2]"}`}
                    >
                      <td className="px-4 py-3 text-[#5c5755]">{module.no}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{module.component}</td>
                      <td className="px-4 py-3 text-center text-[#5c5755]">{module.theory}</td>
                      <td className="px-4 py-3 text-center text-[#5c5755]">{module.practical}</td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-900">{module.total}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-gray-400/45 bg-[#d4cfcc] font-bold">
                    <td className="px-4 py-3 text-[#2d2a28]" colSpan={2}>Total</td>
                    <td className="px-4 py-3 text-center text-[#2d2a28]">36</td>
                    <td className="px-4 py-3 text-center text-[#2d2a28]">324</td>
                    <td className="px-4 py-3 text-center text-[#2d2a28]">360</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Skill Proficiency Details */}
      <section className="px-6 py-3 max-w-7xl mx-auto">
        <div className={courseContentPanelClass}>
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {urdu ? "مہارتی اہلیت کی تفصیلات" : "Skill proficiency details"}
            </h2>
            <p className="text-lg font-medium text-gray-800 mb-6">
              {urdu
                ? "اس کورس کی کامیاب تکمیل پر، تربیت حاصل کرنے والا درج ذیل کر سکنا چاہیے:"
                : "On successful completion of this course, the trainee should be able to:"}
            </p>
            <ol className="list-decimal list-outside pl-6 space-y-3 text-lg leading-relaxed text-gray-600">
              {skillProficiencyItems.map((item, index) => (
                <li key={index} className="pl-1">
                  {urdu ? item.ur : item.en}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Knowledge Proficiency Details */}
      <section className="px-6 py-3 max-w-7xl mx-auto">
        <div className={courseContentPanelClass}>
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {urdu ? "علمی اہلیت کی تفصیلات" : "Knowledge proficiency details"}
            </h2>
            <p className="text-lg font-medium text-gray-800 mb-6">
              {urdu
                ? "اس کورس کی کامیاب تکمیل پر، تربیت حاصل کرنے والا درج ذیل کر سکنا چاہیے:"
                : "On successful completion of this course, the trainee should be able to:"}
            </p>
            <ol className="list-decimal list-outside pl-6 space-y-3 text-lg leading-relaxed text-gray-600">
              {knowledgeProficiencyItems.map((item, index) => (
                <li key={index} className="pl-1">
                  {urdu ? item.ur : item.en}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

            {/* CTA Section */}
      <section className="px-6 py-16 max-w-7xl mx-auto ">
         <div className="bg-[#c3bebb] text-black rounded-3xl p-12 text-center shadow-2xl shadow-[#c3bebb]/40 relative overflow-hidden">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <h2 className="text-4xl font-bold mb-4">{urdu ? "اپنا ٹیکنیکل کیریئر شروع کریں" : "Start Your Technical Career"}</h2>
           <p className="text-lg mb-8 max-w-2xl mx-auto font-medium opacity-80">
             {urdu ? "جدید آٹوموٹیو دنیا کے لیے بنے کورس میں شامل ہوں۔ 80% عملی تربیت اور 100% توجہ آپ کی کامیابی پر۔" : "Join the course designed for the modern automotive world. 80% practical training, 100% focused on your success."}
           </p>
           <button className="bg-white text-black px-12 py-5 rounded-2xl font-bold border border-gray-200 shadow-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105">
             {urdu ? "آج ہی داخلہ لیں" : "Enroll in Course 1 Today"}
           </button>
         </div>
      </section>

      <EnrollModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        onConfirm={handleConfirmSwitch}
        targetCourse={COURSE_NAME}
        currentCourse={enrolledCourse || ""}
        loading={enrolling}
      />
    </div>
  );
}