import React, { useState, useEffect } from 'react';
import { Phone, CheckCircle, AlertCircle, Sparkles, Send, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { TestRecord } from '../types/index.ts';

interface ScenarioDef {
  id: string;
  scenarioText: string;
  expectedGoal: string;
}

const SCENARIOS: ScenarioDef[] = [
  {
    id: 'brakes',
    scenarioText: 'I need brake service for my 2020 Toyota Camry.',
    expectedGoal: 'Confirms brake service and collects caller name, vehicle year, and phone number.',
  },
  {
    id: 'breakdown',
    scenarioText: "My car broke down and I'm stuck on the side of the road.",
    expectedGoal: 'Follows your emergency or towing instructions calmly without diagnosing over the phone.',
  },
  {
    id: 'oil_change',
    scenarioText: 'How much is an oil change?',
    expectedGoal: 'Quotes your approved price range or politely takes vehicle details and a message.',
  },
  {
    id: 'saturday_hours',
    scenarioText: 'Are you open Saturday?',
    expectedGoal: 'Accurately quotes your configured weekend hours or states when the shop reopens.',
  },
];

export const ReceptionistTester: React.FC = () => {
  const { shopRecord } = useAuth();
  const shopId = shopRecord?.id;
  const phoneNumber = shopRecord?.autointelNumber || '888-212-1629';

  const [testRecords, setTestRecords] = useState<Record<string, { result: 'handled_well' | 'something_off'; note?: string }>>({});
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  // Load existing test records
  useEffect(() => {
    if (!shopId) return;
    const fetchExistingTests = async () => {
      try {
        const res = await fetch(`/api/shops/${shopId}/tests`);
        if (res.ok) {
          const data = await res.json();
          const mapped: Record<string, { result: 'handled_well' | 'something_off'; note?: string }> = {};
          data.tests?.forEach((t: TestRecord) => {
            const matchedScenario = SCENARIOS.find((s) => s.scenarioText === t.scenario);
            if (matchedScenario && !mapped[matchedScenario.id]) {
              const resType =
                t.result === 'It handled this well' || t.result === 'handled_well'
                  ? 'handled_well'
                  : 'something_off';
              mapped[matchedScenario.id] = { result: resType, note: t.note };
            }
          });
          setTestRecords(mapped);
        }
      } catch (err) {
        console.warn('Could not load test results:', err);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchExistingTests();
  }, [shopId]);

  const handleMarkHandledWell = async (scenario: ScenarioDef) => {
    if (!shopId) return;
    setSubmittingId(scenario.id);
    try {
      await fetch(`/api/shops/${shopId}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: scenario.scenarioText,
          result: 'It handled this well',
          note: '',
        }),
      });

      setTestRecords((prev) => ({
        ...prev,
        [scenario.id]: { result: 'handled_well', note: '' },
      }));
      if (openNoteId === scenario.id) {
        setOpenNoteId(null);
        setNoteText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleOpenNoteBox = (scenario: ScenarioDef) => {
    setOpenNoteId(scenario.id);
    setNoteText(testRecords[scenario.id]?.note || '');
  };

  const handleSaveIssue = async (scenario: ScenarioDef) => {
    if (!shopId) return;
    setSubmittingId(scenario.id);
    try {
      await fetch(`/api/shops/${shopId}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: scenario.scenarioText,
          result: 'Something was off',
          note: noteText,
        }),
      });

      setTestRecords((prev) => ({
        ...prev,
        [scenario.id]: { result: 'something_off', note: noteText },
      }));
      setOpenNoteId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  const wellHandledCount = SCENARIOS.filter(
    (s) => testRecords[s.id]?.result === 'handled_well'
  ).length;

  const allPassed = wellHandledCount === SCENARIOS.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Top Banner / Call Button */}
      <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-center">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-1.5 rounded-full text-xs font-bold mx-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Your Receptionist is Live</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-950">
            Test your receptionist
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
            Give your line a call and try out these real customer scenarios. Verify it answers according to your rules.
          </p>
        </div>

        {/* Large Tap-to-Call Button */}
        <div className="pt-2">
          <a
            href={`tel:${phoneNumber.replace(/[^0-9]/g, '')}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-black hover:bg-gray-800 text-white rounded-2xl min-h-[56px] shadow-md transition-all text-lg font-bold"
          >
            <Phone className="w-6 h-6 text-[#d6bcfa]" />
            <span>Call {phoneNumber}</span>
          </a>
          <span className="block text-[11px] text-gray-400 mt-2">
            Tap to place a live test call from your phone
          </span>
        </div>

        {/* 4 out of 4 passed message */}
        {allPassed && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center gap-2 text-emerald-900 text-sm font-bold animate-fadeIn">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>Your receptionist passed 4 out of 4 tests.</span>
          </div>
        )}
      </div>

      {/* 4 Scenario Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-gray-950">Test Scenarios</h2>
          <span className="text-xs font-semibold text-gray-500">
            {wellHandledCount} of {SCENARIOS.length} verified
          </span>
        </div>

        <div className="space-y-4">
          {SCENARIOS.map((sc, idx) => {
            const currentResult = testRecords[sc.id]?.result;
            const currentNote = testRecords[sc.id]?.note;
            const isSubmitting = submittingId === sc.id;
            const isBoxOpen = openNoteId === sc.id;

            return (
              <div
                key={sc.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs space-y-4 transition-all ${
                  currentResult === 'handled_well'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : currentResult === 'something_off'
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-gray-200'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-purple-700 tracking-wide uppercase">
                      Scenario {idx + 1}
                    </span>
                    {currentResult === 'handled_well' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        <Check className="w-3 h-3" />
                        Handled well
                      </span>
                    )}
                    {currentResult === 'something_off' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        <AlertCircle className="w-3 h-3" />
                        Feedback logged
                      </span>
                    )}
                  </div>

                  <p className="text-base font-bold text-gray-950">
                    "{sc.scenarioText}"
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    <strong className="text-gray-700">What to look for:</strong> {sc.expectedGoal}
                  </p>
                </div>

                {/* Feedback Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleMarkHandledWell(sc)}
                    disabled={isSubmitting}
                    className={`py-3 px-4 rounded-xl font-bold text-xs min-h-[44px] flex items-center justify-center gap-2 transition-all ${
                      currentResult === 'handled_well'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 hover:bg-emerald-50 text-gray-800 hover:text-emerald-900 border border-transparent hover:border-emerald-200'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>It handled this well</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenNoteBox(sc)}
                    disabled={isSubmitting}
                    className={`py-3 px-4 rounded-xl font-bold text-xs min-h-[44px] flex items-center justify-center gap-2 transition-all ${
                      currentResult === 'something_off'
                        ? 'bg-amber-400 text-gray-950'
                        : 'bg-gray-100 hover:bg-amber-50 text-gray-800 hover:text-amber-900 border border-transparent hover:border-amber-200'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Something was off</span>
                  </button>
                </div>

                {/* Note Box for "Something was off" */}
                {isBoxOpen && (
                  <div className="pt-2 space-y-2 border-t border-amber-200">
                    <label className="block text-xs font-semibold text-gray-700">
                      What went wrong or sounded unnatural?
                    </label>
                    <textarea
                      rows={2}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="e.g. It quoted a flat price for European brakes instead of taking vehicle details."
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:border-black min-h-[44px]"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setOpenNoteId(null)}
                        className="px-3 py-1.5 text-xs text-gray-500 hover:text-black min-h-[44px]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveIssue(sc)}
                        disabled={isSubmitting || !noteText.trim()}
                        className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-xl min-h-[44px] flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Send className="w-3 h-3 text-[#d6bcfa]" />
                        <span>Send Feedback</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Display previous note if any */}
                {currentResult === 'something_off' && currentNote && !isBoxOpen && (
                  <div className="p-3 bg-amber-50/60 rounded-xl text-xs text-amber-900 italic border border-amber-200">
                    " {currentNote} "
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
