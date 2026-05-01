"use client";

import { useRef, useEffect, useState } from "react";

const BAR_DATA = {
  transcripts: [262, 1120, 2250],
  qa: [2288, 11679, 20000],
};

const COURSES = ["Course 1", "Course 2", "Course 3"];
const BAR_COLORS = ["#6f6461", "#a89a96", "#c3bebb"];
const BAR_BORDERS = ["#4a3f3c", "#7a6e6b", "#9c918e"];

function makeTrend(data: number[]) {
  const n = data.length;
  const xMean = (n - 1) / 2;
  const yMean = data.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  data.forEach((y, x) => {
    num += (x - xMean) * (y - yMean);
    den += (x - xMean) ** 2;
  });
  const slope = den ? num / den : 0;
  const intercept = yMean - slope * xMean;
  return data.map((_, x) => Math.round(intercept + slope * x));
}

type ChartProps = {
  id: string;
  data: number[];
  yLabel: string;
  yMax: number;
  animate: boolean;
  urdu: boolean;
};

function SingleChart({ id, data, yLabel, yMax, animate, urdu }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    import("chart.js").then((ChartModule) => {
      const {
        Chart,
        BarController,
        LineController,
        CategoryScale,
        LinearScale,
        BarElement,
        PointElement,
        LineElement,
        Tooltip,
        Legend,
      } = ChartModule;

      Chart.register(
        BarController,
        LineController,
        CategoryScale,
        LinearScale,
        BarElement,
        PointElement,
        LineElement,
        Tooltip,
        Legend
      );

      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      if (!canvasRef.current) return;

      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const GRID = isDark ? "rgba(195,190,187,0.12)" : "rgba(111,100,97,0.09)";
      const TICK = isDark ? "#b8aca8" : "#7a6e6b";
      const LABEL = isDark ? "#e8ddd9" : "#4a3f3c";
      const TREND_COLOR = isDark ? "#d4c8c4" : "#9c918e";
      const trend = makeTrend(data);

      const barDatasets = COURSES.map((c, i) => ({
        type: "bar" as const,
        label: c,
        data: data.map((v, j) => (j === i ? v : null)),
        backgroundColor: BAR_COLORS[i] + "dd",
        borderColor: BAR_BORDERS[i],
        borderWidth: { top: 2, left: 0, right: 0, bottom: 0 },
        borderRadius: { topLeft: 5, topRight: 5 },
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.75,
      }));

      const trendDataset = {
        type: "line" as const,
        label: urdu ? "رجحان" : "Trend",
        data: trend,
        borderColor: TREND_COLOR,
        borderWidth: 1.8,
        borderDash: [5, 4],
        pointBackgroundColor: "#ffffff",
        pointBorderColor: TREND_COLOR,
        pointBorderWidth: 1.8,
        pointRadius: 4,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: false,
        order: -1,
      };

      chartRef.current = new Chart(canvasRef.current, {
        data: {
          labels: urdu ? ["کورس 1", "کورس 2", "کورس 3"] : COURSES,
          datasets: [...barDatasets, trendDataset],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: animate
            ? {
                duration: 2200,
                easing: "easeInOutQuart",
                delay: (ctx: any) =>
                  ctx.type === "data" && ctx.mode === "default"
                    ? ctx.dataIndex * 400
                    : 0,
              }
            : false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? "#3a2e2b" : "#ffffff",
              borderColor: isDark ? "#6f6461" : "#c3bebb",
              borderWidth: 1,
              titleColor: LABEL,
              bodyColor: TICK,
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: (ctx: any) =>
                  ctx.dataset.type === "line"
                    ? `  ${urdu ? "رجحان" : "Trend"}: ${Math.round(ctx.parsed.y).toLocaleString()}`
                    : `  ${ctx.dataset.label}: ${Math.round(ctx.parsed.y).toLocaleString()}`,
              },
            },
          },
          scales: {
            x: {
              grid: { color: GRID, lineWidth: 1 },
              ticks: {
                color: LABEL,
                font: { size: 11, weight: "bold" },
                padding: 8,
              },
              border: { color: GRID },
            },
            y: {
              max: yMax,
              grid: { color: GRID, lineWidth: 1 },
              ticks: {
                color: TICK,
                font: { size: 10 },
                maxTicksLimit: 6,
                callback: (v: any) =>
                  v >= 1000 ? Math.round(v / 1000) + "k" : v,
              },
              title: {
                display: true,
                text: yLabel,
                color: TICK,
                font: { size: 10 },
                padding: { bottom: 6 },
              },
              border: { color: "transparent" },
              beginAtZero: true,
            },
          },
        },
      });
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [animate, urdu]);

  return <canvas ref={canvasRef} id={id} role="img" aria-label={`Bar chart: ${yLabel}`} />;
}

