import { lazy, Suspense } from "react";
import "./App.css";
import AIDesignStudioCaseStudy from "./components/AIDesignStudioCaseStudy";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
import { LoadingProvider } from "./context/LoadingProvider";

const App = () => {
  if (window.location.pathname.replace(/\\/$/, "") === "/work/ai-design-studio") return <AIDesignStudioCaseStudy />;
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
