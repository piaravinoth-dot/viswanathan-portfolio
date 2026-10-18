import { lazy, Suspense } from "react";
import "./App.css";
import AIDesignStudioCaseStudy from "./components/AIDesignStudioCaseStudy";
import ContentStudioCaseStudy from "./components/ContentStudioCaseStudy";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
import { LoadingProvider } from "./context/LoadingProvider";

const App = () => {
  if (window.location.pathname.startsWith("/work/ai-design-studio")) return <AIDesignStudioCaseStudy />;
  if (window.location.pathname.startsWith("/work/content-studio")) return <ContentStudioCaseStudy />;
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