export function DataCollectionChart({ urdu }: { urdu: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [animKey, setAnimKey] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          setAnimKey((k) => k + 1);
        } else {
          setInView(false);
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label={urdu ? "ڈیٹا مجموعہ گراف" : "Data collection chart"}
      className="w-full px-8 pb-20 max-w-7xl mx-auto"
    >
      <h2 className="text-3xl font-bold mb-6 text-[#000000]">
        {urdu ? "ڈیٹا مجموعہ" : "Data collection"}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl p-4" style={{ background: "#c3bebb" }}>
          <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "#000000" }}>
            {urdu ? "اسکریپ شدہ ویب سائٹس" : "Websites scraped"}
          </p>
          <p className="font-medium mb-1" style={{ fontSize: "28px", color: "#000000" }}>982</p>
          <p className="text-[11px]" style={{ color: "#000000" }}>
            {urdu ? "کل ڈیٹا ذرائع" : "Total data sources"}
          </p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--color-background-secondary, #f5f3f2)" }}>
          <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--color-text-secondary, #7a6e6b)" }}>
            {urdu ? "کل منتقلاً" : "Total transcripts"}
          </p>
          <p className="font-medium mb-1" style={{ fontSize: "22px", color: "var(--color-text-primary, #1a1a1a)" }}>3,632</p>
          <p className="text-[11px]" style={{ color: "var(--color-text-secondary, #7a6e6b)" }}>
            {urdu ? "3 کورسز میں" : "Across 3 courses"}
          </p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--color-background-secondary, #f5f3f2)" }}>
          <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--color-text-secondary, #7a6e6b)" }}>
            {urdu ? "کل سوال جواب" : "Total QA pairs"}
          </p>
          <p className="font-medium mb-1" style={{ fontSize: "22px", color: "var(--color-text-primary, #1a1a1a)" }}>33,967</p>
          <p className="text-[11px]" style={{ color: "var(--color-text-secondary, #7a6e6b)" }}>
            {urdu ? "3 کورسز میں" : "Across 3 courses"}
          </p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--color-background-secondary, #f5f3f2)" }}>
          <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--color-text-secondary, #7a6e6b)" }}>
            {urdu ? "اوسط توسیع" : "Avg expansion"}
          </p>
          <p className="font-medium mb-1" style={{ fontSize: "22px", color: "var(--color-text-primary, #1a1a1a)" }}>9.4×</p>
          <p className="text-[11px]" style={{ color: "var(--color-text-secondary, #7a6e6b)" }}>
            {urdu ? "سوال جواب بہ منتقلاً" : "QA per transcript"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl p-5" style={{ background: "var(--color-background-primary, #fff)", border: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.1))" }}>
          <p className="text-2xl font-bold mb-4" style={{ color: "#4a3f3c" }}>
            {urdu ? "کورس کے مطابق منتقلاں" : "Transcripts per course"}
          </p>
          <div className="relative" style={{ height: "420px" }}>
            <SingleChart key={`transcripts-${animKey}`} id="chart-transcripts" data={BAR_DATA.transcripts} yLabel={urdu ? "تعداد" : "Count"} yMax={2800} animate={inView} urdu={urdu} />
          </div>
        </div>

        <div className="rounded-xl p-5" style={{ background: "var(--color-background-primary, #fff)", border: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.1))" }}>
          <p className="text-2xl font-bold mb-4" style={{ color: "#4a3f3c" }}>
            {urdu ? "کورس کے مطابق سوال جواب" : "QA pairs per course"}
          </p>
          <div className="relative" style={{ height: "420px" }}>
            <SingleChart key={`qa-${animKey}`} id="chart-qa" data={BAR_DATA.qa} yLabel={urdu ? "تعداد" : "Count"} yMax={23000} animate={inView} urdu={urdu} />
          </div>
        </div>
      </div>
    </section>
  );
}
