import { useState } from "react";
import type { Restroom } from "./Map";

interface AuditModalProps {
  restroom: Restroom;
  onClose: () => void;
  onSuccess: () => void;
}

const CHECKBOXES = [
  { key: "pwdAccessible", label: "PWD Accessible Stall" },
  { key: "hasSoap", label: "Soap" },
  { key: "hasToiletSeat", label: "Toilet Seat" },
  { key: "hasTissue", label: "Tissue" },
  { key: "hasFunctionalBidet", label: "Functional Bidet" },
] as const;

type CheckboxKey = (typeof CHECKBOXES)[number]["key"];

export function AuditModal({ restroom, onClose, onSuccess }: AuditModalProps) {
  const [checks, setChecks] = useState<Record<CheckboxKey, boolean>>({
    pwdAccessible: false,
    hasSoap: false,
    hasToiletSeat: false,
    hasTissue: false,
    hasFunctionalBidet: false,
  });
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tierStatus = checks.pwdAccessible ? "Tier 1 (Standard)" : "Tier 0 (No PWD Access)";

  const toggle = (key: CheckboxKey) =>
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restroomId: restroom.id,
          restroomName: restroom.name,
          latitude: String(restroom.latitude),
          longitude: String(restroom.longitude),
          ...checks,
          remarks: remarks.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit audit.");
      }
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-lg text-gray-900 leading-tight">Guardian Audit</h2>
              <p className="text-sm text-gray-500 mt-0.5 leading-tight line-clamp-2">{restroom.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">What did you find?</p>

          {CHECKBOXES.map(({ key, label }) => (
            <label
              key={key}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                checks[key]
                  ? "border-amber-400 bg-amber-50"
                  : "border-gray-100 bg-gray-50 hover:border-gray-200"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                  checks[key] ? "bg-amber-500 border-amber-500" : "border-gray-300"
                }`}
                onClick={() => toggle(key)}
              >
                {checks[key] && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </div>
              <span
                className={`text-sm font-medium ${checks[key] ? "text-amber-900" : "text-gray-700"}`}
                onClick={() => toggle(key)}
              >
                {label}
                {key === "pwdAccessible" && (
                  <span className="ml-1.5 text-xs font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">Primary</span>
                )}
              </span>
            </label>
          ))}

          <div className="pt-1">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Remarks (optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 bg-gray-50"
            />
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Classification:</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${checks.pwdAccessible ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
              {tierStatus}
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-bold transition-colors shadow-sm"
          >
            {loading ? "Submitting…" : "Submit Audit"}
          </button>
        </div>
      </div>
    </div>
  );
}
