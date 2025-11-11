import { AlertTriangle, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useTotp } from "~/api/totp";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

const REFRESH_INTERVAL_SECONDS = 30;

type TotpProps = {
  isLoading: boolean;
  data: string | null;
  error: Error | null;
};

const Totp = ({ isLoading, data, error }: TotpProps) => {
  const [hovered, setHovered] = useState(false);

  if (error) {
    return (
      <div className="flex flex-col items-center text-destructive">
        <AlertTriangle className="h-8 w-8" />
        <span className="font-medium text-xs">Error</span>
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
    <div className="flex w-full justify-center">
      {/* Wrap the code in a relative container sized to content */}
      <button
        type="button"
        onClick={handleCopy}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex cursor-pointer select-none items-center"
      >
        <span className="font-bold text-2xl text-foreground tracking-widest">
          {code}
        </span>

        <div
          className={`-translate-y-1/2 absolute top-1/2 left-full ml-2 flex transform items-center gap-2 transition-all duration-200 ease-out ${
            hovered
              ? "translate-x-0 opacity-100"
              : "pointer-events-none translate-x-4 opacity-0"
          }`}
        >
          <Copy className="h-5 w-5 text-white-400" />
          <span className="text-muted-foreground text-sm">Copy</span>
        </div>
      </button>
    </div>
  );
};

export const TotpDisplay = () => {
  const { isLoading, data, error, refetch } = useTotp();
  const [progress, setProgress] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const lastProgressRef = useRef(100);

  useEffect(() => {
    refetch();
    setProgress(0);
    setRemainingSeconds(REFRESH_INTERVAL_SECONDS);
    lastProgressRef.current = 100;
  }, [refetch]);

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
        refetch();
      }
      lastProgressRef.current = currentProgress;
    }, 1000);

    return () => clearInterval(timer);
  }, [refetch]);

  return (
    <Card className="w-full bg-card">
      <CardContent className="flex w-full flex-col items-center justify-center space-y-4">
        <Totp isLoading={isLoading} data={data ?? null} error={error} />
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full animate-[snake_1s_linear_infinite] rounded-full"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, rgba(100,180,255,0.1), rgba(100,180,255,0.5), rgba(255,255,255,0.6), rgba(100,180,255,0.5), rgba(100,180,255,0.1))",
              transition: "width 0.25s linear",
            }}
          />
        </div>
        <p className="w-full text-center text-sm text-white">
          {isLoading && !data
            ? "Initializing timer..."
            : `Code expires in ${remainingSeconds}s`}
        </p>
      </CardContent>
    </Card>
  );
};
