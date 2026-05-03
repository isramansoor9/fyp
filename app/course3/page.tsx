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

const COURSE_NAME = "Course 3";
const COURSE_LEARN_PATH = "/course3/learn";

const FOUNDATION_BROWN = "#968e8a";

const courseContentPanelClass =
  "rounded-2xl border border-gray-200/70 bg-[#f4f3f2] overflow-hidden shadow-none";

export default function Course3() {
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
      router.push("/login?returnTo=/course3");
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
    { no: 1, component: "Workshop Practice", theory: 17, practical: 170, total: 187 },
    { no: 2, component: "Internal Combustion Engine", theory: 7, practical: 28, total: 35 },
    { no: 3, component: "Basic Electricity/Electronics", theory: 21, practical: 120, total: 141 },
    { no: 4, component: "Storage Battery", theory: 7, practical: 25, total: 32 },
    { no: 5, component: "Self-Starter", theory: 14, practical: 100, total: 114 },
    { no: 6, component: "Ignition System", theory: 14, practical: 130, total: 144 },
    { no: 7, component: "Technical Drawing-I", theory: 20, practical: 40, total: 60 },
    { no: 8, component: "Technical Mathematics-I", theory: 20, practical: 0, total: 20 },
    { no: 9, component: "Industrial tour", theory: 0, practical: 7, total: 7 },
    { no: 10, component: "Functional English", theory: 20, practical: 20, total: 40 },
    { no: 11, component: "Work Ethics", theory: 20, practical: 0, total: 20 },
    { no: 12, component: "Charging Circuit/ Voltage Regulator", theory: 10, practical: 60, total: 70 },
    { no: 13, component: "Wiring Circuits & Accessories", theory: 34, practical: 210, total: 244 },
    { no: 14, component: "Electronically Controlled vehicle systems and sensors", theory: 21, practical: 183, total: 204 },
    { no: 15, component: "Heating, Ventilating and Air Conditioning system", theory: 15, practical: 120, total: 135 },
    { no: 16, component: "Technical Drawing-II", theory: 20, practical: 40, total: 60 },
    { no: 17, component: "Technical Mathematics-II", theory: 20, practical: 0, total: 20 },
    { no: 18, component: "Industrial tour (2nd Semester)", theory: 0, practical: 7, total: 7 },
    { no: 19, component: "Functional English (2nd Semester)", theory: 20, practical: 20, total: 40 },
    { no: 20, component: "Work Ethics (2nd Semester)", theory: 20, practical: 0, total: 20 },
  ];

  const semester1 = courseModules.slice(0, 11);
  const semester2 = courseModules.slice(11);
  const sumTotals = (rows: typeof courseModules) => ({
    theory: rows.reduce((s, m) => s + m.theory, 0),
    practical: rows.reduce((s, m) => s + m.practical, 0),
    total: rows.reduce((s, m) => s + m.total, 0),
  });
  const s1 = sumTotals(semester1);
  const s2 = sumTotals(semester2);

  const skillProficiencyItems = [
    {
      en: "Use the hand tools, measuring tools, electrical tools, accordingly and safely.",
      ur: "ہاتھ کے اوزار، پیمائش اور برقی اوزار ضرورت کے مطابق اور محفوظ طریقے سے استعمال کر سکے۔",
    },
    {
      en: "Check and maintain the battery.",
      ur: "بیٹری کی جانچ اور دیکھ بھال کر سکے۔",
    },
    {
      en: "Inspect, dismantle, assemble and performance check self-starters.",
      ur: "سیلف اسٹارٹرز کی جانچ، کھولنے، جمع اور کارکردگی کی جانچ کر سکے۔",
    },
    {
      en: "Inspect, dismantle, assemble and output check alternators.",
      ur: "آلٹرنیٹر کی جانچ، کھولنے، جمع کرنا اور آؤٹ پٹ جانچ کر سکے۔",
    },
    {
      en: "Make the wiring of various systems of the vehicle.",
      ur: "گاڑی کے مختلف نظاموں کی وائرنگ بنا سکے۔",
    },
    {
      en: "Check and troubleshoot the components of EFI.",
      ur: "ای ایف آئی کے اجزاء کی جانچ اور ٹربل شوٹنگ کر سکے۔",
    },
    {
      en: "Inspect and troubleshoot the HVAC system of the vehicle.",
      ur: "گاڑی کے ہیٹنگ، وینٹیلشن اور ائیر کنڈیشنگ سسٹم کی جانچ اور ٹربل شوٹنگ کر سکے۔",
    },
  ];

  const knowledgeProficiencyItems = [
    {
      en: "Explain electricity and electronics and various terms relevant to this trade.",
      ur: "بجلی اور الیکٹرانکس اور اس پیشے سے متعلق اصطلاحات کی وضاحت کر سکے۔",
    },
    {
      en: "Explain the purpose, function, construction and operation of battery.",
      ur: "بیٹری کی غرض، کار، تعمیر اور طریقۂ عمل کی وضاحت کر سکے۔",
    },
    {
      en: "Describe the purpose, function, construction and operation of self-starter.",
      ur: "سیلف اسٹارٹر کی غرض، کار، تعمیر اور طریقۂ عمل بیان کر سکے۔",
    },
    {
      en: "Describe the purpose, function, construction and operation of alternators.",
      ur: "آلٹرنیٹر کی غرض، کار، تعمیر اور طریقۂ عمل بیان کر سکے۔",
    },
    {
      en: "Define the purpose, function, constraint, operation and types of voltage regulation.",
      ur: "وولٹیج ریگولیشن کی غرض، کار، پابندی، طریقۂ کار اور اقسام بیان کر سکے۔",
    },
    {
      en: "Define the purpose, function, construction, operation and types of ignition system.",
      ur: "اگنیشن سسٹم کی غرض، کار، تعمیر، طریقۂ عمل اور اقسام بیان کر سکے۔",
    },
    {
      en: "Explain the purpose, function, construction and operation of various electrical components used in a car such as horn, lights, windshield wipers, meters and gauges etc.",
      ur: "کار میں استعمال ہونے والے مختلف برقی اجزاء — ہارن، لائٹس، وائپر، میٹر اور گیجز وغیرہ کی غرض، کار، تعمیر اور عمل کی وضاحت کر سکے۔",
    },
    {
      en: "Explain the operation of EFI and electric fuel injection circuit.",
      ur: "ای ایف آئی اور برقی فیول انجیکشن سرکٹ کے طریقۂ عمل کی وضاحت کر سکے۔",
    },
    {
      en: "Explain the operation of electronic ignition.",
      ur: "برقی اگنیشن کے طریقۂ عمل کی وضاحت کر سکے۔",
    },
    {
      en: "Describe the operation of air conditioners in vehicle.",
      ur: "گاڑیوں میں ائیر کنڈیشنر کے طریقۂ عمل کی تفصیل بیان کر سکے۔",
    },
  ];

  const renderSemesterRows = (rows: typeof courseModules, keyOffset = 0) =>
    rows.map((module, index) => (
      <tr key={module.no} className={`border-b border-gray-300/40 last:border-b-0 ${(index + keyOffset) % 2 === 0 ? "bg-[#f5f4f3]" : "bg-[#e8e4e2]"}`}>
        <td className="px-4 py-3 text-[#5c5755]">{module.no}</td>
        <td className="px-4 py-3 font-medium text-gray-900">{module.component}</td>
        <td className="px-4 py-3 text-center text-[#5c5755]">{module.theory}</td>
        <td className="px-4 py-3 text-center text-[#5c5755]">{module.practical}</td>
        <td className="px-4 py-3 text-center font-semibold text-gray-900">{module.total}</td>
      </tr>
    ));

  return (
    <div className={`min-h-screen bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] text-gray-600 ${urdu ? `${urduFont.className} urdu-text` : ""}`}>
      <LandingNavbar />

      <section className="px-4 pt-8 pb-3 sm:px-6 sm:pt-10 sm:pb-3 max-w-7xl mx-auto text-gray-600">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 p-5 sm:p-8 lg:p-12">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                Auto Electrician <br />
                <span className="text-[#968e8a]">G-III Level</span>
                <span className="block text-gray-500 text-xl font-medium mt-2">{urdu ? "کورس 3 (1 سال، 2 سمسٹر)" : "Course 3 (1 Year · 2 Semesters)"}</span>
              </h1>

              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {urdu
                  ? "گاڑیوں کی مقبولیت بڑھنے سے ہنر مند ٹیکننش کی مانگ زیادہ ہو گئی ہے؛ تخصص اور ہر سال نئے ماڈلز کے ساتھ الیکٹرانک نظام شامل ہیں۔ یہ پروگرام نظریہ اور عمل کا باہمی رابطہ فراہم کرتا ہے۔"
                  : "The popularity of automobiles has increased demand for skilled technicians and specialization, as models change yearly and electronics grow more complex. This programme links solid theory with disciplined hands-on practice at G-III level."}
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
                  { icon: <TrendingUp className="w-5 h-5" />, label: urdu ? "داخلہ لیول" : "Entry Level", val: urdu ? "میٹرک" : "Matric" },
                  { icon: <Calendar className="w-5 h-5" />, label: urdu ? "کل دورانیہ" : "Total Duration", val: urdu ? "1 سال (2 سمسٹر)" : "1 Year (2 Semesters)" },
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
                      <strong className="text-gray-900 text-base">1600 Hrs</strong>
                    </div>
                    <div className="bg-[#c3bebb]/10 p-2 rounded text-center flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-gray-500">{urdu ? "ہفتہ وار" : "Weekly"}</span>
                      <strong className="text-gray-900 text-base">40 Hrs</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border-l-4 border-[#c3bebb]">
                  <div className="flex items-center gap-3">
                    <BarChart className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">{urdu ? "طریقہ کار" : "Methodology"}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{urdu ? "عملی 75%" : "Practical 75%"}</span>
                    <span className="text-xs text-gray-500 block">{urdu ? "نظری 25%" : "Theory 25%"}</span>
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
                    گاڑیوں کی مقبولیت کے باعث ہنر مند ٹیکننش کی شدید ضرورت ہے؛ یہ تخصص کا دور ہے۔ ماڈلز کی تیز تبدیلی اور ال ایف آئی، برقی اگنیشن، اے بی ایس اور ائیر کنڈیشنگ جیسے نئے موضوعات نصاب میں شامل ہیں
                    تاکہ تربیت حاصل کرنے والے میدان میں مشکلات سے دوچار نہ ہوں۔
                  </p>
                  <p>
                    یہ نصاب سائنسی اصطلاحات، اصول، فعل، تعمیر اور نظام یا حصوں کے طریقۂ عمل، اقسام اور ٹربل شوٹنگ کو اخلاقی اقدار کے ساتھ شامل کرتا ہے تاکہ فارغ التحصیل جاب مارکیٹ کی ضرورت پوری کر سکیں۔
                  </p>
                </>
              ) : (
                <>
                  <p>
                    {`Due to the popularity of automobiles, the need for skilled technicians has increased, and this is an age of specialization. Rapid annual model changes and wider use of electronics call for auto electricians who grasp theory and apply it in practice.`}
                  </p>
                  <p>
                    {`During this course revision, topics on newer systems such as EFI, electronic ignition, ABS, and air conditioning have been introduced so trainees are prepared in the field. The curriculum covers scientific terms, principles, function, construction and operation of systems and parts, versions and types, troubleshooting, and ethical values, enabling graduates to meet job-market requirements.`}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-3 max-w-7xl mx-auto">
        <div className={courseContentPanelClass}>
          <div className="p-8 space-y-10">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">{urdu ? "فہرستِ مضامین" : "Table of Contents"}</h2>

              <h3 className="text-lg font-bold mb-4 text-gray-800">{urdu ? "سمسٹر 1" : "Semester 1"}</h3>
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
                    {renderSemesterRows(semester1, 0)}
                    <tr className="border-t border-gray-400/45 bg-[#d4cfcc] font-bold">
                      <td className="px-4 py-3 text-[#2d2a28]" colSpan={2}>{urdu ? "سمسٹر 1 کل" : "Semester 1 Total"}</td>
                      <td className="px-4 py-3 text-center text-[#2d2a28]">{s1.theory}</td>
                      <td className="px-4 py-3 text-center text-[#2d2a28]">{s1.practical}</td>
                      <td className="px-4 py-3 text-center text-[#2d2a28]">{s1.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-800">{urdu ? "سمسٹر 2" : "Semester 2"}</h3>
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
                    {renderSemesterRows(semester2, 1)}
                    <tr className="border-t border-gray-400/45 bg-[#d4cfcc] font-bold">
                      <td className="px-4 py-3 text-[#2d2a28]" colSpan={2}>{urdu ? "سمسٹر 2 کل" : "Semester 2 Total"}</td>
                      <td className="px-4 py-3 text-center text-[#2d2a28]">{s2.theory}</td>
                      <td className="px-4 py-3 text-center text-[#2d2a28]">{s2.practical}</td>
                      <td className="px-4 py-3 text-center text-[#2d2a28]">{s2.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
            {urdu ? "آج ہی داخلہ لیں" : "Enroll in Course 3 Today"}
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