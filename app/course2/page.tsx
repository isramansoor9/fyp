"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Calendar, Globe, TrendingUp, BarChart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import EnrollModal from "@/components/EnrollModal";
import { isUrdu } from "@/lib/uiLanguage";
import { urduFont } from "@/lib/urduFont";
import { LandingNavbar } from "@/app/components/LandingNavbar";
import { backendUrl } from "@/lib/backendUrl";

const COURSE_NAME = "Course 2";
const COURSE_LEARN_PATH = "/course2/learn";

const FOUNDATION_BROWN = "#968e8a";

const courseContentPanelClass =
  "rounded-2xl border border-gray-200/70 bg-[#f4f3f2] overflow-hidden shadow-none";

export default function Course2() {
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
      const res = await fetch(backendUrl("/api/enroll"), {
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
      router.push("/login?returnTo=/course2");
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
    { no: 1, component: "Introduction to Auto electrician basics", theory: 51, practical: 90, total: 141 },
    { no: 2, component: "Starting System of Vehicle ", theory: 13, practical: 80, total: 93 },
    { no: 3, component: "Charging system of Vehicle", theory: 16, practical: 63, total: 79 },
    { no: 4, component: "Ignition system of Vehicle", theory: 20, practical: 90, total: 110 },
    { no: 5, component: "Wiring Circuits and Accessories", theory: 18, practical: 91, total: 109 },
    { no: 6, component: "Vehicle air conditioning and heating system", theory: 12, practical: 80, total: 92 },
    { no: 7, component: "Hybrid & Electric Vehicles", theory: 6, practical: 50, total: 56 },
  ];

  const theorySum = courseModules.reduce((s, m) => s + m.theory, 0);
  const practicalSum = courseModules.reduce((s, m) => s + m.practical, 0);
  const totalSum = courseModules.reduce((s, m) => s + m.total, 0);

  const skillProficiencyItems = [
    {
      en: "Use Auto Electrician workshop tools and equipment efficiently.",
      ur: "آٹو الیکٹریشن ورکشاپ کے اوزار اور سامان مؤثر طریقے سے استعمال کر سکے۔",
    },
    {
      en: "Perform simple auto electrician shop techniques as wiring up in series and parallel circuits, making tester, jumper wires, soldering, tapping, connecting thimble etc.",
      ur: "سیریز اور پارلل سرکٹس میں وائرنگ، ٹیسٹر، جمپر وائر، سولڈنگ، ٹپنگ اور تھمبل کنیکشن وغیرہ جیسے سادہ ورکشاپ تکنیکیں انجام دے سکے۔",
    },
    {
      en: "Perform maintenance, charging and testing of batteries.",
      ur: "بیٹریوں کی دیکھ بھال، چارجنگ اور ٹیسٹنگ کر سکے۔",
    },
    {
      en: "Diagnose and service self-starters.",
      ur: "سیلف اسٹارٹرز کی تشخیص اور سروس کر سکے۔",
    },
    {
      en: "Diagnose and service the charging system.",
      ur: "چارجنگ سسٹم کی تشخیص اور سروس کر سکے۔",
    },
    {
      en: "Interpret wiring diagrams of vehicles.",
      ur: "گاڑیوں کی وائرنگ ڈائگرام سمجھ کر پڑھ سکے۔",
    },
    {
      en: "Wire up the electrical circuits.",
      ur: "برقی سرکٹس وائر اپ کر سکے۔",
    },
    {
      en: "Apply the diagnostic flowchart diagram properly.",
      ur: "تشخیصی فلو چارٹ ڈائگرام درست انداز سے استعمال کر سکے۔",
    },
  ];

  const knowledgeProficiencyItems = [
    { en: "Basics of auto electrician.", ur: "آٹو الیکٹریشن کی بنیادیں۔" },
    { en: "Usage of workshop tools.", ur: "ورکشاپ کے اوزار کا استعمال۔" },
    { en: "Various electrical components, their location, operation, and function.", ur: "مختلف برقی اجزاء، ان کا مقام، طریقۂ کار اور فعل۔" },
    { en: "Function and operation of battery.", ur: "بیٹری کا فعل اور طریقۂ کار۔" },
    { en: "Construction and operation of self-starter.", ur: "سیلف اسٹارٹر کی تعمیر اور طریقۂ کار۔" },
    { en: "Construction and operation of charging system.", ur: "چارجنگ سسٹم کی تعمیر اور طریقۂ کار۔" },
    { en: "Construction and operation of ignition system.", ur: "اگنیشن سسٹم کی تعمیر اور طریقۂ کار۔" },
    { en: "Different circuits applied in a car wiring.", ur: "کار وائرنگ میں استعمال ہونے والے مختلف سرکٹس۔" },
    { en: "The operation of EFI electronics.", ur: "ای ایف آئی الیکٹرانکس کا طریقۂ کار۔" },
    { en: "Air-conditioning system of vehicle.", ur: "گاڑی کا ائیر کنڈیشنگ سسٹم۔" },
    { en: "Gasoline vehicle diagnosing through digital scanner.", ur: "ڈیجیٹل اسکینر کے ذریعے گیسولین گاڑی کی تشخیص۔" },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] text-gray-600 ${urdu ? `${urduFont.className} urdu-text` : ""}`}>
      <LandingNavbar />

      <section className="px-4 pt-8 pb-3 sm:px-6 sm:pt-10 sm:pb-3 max-w-7xl mx-auto text-gray-600">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 p-5 sm:p-8 lg:p-12">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                Automotive Electrical <br />
                <span className="text-[#968e8a]">Systems</span>
                <span className="block text-gray-500 text-xl font-medium mt-2">
                  {urdu ? "کورس 2 (6 ماہ کا دورانیہ)" : "Course 2 (6 Month Duration)"}
                </span>
              </h1>

              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {urdu
                  ? "جدید گاڑیوں میں میکینیکل سے الیکٹرانکس اور کاربوریٹر سے فیول انجیکشن تک تبدیلی تیز ہو چکی ہے۔ یہ چھ ماہ کا پروگرام اُن تبدیلیوں کے ساتھ قدم ملا کر آپ کو خودکار برقی نظاموں میں عملی صلاحیت دیتا ہے۔"
                  : "Modern vehicles evolve from mechanical to electronic systems from carburation to EFI and beyond. Across six months, this program aligns with industry demand for technicians who understand wiring, starting, charging, and diagnostics alongside hybrid-relevant fundamentals."}
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

            <div className="bg-[#f4f3f2] rounded-xl p-8 border border-[#c3bebb]/30">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">{urdu ? "کریکولم کی جھلک" : "Curriculum Salients"}</h3>

              <div className="space-y-4">
                {[
                  { icon: <TrendingUp className="w-5 h-5" />, label: urdu ? "داخلہ لیول" : "Entry Level", val: urdu ? "مڈل" : "Middle" },
                  { icon: <Calendar className="w-5 h-5" />, label: urdu ? "کل دورانیہ" : "Total Duration", val: urdu ? "6 ماہ" : "6 Months" },
                  { icon: <Globe className="w-5 h-5" />, label: urdu ? "زبانِ تدریس" : "Instruction Medium", val: "Urdu / English" },
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
                      <strong className="text-gray-900 text-base">800 Hrs</strong>
                    </div>
                    <div className="bg-[#c3bebb]/10 p-2 rounded text-center flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-gray-500">{urdu ? "ہفتہ وار" : "Weekly"}</span>
                      <strong className="text-gray-900 text-base">30 Hrs</strong>
                    </div>
                  </div>
                  <div className="mt-3 ml-8 flex justify-between px-1 text-xs text-gray-500">
                    <span>{urdu ? "ہفتے میں 6 دن" : "6 Days a Week"}</span>
                    <span>{urdu ? "روزانہ 5 گھنٹے" : "5 Hours per Day"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border-l-4 border-[#c3bebb]">
                  <div className="flex items-center gap-3">
                    <BarChart className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">{urdu ? "طریقہ کار" : "Methodology"}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{urdu ? "عملی 80%" : "Practical 80%"}</span>
                    <span className="text-xs text-gray-500 block">{urdu ? "نظری 20%" : "Theory 20%"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-3 max-w-7xl mx-auto">
        <div className={courseContentPanelClass}>
          <div className="p-7 md:p-9">
            <h3 className="text-2xl font-bold text-gray-900 mb-5">{urdu ? "یہ کورس کیوں؟" : "What this course sets out to do"}</h3>
            <div className="space-y-4 text-lg leading-relaxed text-gray-600">
              {urdu ? (
                <>
                  <p>
                    موٹر ٹیکنالوجی میخانیکی سے الیکٹرانکس اور اینالوگ سے ڈیجیٹل کی طرف تیزی سے بدل رہی ہے؛ کاربوریٹر سے برقی فیول انجیکٹر تک۔
                    مسابقتی دباؤ اور زیادہ مؤثر گاڑیوں کی پیداوار برقی نظام مانگتی ہے جو نہ صرف مؤثر ہوں بلکہ زہریلے اخراج پر سخت کنٹرول کے مطابق بھی ہوں۔
                  </p>
                  <p>
                    تربیت یافتہ آٹو الیکٹریشنز کی مانگ دن بدن بڑھ رہی ہے؛ سڑکوں پر گاڑیاں اور ہائبرڈ، جدید اگنیشن اور ڈرائیو اسسٹ پروگراموں جیسے ہائی ٹیک تبدیلیاں شامل ہیں۔
                  </p>
                  <p>
                    مستقبل میں ایسے افراد درکار ہوں گے جو خرابیوں کی تشخیص کریں اور انہیں ٹھیک کریں۔ یہ نصاب سائنسی اصطلاحات، اصولوں، عمل، تعمیر اور نظاموں کے حصوں کی کارکردگی، مختلف اقسام اور ٹربل شوٹنگ کو اخلاقی اقدار کے ساتھ سمجھاتا ہے
                    تاکہ فارغ التحصیل جاب مارکیٹ کی مانگ پوری کر سکیں۔
                  </p>
                </>
              ) : (
                <>
                  <p>
                    {`Today's automotive technology is rapidly changing from mechanical to electronics, from analogue to digital, and from carbureted to electronic fuel injection. Competitive pressures demand more efficient vehicle electronic systems that also meet strict emission controls.`}
                  </p>
                  <p>
                    Demand for trained auto electricians rises as more vehicles populate the roads and hybrid vehicles, advanced electronic ignition, and numerous drive-assist programmes raise the technical bar.
                  </p>
                  <p>
                    In future, qualified technicians capable of diagnosing problems and fixing them effectively will remain essential. This curriculum addresses scientific terminology, principles, function, construction, and operation versions, types,
                    troubleshooting, and ethics equipping trainees to satisfy job-market demand.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-3 max-w-7xl mx-auto">
        <div className={courseContentPanelClass}>
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{urdu ? "فہرستِ مضامین" : "Table of Contents"}</h2>
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
                    <td className="px-4 py-3 text-[#2d2a28]" colSpan={2}>
                      Total
                    </td>
                    <td className="px-4 py-3 text-center text-[#2d2a28]">{theorySum}</td>
                    <td className="px-4 py-3 text-center text-[#2d2a28]">{practicalSum}</td>
                    <td className="px-4 py-3 text-center text-[#2d2a28]">{totalSum}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-3 max-w-7xl mx-auto">
        <div className={courseContentPanelClass}>
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">{urdu ? "مہارتی اہلیت کی تفصیلات" : "Skill proficiency details"}</h2>
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

      <section className="px-6 py-3 max-w-7xl mx-auto">
        <div className={courseContentPanelClass}>
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">{urdu ? "علمی اہلیت کی تفصیلات" : "Knowledge proficiency details"}</h2>
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

      <section className="px-6 py-16 max-w-7xl mx-auto ">
        <div className="bg-[#c3bebb] text-black rounded-3xl p-12 text-center shadow-2xl shadow-[#c3bebb]/40 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <h2 className="text-4xl font-bold mb-4">{urdu ? "اپنا ٹیکنیکل کیریئر شروع کریں" : "Start Your Technical Career"}</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto font-medium opacity-80">
            {urdu
              ? "جدید آٹوموٹیو دنیا کے لیے بنے کورس میں شامل ہوں۔ عملی اور نظری تعلیم آپ کی کامیابی پر مرکوز ہے۔"
              : "Join the course designed for the modern automotive world. Practical and theory training focused on your success."}
          </p>
          <button
            onClick={handleStartCourse}
            disabled={enrolling}
            className="bg-white text-black px-12 py-5 rounded-2xl font-bold border border-gray-200 shadow-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {urdu ? "آج ہی داخلہ لیں" : "Enroll in Course 2 Today"}
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
