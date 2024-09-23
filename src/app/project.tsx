"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import animation from "./typing.json";

export default function Project() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startDate = new Date("2024-09-29");
    const endDate = new Date("2026-09-29");
    const currentDate = new Date();
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = currentDate.getTime() - startDate.getTime();
    const calculatedProgress = Math.min(
      100,
      Math.max(0, (elapsedDuration / totalDuration) * 100)
    );
    setProgress(Math.round(calculatedProgress));
  }, []);

  return (
    <Card className="not-prose p-0 flex flex-row w-full max-w-2xl overflow-hidden">
      <div className="h-full flex-1 md:max-w-40">
        <div className="flex items-center justify-center aspect-square">
          <Lottie animationData={animation} />
        </div>
      </div>
      <div className="p-4 flex-1">
        <CardContent className="p-0 mb-4">
          <h3 className="text-lg font-semibold mb-1">MBA Digital Notebook</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Documenting my Master of Business Administration journey
          </p>
          <div className="flex items-center">
            <Progress value={progress} className="h-2 flex-grow mr-2" />
            <span className="text-xs text-muted-foreground">{progress}%</span>
          </div>
        </CardContent>
        <CardFooter className="p-0">
          <Button variant="outline" size="sm" asChild>
            <Link href="http://mba.thinhcorner.com/">View Project</Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
