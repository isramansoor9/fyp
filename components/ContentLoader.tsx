"use client";

import { useEffect, useMemo, useState } from "react";
import { urduFont } from "@/lib/urduFont";

/** One tip per slide; bilingual. No hyphen/em dash punctuation in copy. */
const BILINGUAL_TIPS = [
  {
    en: "Always disconnect the negative battery terminal first before working on any electrical circuit. It reduces the risk of shorts and sparks near the fuel system.",
    ur: "کسی بھی برقی سرکٹ پر کام شروع کرنے سے پہلے بیٹری کا منفی ٹرمینل ہمیشہ الگ کریں۔ اس سے شارٹ سرکٹ اور بھڑک اُٹھنے کا خطرہ کم ہو جاتا ہے۔",
  },
  {
    en: "A multimeter is the core tool for an auto electrician. Learn voltage, continuity, resistance, and current modes; most field faults become visible once you measure systematically.",
    ur: "ملٹی میٹر آپ کا بنیادی اوزار ہے۔ وولٹیج، مسلسل کنیکشن، امپیدنس اور موجودہ روانی سیکھیں؛ منظم پیمائش سے زیادہ تر خرابیاں سامنے آ جاتی ہیں۔",
  },
  {
    en: "Most intermittent electrical problems come from corroded grounds, loose crimps, or heat cycled terminals, not necessarily a failed ECU or alternator.",
    ur: "زیادہ تر بار بار ہونے والی بجلی کی خرابیاں خراب زمین کنیکشن، کھلے کرمپس یا گرمی سے ڈھیلی ٹرمینلز کی وجہ سے ہوتی ہیں۔ ہر بار ECU یا الٹرنیٹر خراب نہیں ہوتا۔",
  },
  {
    en: "Voltage drop testing finds hidden resistance across connections. A slight drop across a splice or fuse holder can ruin starter or headlamp performance under load.",
    ur: "وولٹیج ڈراپ ٹیسٹ چھپی ہوئی مزاحمت ڈھونڈتا ہے۔ جوڑ یا فیوز ہولڈر پر معمولی ڈراپ بھی لوڈ کے ساتھ سٹارٹر یا ہیڈ لیمپ کی کارکردگی خراب کر سکتا ہے۔",
  },
  {
    en: "Wiring harness colours follow standards and OEM diagrams. Never guess routing: tracing on the schematic saves repeat repairs and poorly taped joints.",
    ur: "وائرنگ کے رنگ معیارات اور کمپنی ڈایا گرام پر مبنی ہوتے ہیں۔ راستے اندازے سے نہ نکالیں۔ اسکیمیٹک پر نقشہ کھینچنا دہرائی مرمت اور ٹیپ والے غلط کام کم کرتا ہے۔",
  },
  {
    en: "Never substitute a fuse with a higher amp rating. The fuse protects the conductor; oversizing melts insulation before the fuse opens.",
    ur: "کبھی بھی زیادہ ایمپیکر والا فیوز نہ لگائیں۔ فیوز تاروں کی حفاظت کرتا ہے۔ زیادہ ایمپیکر لگانے پر فیوز کھلنے سے پہلے انسلین پگھل سکتی ہے۔",
  },
  {
    en: "Healthy charging systems commonly read about 13.5 to 14.5 V at the battery with the engine idling, but always verify against OEM specs for the vehicle.",
    ur: "بند انجن پر عام طور پر بیٹری پر ۱۳٫۵ سے ۱۴٫۵ وولٹ پڑھنا ٹھیک رینج ہو سکتا ہے، مگر ہر گاڑی کی کمپنی کی دستاویز سے ضرور تصدیق کریں۔",
  },
  {
    en: "A parasitic draw test finds milliamp drains that flatten a battery overnight. Pull fuses systematically or use an ammeter inline with the battery negative.",
    ur: "پیراسٹک ڈرا ٹیسٹ وہ معمولی رواں استعمال ڈھونڈتا ہے جو راتوں رات بیٹری خالی کر دیتا ہے۔ فیوز ترتیب سے نکالیں یا بیٹری منفی کے ساتھ ایم میٹر لگائیں۔",
  },
  {
    en: "In high vibration bays stranded wire plus proper terminals and adhesive lined heat shrink outlast taped splices exposed to oil and coolant mist.",
    ur: "شدید ہلچل والی ورکشاپ میں بندھا ہوا تار، صحیح ٹرمینلز اور چپکدار لائن والے ہیٹ شرنک لمبی مدت تک قائم رہتا ہے؛ تیل یا کولنٹ کے دھوئیں میں ٹیپ جلد خراب ہو جاتا ہے۔",
  },
  {
    en: "Modern vehicles share data on CAN buses. Understand network basics before condemning sensors: corrupted frames can look like a dead component.",
    ur: "جدید گاڑیاں CAN نیٹ ورک پر ڈیٹا شیئر کرتی ہیں۔ سینسر بدلنے سے پہلے نیٹ ورک کی بنیادیں سمجھیں؛ خراب فریمز مُردہ جزو جیسے لگ سکتے ہیں۔",
  },
  {
    en: "O₂ and MAF sensors shape fuel trims in EFI systems. Inspect vacuum leaks and wiring harness flex points before ordering expensive replacements.",
    ur: "ای ایف آئی میں آکسیجن اور ایم اے ایف سینسر فیول ایڈجسٹ کرتے ہیں۔ مہنگے حصے آرڈر کرنے سے پہلے ویکیوم لیکج اور ڈھیلے ہوئے وائرنگ نقاط ضرور چیک کریں۔",
  },
  {
    en: "Relays isolate high current loads. Click tests help, but verifying coil continuity and switched load terminals proves whether the relay is good.",
    ur: "رلے زیادہ کرنٹ والے لوڈ الگ رکھتے ہیں۔ کلیک سننے سے مدد ملتی ہے، مگر کاٹل مسلسل کنیکشن اور سوئچ والے کنوں کو ٹیسٹ کرنا ضروری ہے تا کہ رلے ٹھیک ہے یا نہیں معلوم ہو۔",
  },
];

