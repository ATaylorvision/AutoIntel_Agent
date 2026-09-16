import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { SettingsProvider } from './context/SettingsContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './components/HomePage.tsx';
import { AuditCalculator } from './components/AuditCalculator.tsx';
import { PricingPage } from './components/PricingPage.tsx';
import { TermsPage } from './components/TermsPage.tsx';
import { PrivacyPage } from './components/PrivacyPage.tsx';
import { DashboardPage } from './components/DashboardPage.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { SignUpModal } from './components/SignUpModal.tsx';
import { BackToTop } from './components/BackToTop.tsx';
import { UnpaidGate } from './components/UnpaidGate.tsx';
import { CheckoutSuccess } from './components/CheckoutSuccess.tsx';
import { ClientDashboard } from './components/ClientDashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { TestModeCheckout } from './components/TestModeCheckout.tsx';
import { OnboardingWelcome } from './components/OnboardingWelcome.tsx';
import { OnboardingWizard } from './components/OnboardingWizard.tsx';
import { SetupScoreView } from './components/SetupScoreView.tsx';
import { ReceptionistSetup, ShopRecord } from './types/index.ts';

function MainApp() {
  const { currentUser, isPaid, isAdmin, userRecord, shopRecord, loading } = useAuth();

  // Navigation view state
  const [currentView, setCurrentView] = useState<string>('home');
  const [signInModalOpen, setSignInModalOpen] = useState<boolean>(false);
  const [signUpModalOpen, setSignUpModalOpen] = useState<boolean>(false);
  const [pricingCanceled, setPricingCanceled] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [workingSetup, setWorkingSetup] = useState<ReceptionistSetup | null>(null);
  const [viewingAsShop, setViewingAsShop] = useState<ShopRecord | null>(null);

  // Parse URL query params and path on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const path = url.pathname;
    const canceled = url.searchParams.get('canceled');
    const sessionId = url.searchParams.get('session_id');
    const shopIdParam = url.searchParams.get('shop_id');

    if (canceled === 'true') {
      setCurrentView('pricing');
      setPricingCanceled(true);
    } else if (sessionId || path.includes('/checkout/success')) {
      setCurrentView('checkout-success');
    } else if (path.includes('/checkout/test-mode') || url.searchParams.get('mode') === 'test') {
      setCurrentView('checkout-test');
    } else if (path === '/audit') {
      setCurrentView('audit');
    } else if (path === '/pricing') {
      setCurrentView('pricing');
    } else if (path === '/terms') {
      setCurrentView('terms');
    } else if (path === '/privacy') {
      setCurrentView('privacy');
    } else if (path === '/admin') {
      setCurrentView('admin');
    } else if (path === '/portal') {
      setCurrentView('portal');
    } else if (path === '/dashboard') {
      setCurrentView('dashboard');
    }
  }, []);

  // MANDATE: "If a logged-in owner has not paid, every client page redirects to a 'Finish signing up' screen with the checkout button."
  useEffect(() => {
    if (!loading && currentUser) {
      if (!isPaid && !isAdmin) {
        if (currentView === 'portal') {
          setCurrentView('checkout-gate');
        }
      }
    }
  }, [currentUser, isPaid, isAdmin, currentView, loading]);

  // MANDATE: "Route: /admin. Only users whose email is in ADMIN_EMAILS can access it. Everyone else is redirected to their dashboard."
  useEffect(() => {
    if (!loading && currentView === 'admin') {
      if (!currentUser) {
        setSignUpModalOpen(false);
        setSignInModalOpen(true);
        setCurrentView('home');
      } else if (!isAdmin) {
        setCurrentView('portal');
      }
    }
  }, [loading, currentUser, isAdmin, currentView]);

  const handleNavigate = (view: string) => {
    if (view === 'dashboard') {
      if (!currentUser) {
        setSignUpModalOpen(false);
        setSignInModalOpen(true);
        return;
      }
    }

    if (view === 'portal') {
      if (!currentUser) {
        setSignUpModalOpen(false);
        setSignInModalOpen(true);
        return;
      }
      if (!isPaid && !isAdmin) {
        setCurrentView('checkout-gate');
        return;
      }
    }

    if (view === 'admin') {
      if (!currentUser || !isAdmin) {
        setSignUpModalOpen(false);
        setSignInModalOpen(true);
        return;
      }
    }

    if (view === 'pricing') {
      setPricingCanceled(false);
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    if (mode === 'signup') {
      setSignInModalOpen(false);
      setSignUpModalOpen(true);
    } else {
      setSignUpModalOpen(false);
      setSignInModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setSignInModalOpen(false);
    setSignUpModalOpen(false);
    // When a user signs in, navigate them directly to the Dashboard view
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuditCompleteAndSignUp = () => {
    setSignInModalOpen(false);
    setSignUpModalOpen(true);
  };

  const activeShopId = shopRecord?.id || userRecord?.shopId || 'shop_temp';

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfd] text-gray-900">
      {/* Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onOpenAudit={() => handleNavigate('audit')}
            onOpenPricing={() => handleNavigate('pricing')}
            onOpenSignUp={() => handleOpenAuth('signup')}
          />
        )}

        {currentView === 'audit' && (
          <AuditCalculator
            onCompleteAndSignUp={handleAuditCompleteAndSignUp}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {currentView === 'pricing' && (
          <PricingPage
            onGetStarted={() => {
              if (currentUser) {
                if (!isPaid) setCurrentView('checkout-gate');
                else setCurrentView('portal');
              } else {
                handleOpenAuth('signup');
              }
            }}
            canceled={pricingCanceled}
          />
        )}

        {currentView === 'terms' && (
          <TermsPage onBack={() => handleNavigate('home')} />
        )}

        {currentView === 'privacy' && (
          <PrivacyPage onBack={() => handleNavigate('home')} />
        )}

        {currentView === 'checkout-gate' && (
          <UnpaidGate
            onPaymentSuccess={() => setCurrentView('checkout-success')}
          />
        )}

        {currentView === 'checkout-test' && (
          <TestModeCheckout
            shopId={activeShopId}
            onSuccess={() => setCurrentView('checkout-success')}
            onCancel={() => handleNavigate('pricing')}
          />
        )}

        {currentView === 'checkout-success' && (
          <CheckoutSuccess
            onContinueToPortal={() => {
              if (!shopRecord?.receptionistSetup?.completedAt) {
                setCurrentView('onboarding-welcome');
              } else {
                setCurrentView('portal');
              }
            }}
          />
        )}

        {currentView === 'onboarding-welcome' && (
          <OnboardingWelcome
            onStartWizard={() => {
              setWizardStep(1);
              setCurrentView('onboarding-wizard');
            }}
          />
        )}

        {currentView === 'onboarding-wizard' && (
          <OnboardingWizard
            initialStep={wizardStep}
            onCompleteToScore={(setup) => {
              setWorkingSetup(setup);
              setCurrentView('setup-score');
            }}
            onExit={() => setCurrentView('portal')}
          />
        )}

        {currentView === 'setup-score' && (
          <SetupScoreView
            setup={workingSetup || shopRecord?.receptionistSetup || {
              shopName: shopRecord?.shopName || '',
              address: '',
              city: '',
              state: '',
              zip: '',
              mainPhone: shopRecord?.ownerMobile || '',
              serviceArea: '',
              hours: {
                monday: { open: true, openTime: '08:00', closeTime: '17:30' },
                tuesday: { open: true, openTime: '08:00', closeTime: '17:30' },
                wednesday: { open: true, openTime: '08:00', closeTime: '17:30' },
                thursday: { open: true, openTime: '08:00', closeTime: '17:30' },
                friday: { open: true, openTime: '08:00', closeTime: '17:30' },
                saturday: { open: false, openTime: '08:00', closeTime: '14:00' },
                sunday: { open: false, openTime: '09:00', closeTime: '13:00' },
              },
              services: [],
              neverDo: [],
              pricingChoice: 'no_quote',
              prices: [],
              emergencyHandling: 'transfer',
              emergencyPhone: shopRecord?.ownerMobile || '',
              alertMobile: shopRecord?.ownerMobile || '',
              alertEmail: currentUser?.email || '',
              greeting: `Thanks for calling ${shopRecord?.shopName || 'our shop'}, how can I help you?`,
              updatedAt: new Date().toISOString(),
            }}
            onGoToStep={(st) => {
              setWizardStep(st);
              setCurrentView('onboarding-wizard');
            }}
            onSetupCompleted={() => {
              setCurrentView('portal');
            }}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardPage />
        )}

        {currentView === 'portal' && (
          <ClientDashboard
            onOpenWizard={(st) => {
              setWizardStep(st || 1);
              setCurrentView('onboarding-wizard');
            }}
            viewingAsShop={viewingAsShop}
            onExitViewAsShop={() => {
              setViewingAsShop(null);
              setCurrentView('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onViewAsShop={(shop) => {
              setViewingAsShop(shop);
              setCurrentView('portal');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Footer on every page */}
      <Footer onNavigate={handleNavigate} />

      {/* Sign In Modal */}
      <AuthModal
        isOpen={signInModalOpen}
        initialMode="signin"
        onClose={() => setSignInModalOpen(false)}
        onSuccess={handleAuthSuccess}
        onSwitchToSignUp={() => {
          setSignInModalOpen(false);
          setSignUpModalOpen(true);
        }}
      />

      {/* Sign Up Modal */}
      <SignUpModal
        isOpen={signUpModalOpen}
        onClose={() => setSignUpModalOpen(false)}
        onSuccess={handleAuthSuccess}
        onSwitchToSignIn={() => {
          setSignUpModalOpen(false);
          setSignInModalOpen(true);
        }}
      />

      {/* Floating Back to Top Button */}
      <BackToTop />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <MainApp />
      </SettingsProvider>
    </AuthProvider>
  );
}
