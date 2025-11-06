import { AlertTriangle, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { useActiveAccount } from "~/hooks/use-accounts";

const REFRESH_INTERVAL_SECONDS = 30;

type TotpDisplayProps = {
  isLoading: boolean;
  data: string | null;
  error: Error | null;
  onRefresh: () => void;
};

const Totp = ({
  isLoading,
  data,
  error,
}: Omit<TotpDisplayProps, "onRefresh">) => {
  const [hovered, setHovered] = useState(false);

  if (error) {
    return (
      <div className="flex flex-col items-center text-destructive">
        <AlertTriangle className="w-8 h-8" />
        <span className="text-xs font-medium">Error</span>
      </div>
    );
  }

  if (isLoading && !data) {
    return <Skeleton className="h-8 w-32" />;
  }

  const code = data || "-----";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  return (
    <div className="flex justify-center w-full">
      {/* Wrap the code in a relative container sized to content */}
      <button
        type="button"
        onClick={handleCopy}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex items-center cursor-pointer select-none"
      >
        <span className="text-2xl font-bold tracking-widest text-foreground">
          {code}
        </span>

        <div
          className={`absolute flex items-center gap-2 ml-2 top-1/2 left-full transform -translate-y-1/2
          transition-all duration-200 ease-out
          ${
            hovered
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 pointer-events-none"
          }`}
        >
          <Copy className="w-5 h-5 text-white-400" />
          <span className="text-sm text-muted-foreground">Copy</span>
        </div>
      </button>
    </div>
  );
};

export const TotpDisplay = ({
  isLoading,
  data,
  error,
  onRefresh,
}: TotpDisplayProps) => {
  const [progress, setProgress] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const lastProgressRef = useRef(100);
  const { activeAccount } = useActiveAccount();

  useEffect(() => {
    onRefresh();
    setProgress(0);
    setRemainingSeconds(REFRESH_INTERVAL_SECONDS);
    lastProgressRef.current = 100;
  }, [onRefresh]);

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const timeInPeriod = now % REFRESH_INTERVAL_SECONDS;
    const initialProgress =
      ((REFRESH_INTERVAL_SECONDS - timeInPeriod) / REFRESH_INTERVAL_SECONDS) *
      100;

    setProgress(initialProgress);
    setRemainingSeconds(REFRESH_INTERVAL_SECONDS - timeInPeriod);

    const timer = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const currentTimeInPeriod = currentTime % REFRESH_INTERVAL_SECONDS;
      const currentProgress =
        ((REFRESH_INTERVAL_SECONDS - currentTimeInPeriod) /
          REFRESH_INTERVAL_SECONDS) *
        100;

      setProgress(currentProgress);
      setRemainingSeconds(REFRESH_INTERVAL_SECONDS - currentTimeInPeriod);

      if (currentProgress > lastProgressRef.current) {
        onRefresh();
      }
      lastProgressRef.current = currentProgress;
    }, 1000);

    return () => clearInterval(timer);
  }, [onRefresh]);

  return (
    <Card className="w-full bg-card">
      <CardContent className="w-full flex flex-col items-center justify-center space-y-4">
        <Totp isLoading={isLoading} data={data} error={error} />
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden relative">
          <div
            className="h-full rounded-full animate-[snake_1s_linear_infinite]"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, rgba(100,180,255,0.1), rgba(100,180,255,0.5), rgba(255,255,255,0.6), rgba(100,180,255,0.5), rgba(100,180,255,0.1))",
              transition: "width 0.25s linear",
            }}
          />
        </div>
        <p className="text-sm text-white w-full text-center">
          {isLoading && !data
            ? "Initializing timer..."
            : `Code expires in ${remainingSeconds}s`}
        </p>
      </CardContent>
    </Card>
  );
};
