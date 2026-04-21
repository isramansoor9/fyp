"use client";

type EnrollModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetCourse: string;
  currentCourse: string;
  loading?: boolean;
};

export default function EnrollModal({
  isOpen,
  onClose,
  onConfirm,
  targetCourse,
  currentCourse,
  loading = false,
}: EnrollModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4">
        <h3 className="text-xl font-bold mb-3">Switch Course?</h3>
        <p className="text-gray-600 mb-6">
          You are currently enrolled in <strong>{currentCourse}</strong>. Enrolling in <strong>{targetCourse}</strong> will reset your progress. Your progress will be lost. Are you sure you want to continue?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Enrolling..." : "Yes, switch course"}
          </button>
        </div>
      </div>
    </div>
  );
}
