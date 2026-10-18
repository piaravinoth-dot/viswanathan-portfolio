import { lazy, Suspense } from "react";
import "./App.css";
const AIDesignStudioCaseStudy = lazy(() => import("./components/AIDesignStudioCaseStudy"));
const ContentStudioCaseStudy = lazy(() => import("./components/ContentStudioCaseStudy"));
const SocialIntelligenceCaseStudy = lazy(() => import("./components/SocialIntelligenceCaseStudy"));
const ContentTrackerCaseStudy = lazy(() => import("./components/ContentTrackerCaseStudy"));
const SplitMateCaseStudy = lazy(() => import("./components/SplitMateCaseStudy"));
const ClipStudioCaseStudy = lazy(() => import("./components/ClipStudioCaseStudy"));

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
import { LoadingProvider } from "./context/LoadingProvider";

const App = () => {
  const route = window.location.pathname.replace(/\/$/, "");
  const caseStudies = {
    "/work/ai-design-studio": AIDesignStudioCaseStudy,
    "/work/content-studio": ContentStudioCaseStudy,
    "/work/social-media-intelligence": SocialIntelligenceCaseStudy,
    "/work/content-tracker": ContentTrackerCaseStudy,
    "/work/splitmate": SplitMateCaseStudy,
    "/work/clip-studio": ClipStudioCaseStudy,
  };
  const CaseStudy = caseStudies[route];
  if (CaseStudy) return <Suspense fallback={<main className="case-loading" role="status">Loading case study…</main>}><CaseStudy /></Suspense>;
  return (
    <>
      <LoadingProvider>
        <Suspense>
          <MainContainer>
            <Suspense>
              <CharacterModel />
            </Suspense>
          </MainContainer>
        </Suspense>
      </LoadingProvider>
    </>
  );
};

export default App;
