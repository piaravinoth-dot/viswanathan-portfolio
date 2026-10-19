import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import Loading from "../components/Loading";

interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
  setLoading: (percent: number) => void;
}

export const LoadingContext = createContext<LoadingType | null>(null);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  // The welcome overlay runs on homepage entry only; case-study routes skip this provider.
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(0);

  const value = {
    isLoading,
    setIsLoading,
    setLoading,
  };
  useEffect(() => {
    if (!isLoading) return;
    // Keep the original loading/welcome design, but don't wait for the heavy
    // 3D model. It initializes independently behind this brief intro.
    // This percentage is the intro animation progress, not network progress.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLoading(100);
      setIsLoading(false);
      return;
    }
    let frame = 0;
    let startedAt: number | null = null;
    const duration = window.matchMedia("(max-width: 760px)").matches ? 450 : 650;
    const tick = (now: number) => {
      if (startedAt === null) startedAt = now;
      const percent = Math.min(100, Math.floor(((now - startedAt) / duration) * 100));
      setLoading(percent);
      if (percent < 100) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    // Failsafe: an interrupted tab cannot keep the overlay indefinitely.
    const safety = window.setTimeout(() => {setLoading(100);setIsLoading(false);}, 3200);
    return () => {window.cancelAnimationFrame(frame);window.clearTimeout(safety)};
  }, [isLoading]);

  return (
    <LoadingContext.Provider value={value as LoadingType}>
      {isLoading && <Loading percent={loading} />}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
