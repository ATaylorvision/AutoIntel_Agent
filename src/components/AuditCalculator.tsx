import React, { useState } from 'react';
import { Phone, ArrowRight, ArrowLeft, RotateCcw, CheckCircle2, DollarSign, Calculator } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';

interface AuditCalculatorProps {
  onCompleteAndSignUp: (auditId: string) => void;
  onNavigateHome: () => void;
}

export const AuditCalculator: React.FC<AuditCalculatorProps> = ({ onCompleteAndSignUp, onNavigateHome }) => {
  const { setSavedAuditId } = useAuth();
  const { settings } = useSettings();
  const supportPhone = settings.supportPhone || '888-212-1629';

  // Starting values (editable starting points, NOT industry averages)
  const [weeklyCalls, setWeeklyCalls] = useState<number>(120);
  const [missedPercent, setMissedPercent] = useState<number>(20);
  const [avgTicket, setAvgTicket] = useState<number>(400);
  const [closeRate, setCloseRate] = useState<number>(5); // 1 to 10

  const [step, setStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [auditId, setAuditId] = useState<string | null>(null);

  // Calculations
  // Monthly missed calls = weekly calls x (percent missed / 100) x 4.33
  const monthlyMissedCalls = Math.round(weeklyCalls * (missedPercent / 100) * 4.33);
  // Estimated lost jobs = monthly missed calls x (jobs out of 10 / 10)
  const lostJobs = Math.round(monthlyMissedCalls * (closeRate / 10));
  // Estimated lost revenue = estimated lost jobs x average ticket
  const lostRevenue = Math.round(lostJobs * avgTicket);

  const totalSteps = 4;

  const saveAuditResult = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weeklyCalls,
          missedPercent,
          avgTicket,
          closeRate,
          monthlyMissedCalls,
          lostJobs,
          lostRevenue,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.auditId) {
          setAuditId(data.auditId);
          setSavedAuditId(data.auditId);
        }
      }
    } catch (err) {
      console.warn('Could not save audit to server:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      await saveAuditResult();
      setStep(5); // results screen
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleReset = () => {
    setStep(1);
    setWeeklyCalls(120);
    setMissedPercent(20);
    setAvgTicket(400);
    setCloseRate(5);
    setAuditId(null);
  };

  const progressPercentage = step <= totalSteps ? (step / totalSteps) * 100 : 100;

  return (
    <div className="max-w-xl mx-auto px-4 py-8 md:py-12">
      {/* Top Breadcrumb / Reset */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onNavigateHome}
          className="text-xs font-semibold text-gray-500 hover:text-black py-2 min-h-[44px] flex items-center"
        >
          ← Back to Overview
        </button>
        {step === 5 && (
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1 py-2 min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recalculate</span>
          </button>
        )}
      </div>

      {/* Progress Bar (visible during questions) */}
      {step <= totalSteps && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
            <span>Question {step} of {totalSteps}</span>
            <span>{Math.round(progressPercentage)}% Completed</span>
          </div>
          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#d6bcfa] h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* CARD CONTAINER */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                Step 1
              </span>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                About how many calls does your shop get in a week?
              </h2>
              <p className="text-sm text-gray-600">
                Include questions, quotes, tow inquiries, and appointment requests.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-center">
                <input
                  type="number"
                  min="5"
                  max="2000"
                  value={weeklyCalls}
                  onChange={(e) => setWeeklyCalls(Math.max(1, Number(e.target.value) || 0))}
                  className="w-full text-center text-4xl font-extrabold text-gray-900 border-2 border-gray-200 rounded-xl py-4 focus:border-black focus:outline-none transition-colors"
                />
              </div>

              {/* Quick increment buttons for mobile tap */}
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 150, 250].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setWeeklyCalls(val)}
                    className={`py-2 text-xs font-semibold rounded-lg border min-h-[44px] transition-colors ${
                      weeklyCalls === val
                        ? 'bg-black text-white border-black'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {val} calls
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                Step 2
              </span>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                About what percent go unanswered or to voicemail?
              </h2>
              <p className="text-sm text-gray-600">
                Think about busy bay hours, lunchtime, customer counters, and after-hours rings.
              </p>
            </div>

            <div className="space-y-6 pt-2">
              <div className="text-center py-4 bg-[#faf5ff] border border-[#e9d8fd] rounded-xl">
                <span className="text-5xl font-black text-gray-900">{missedPercent}%</span>
                <p className="text-xs text-gray-500 font-medium mt-1">unanswered or voicemail</p>
              </div>

              <div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="5"
                  value={missedPercent}
                  onChange={(e) => setMissedPercent(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                  <span>5% (Rarely)</span>
                  <span>20% (Common)</span>
                  <span>50%+ (Heavy load)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                Step 3
              </span>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                What is your average repair ticket?
              </h2>
              <p className="text-sm text-gray-600">
                Your typical repair order value across maintenance, diagnostics, and mechanical jobs.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="relative flex items-center">
                <span className="absolute left-4 text-3xl font-bold text-gray-400">$</span>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  step="25"
                  value={avgTicket}
                  onChange={(e) => setAvgTicket(Math.max(1, Number(e.target.value) || 0))}
                  className="w-full pl-12 pr-4 text-center text-4xl font-extrabold text-gray-900 border-2 border-gray-200 rounded-xl py-4 focus:border-black focus:outline-none transition-colors"
                />
              </div>

              {/* Preset quick buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[300, 400, 600, 850].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAvgTicket(val)}
                    className={`py-2 text-xs font-semibold rounded-lg border min-h-[44px] transition-colors ${
                      avgTicket === val
                        ? 'bg-black text-white border-black'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                Step 4
              </span>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                Out of every 10 callers, how many usually become paying jobs?
              </h2>
              <p className="text-sm text-gray-600">
                When someone gets their call answered promptly, how many book an appointment or job?
              </p>
            </div>

            <div className="space-y-6 pt-2">
              <div className="text-center py-4 bg-[#faf5ff] border border-[#e9d8fd] rounded-xl">
                <span className="text-5xl font-black text-gray-900">{closeRate} of 10</span>
                <p className="text-xs text-gray-500 font-medium mt-1">become paying customer jobs</p>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCloseRate(num)}
                    className={`py-3 text-sm font-bold rounded-xl border min-h-[44px] flex items-center justify-center transition-all ${
                      closeRate === num
                        ? 'bg-black text-white border-black shadow-sm scale-105'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESULTS SCREEN (STEP 5) */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Audit Results Ready
              </span>
              <p className="text-xs text-gray-500">Your Missed-Call Opportunity Calculation</p>
            </div>

            {/* BIG NUMBER */}
            <div className="text-center py-6 px-4 bg-[#faf5ff] border border-[#d6bcfa] rounded-2xl">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Your shop could be missing about
              </p>
              <div className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tight">
                ${lostRevenue.toLocaleString()}
              </div>
              <p className="text-sm font-bold text-gray-800 mt-1">a month.</p>
            </div>

            {/* PLAIN LANGUAGE MATH BREAKDOWN */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Here is the math in plain language:</p>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-gray-900">•</span>
                  <span>
                    At <strong>{weeklyCalls} calls a week</strong> with <strong>{missedPercent}%</strong> going unanswered or to voicemail, that is roughly <strong>{monthlyMissedCalls} missed calls</strong> every month.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-gray-900">•</span>
                  <span>
                    With <strong>{closeRate} out of 10 callers</strong> booking repairs, that is approximately <strong>{lostJobs} lost repair jobs</strong> every month.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-gray-900">•</span>
                  <span>
                    At an average ticket of <strong>${avgTicket}</strong>, those lost repairs total about <strong>${lostRevenue.toLocaleString()} in revenue</strong> walking over to your local competitors.
                  </span>
                </li>
              </ul>

              <p className="text-[11px] text-gray-500 pt-2 border-t border-gray-200 italic">
                This is an estimate based on your answers.
              </p>
            </div>

            {/* COMPARISON LINE */}
            <div className="text-center py-3 px-4 bg-gray-100 rounded-xl">
              <p className="text-base font-bold text-gray-900">
                AutoIntel Agent is $199 a month.
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Saving just one typical repair job covers your receptionist for months.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => onCompleteAndSignUp(auditId || 'aud_temp')}
                className="w-full py-4 px-6 bg-[#d6bcfa] hover:bg-[#c49efa] text-gray-950 font-bold text-base rounded-xl shadow-sm min-h-[48px] flex items-center justify-center gap-2 transition-all"
              >
                <span>Get AutoIntel Agent</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href={`tel:${supportPhone.replace(/[^0-9]/g, '')}`}
                className="w-full py-3 px-4 bg-white border-2 border-black hover:bg-gray-50 text-black font-semibold text-sm rounded-xl min-h-[44px] flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call Our AI Receptionist Now ({supportPhone})</span>
              </a>
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION (DURING STEPS 1-4) */}
        {step <= totalSteps && (
          <div className="flex items-center justify-between gap-3 pt-6 border-t border-gray-100 mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-black border border-gray-200 rounded-lg min-h-[44px] flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={isSaving}
              className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-lg min-h-[44px] flex items-center gap-2 ml-auto shadow-sm transition-all"
            >
              {isSaving ? (
                <span>Calculating...</span>
              ) : step === totalSteps ? (
                <>
                  <span>See My Shop's Results</span>
                  <ArrowRight className="w-4 h-4 text-[#d6bcfa]" />
                </>
              ) : (
                <>
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
