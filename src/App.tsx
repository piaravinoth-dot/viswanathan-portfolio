import { lazy, Suspense } from "react";
import "./App.css";
import AIDesignStudioCaseStudy from "./components/AIDesignStudioCaseStudy";
import ContentStudioCaseStudy from "./components/ContentStudioCaseStudy";
import SocialIntelligenceCaseStudy from "./components/SocialIntelligenceCaseStudy";
import ContentTrackerCaseStudy from "./components/ContentTrackerCaseStudy";
import SplitMateCaseStudy from "./components/SplitMateCaseStudy";
import SplitMateCaseStudy from "./components/SplitMateCaseStudy";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
import { LoadingProvider } from "./context/LoadingProvider";

const App = () => {
  if (window.location.pathname.startsWith("/work/ai-design-studio")) return <AIDesignStudioCaseStudy />;
  if (window.location.pathname.startsWith("/work/content-studio")) return <ContentStudioCaseStudy />;
  if (window.location.pathname.startsWith("/work/social-media-intelligence")) return <SocialIntelligenceCaseStudy />;
  if (window.location.pathname.startsWith("/work/content-tracker")) return <ContentTrackerCaseStudy />;
  if (window.location.pathname.startsWith("/work/splitmate")) return <SplitMateCaseStudy />;
  if (window.location.pathname.startsWith("/work/splitmate")) return <SplitMateCaseStudy />;
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
