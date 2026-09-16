import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, Sparkles, ShieldAlert, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { ReceptionistSetup, DayHours } from '../types/index.ts';

interface SetupScoreViewProps {
  setup: ReceptionistSetup;
  onGoToStep: (stepNumber: number) => void;
  onSetupCompleted: () => void;
}

export const SetupScoreView: React.FC<SetupScoreViewProps> = ({
  setup,
  onGoToStep,
  onSetupCompleted,
}) => {
  const { shopRecord, refreshShop } = useAuth();
  const shopId = shopRecord?.id;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Evaluate 6 Required Items (70% total => ~11.666% each)
  const reqAddress = Boolean(setup.address && setup.city && setup.state && setup.zip);
  const reqPhone = Boolean(setup.mainPhone && setup.mainPhone.length >= 7);
  const reqHours = Boolean(
    setup.hours &&
      (Object.values(setup.hours) as DayHours[]).some(
        (h) => h.open && h.openTime && h.closeTime
      )
  );
  const reqServices = Boolean(setup.services && setup.services.length > 0);
  const reqEmergency = Boolean(
    setup.emergencyHandling &&
      (setup.emergencyHandling === 'message' ||
        (setup.emergencyHandling === 'transfer' && setup.emergencyPhone))
  );
  const reqAlertMobile = Boolean(setup.alertMobile && setup.alertMobile.length >= 7);

  const requiredItems = [
    { id: 'address', label: 'Shop address (street, city, state, and ZIP)', step: 1, done: reqAddress },
    { id: 'phone', label: 'Main shop phone number', step: 1, done: reqPhone },
    { id: 'hours', label: 'Operating hours (at least one open day configured)', step: 2, done: reqHours },
    { id: 'services', label: 'Services offered (at least one selected)', step: 3, done: reqServices },
    { id: 'emergency', label: 'Emergency or towing call handling rule', step: 6, done: reqEmergency },
    { id: 'alertMobile', label: 'Mobile number for text summaries and alerts', step: 6, done: reqAlertMobile },
  ];

  const completedRequiredCount = requiredItems.filter((i) => i.done).length;
  const allRequiredDone = completedRequiredCount === requiredItems.length;

  // Evaluate 4 Recommended Items (30% total => 7.5% each)
  const recPrices = Boolean(
    setup.pricingChoice === 'no_quote' ||
      (setup.pricingChoice === 'share_prices' && setup.prices && setup.prices.length > 0)
  );
  const recPolicies = Boolean(setup.policies && setup.policies.trim().length > 0);
  const recFaq = Boolean(setup.faq && setup.faq.trim().length > 0);
  const recGreeting = Boolean(setup.greeting && setup.greeting.trim().length > 0);

  const recommendedItems = [
    { id: 'prices', label: 'Prices choice made (take message or share prices)', step: 5, done: recPrices },
    { id: 'policies', label: 'Shop policies (payment, warranties, loaners, drop-off)', step: 7, done: recPolicies },
    { id: 'faq', label: 'Common questions and answers', step: 7, done: recFaq },
    { id: 'greeting', label: 'Phone greeting reviewed', step: 6, done: recGreeting },
  ];

  const completedRecommendedCount = recommendedItems.filter((i) => i.done).length;

  // Calculate score: (doneReq / 6) * 70 + (doneRec / 4) * 30
  const calculatedScore = Math.round(
    (completedRequiredCount / requiredItems.length) * 70 +
      (completedRecommendedCount / recommendedItems.length) * 30
  );

  // Automatically save setupScore on the shop document when score screen opens
  React.useEffect(() => {
    if (!shopId) return;
    const saveScore = async () => {
      try {
        await fetch(`/api/shops/${shopId}/setup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receptionistSetup: setup,
            setupScore: calculatedScore,
            isComplete: false,
          }),
        });
      } catch (e) {
        console.warn('Auto-save setupScore failed:', e);
      }
    };
    saveScore();
  }, [shopId, calculatedScore]);

  const handleFinishDone = async () => {
    if (!allRequiredDone) return;
    if (!shopId) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/shops/${shopId}/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receptionistSetup: setup,
          setupScore: calculatedScore,
          isComplete: true,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to record completed onboarding.');
      }

      await refreshShop();
      onSetupCompleted();
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        {/* Score Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 bg-[#faf5ff] border border-[#d6bcfa] text-purple-900 px-3.5 py-1.5 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-purple-700" />
            <span>Setup Assessment</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-gray-950">
            Your receptionist is {calculatedScore}% ready
          </h1>

          <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden border border-gray-200">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                calculatedScore >= 90
                  ? 'bg-emerald-500'
                  : calculatedScore >= 70
                  ? 'bg-black'
                  : 'bg-amber-400'
              }`}
              style={{ width: `${calculatedScore}%` }}
            />
          </div>

          <p className="text-xs text-gray-600 max-w-md mx-auto">
            {allRequiredDone
              ? 'All required details are complete. You can submit now, or polish the recommended items for an even sharper receptionist.'
              : 'Complete the remaining required items below before submitting your configuration.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Required Items Section (70%) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-950">Required Items</span>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                70% of total
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {completedRequiredCount} of {requiredItems.length} complete
            </span>
          </div>

          <div className="space-y-2">
            {requiredItems.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                  item.done
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-amber-50/70 border-amber-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span
                    className={`font-semibold ${
                      item.done ? 'text-gray-900' : 'text-amber-900'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {!item.done && (
                  <button
                    type="button"
                    onClick={() => onGoToStep(item.step)}
                    className="shrink-0 px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-gray-950 font-bold rounded-lg min-h-[44px] inline-flex items-center gap-1 transition-colors text-xs"
                  >
                    <span>Finish this</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Items Section (30%) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-950">Recommended Details</span>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                30% of total
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {completedRecommendedCount} of {recommendedItems.length} added
            </span>
          </div>

          <div className="space-y-2">
            {recommendedItems.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                  item.done
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-amber-50/70 border-amber-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span
                    className={`font-semibold ${
                      item.done ? 'text-gray-900' : 'text-amber-900'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {!item.done && (
                  <button
                    type="button"
                    onClick={() => onGoToStep(item.step)}
                    className="shrink-0 px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-gray-950 font-bold rounded-lg min-h-[44px] inline-flex items-center gap-1 transition-colors text-xs"
                  >
                    <span>Finish this</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Button: "I'm done" */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <button
            type="button"
            onClick={handleFinishDone}
            disabled={!allRequiredDone || submitting}
            className={`w-full py-4 font-bold text-base rounded-xl min-h-[48px] flex items-center justify-center gap-2 shadow-sm transition-all ${
              allRequiredDone
                ? 'bg-[#d6bcfa] hover:bg-[#c49efa] text-gray-950'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <span>Submitting Setup...</span>
            ) : (
              <>
                <span>I'm done</span>
                <Check className="w-5 h-5 text-gray-950" />
              </>
            )}
          </button>

          {!allRequiredDone && (
            <p className="text-center text-xs text-amber-700 font-medium">
              Please complete all required items above before tapping "I'm done."
            </p>
          )}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="text-xs text-gray-500 hover:text-black font-semibold min-h-[44px] inline-flex items-center gap-1 py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to wizard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