const TIP_HOLD_SECONDS = 7.5;

export default function ContentLoader({ urdu = false }: { urdu?: boolean }) {
  const n = BILINGUAL_TIPS.length;
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * BILINGUAL_TIPS.length));

  useEffect(() => {
    const id = setInterval(
      () => setTipIndex((i) => (i + 1) % n),
      TIP_HOLD_SECONDS * 1000
    );
    return () => clearInterval(id);
  }, [n]);

  const current = BILINGUAL_TIPS[tipIndex];
  const line = urdu ? current.ur : current.en;

  const heading = urdu ? "آپ کا سبق تیار کیا جا رہا ہے" : "Preparing your lesson";
  const labelDidYouKnow = urdu ? "کیا آپ جانتے ہیں؟" : "Did you know?";

  const dots = useMemo(() => Array.from({ length: n }, (_, i) => i === tipIndex), [n, tipIndex]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-start sm:justify-center px-5 sm:px-10 py-12 sm:py-16 lg:py-20 select-none
        bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] text-gray-800
        ${urdu ? `${urduFont.className} urdu-text` : ""}`}
    >
      <div className="w-full max-w-2xl lg:max-w-3xl mx-auto flex flex-col items-center">
        <h1 className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-8 sm:mb-10 lg:mb-11 px-2 leading-snug">
          {heading}
        </h1>

        <div
          className="w-full rounded-3xl border-2 border-gray-200/90 bg-[#faf9f8] shadow-[0_12px_40px_-14px_rgba(60,52,46,0.22)]
          px-7 py-9 sm:px-10 sm:py-11 lg:px-12 lg:py-12 min-h-[12rem] sm:min-h-[14rem]"
        >
          <p className="text-xl sm:text-2xl lg:text-[1.75rem] font-semibold text-[#968e8a] mb-6 sm:mb-7 lg:mb-8 text-center normal-case tracking-normal">
            {labelDidYouKnow}
          </p>

          <div className="relative min-h-[7rem] sm:min-h-[8.5rem] lg:min-h-[9.5rem]">
            <p
              key={tipIndex}
              className="text-lg sm:text-xl lg:text-2xl leading-relaxed lg:leading-snug text-gray-700 text-center"
            >
              {line}
            </p>
          </div>

          <div className="mt-8 sm:mt-10 pt-7 sm:pt-8 border-t-2 border-gray-200/80">
            <div className="flex justify-center gap-2 flex-wrap pb-2">
              {dots.map((active, i) => (
                <span
                  key={i}
                  className={`h-2.5 sm:h-3 rounded-full ${active ? "w-11 sm:w-12 bg-[#968e8a]" : "w-2.5 sm:w-3 bg-gray-300"}`}
                  aria-hidden
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
