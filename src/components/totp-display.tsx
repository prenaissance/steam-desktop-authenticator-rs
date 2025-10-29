import { AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

interface CircularProgressProps {
  progress: number; // A value from 0 to 100
}

function CircularProgress({ progress }: CircularProgressProps) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;

  // Calculate the dash offset
  const offset = circumference * (1 - progress / 100);

  return (
    <svg className="w-full h-full" viewBox="0 0 48 48">
      <title>Progress Circle</title>
      {/* Start the circle from the top (-rotate-90) */}
      <g className="transform -rotate-90 origin-center">
        {/* Background Circle (the gray track) */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          strokeWidth="4"
          fill="transparent"
          className="stroke-muted" // Uses shadcn 'muted' color
        />

        {/* Foreground Circle (the moving progress) */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          strokeWidth="4"
          fill="transparent"
          className="stroke-primary" // Uses shadcn 'primary' color
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          // CSS transition for smooth animation between renders
          style={{ transition: "stroke-dashoffset 0.25s linear" }}
        />
      </g>
    </svg>
  );
}

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

  return (
    <span
      className={`text-3xl font-bold tracking-widest text-foreground transition-opacity ${
        isLoading ? "opacity-50" : "opacity-100"
      }`}
    >
      {code}
    </span>
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

  useEffect(() => {
    const updateProgress = () => {
      const now = Date.now();
      const intervalMs = REFRESH_INTERVAL_SECONDS * 1000;
      const remainder = now % intervalMs;
      const remainingMs = intervalMs - remainder;
      const currentProgress = (remainingMs / intervalMs) * 100;
      if (currentProgress > lastProgressRef.current) {
        onRefresh(); // Call the `invalidate` function
      }
      lastProgressRef.current = currentProgress;
      setProgress(currentProgress);
      setRemainingSeconds(Math.ceil(remainingMs / 1000));
    };

    updateProgress();
    const intervalId = setInterval(updateProgress, 250);
    return () => clearInterval(intervalId);
  }, [onRefresh]);

  return (
    <Card className="w-full max-w-xs">
      <CardHeader>
        <CardTitle>Authentication Code</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <div className="grid w-36 h-36 place-items-center mb-6">
          <div className="col-start-1 row-start-1 w-full h-full">
            <CircularProgress progress={progress} />
          </div>
          <div className="col-start-1 row-start-1">
            <Totp isLoading={isLoading} data={data} error={error} />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {isLoading && !data
            ? "Initializing timer..."
            : `Code expires in ${remainingSeconds}s`}
        </p>
      </CardContent>
    </Card>
  );
};
