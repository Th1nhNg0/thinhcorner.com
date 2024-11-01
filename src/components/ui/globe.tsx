"use client";

import createGlobe, { COBEOptions } from "cobe";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const GLOBE_CONFIG: COBEOptions = {
  width: 400,
  height: 400,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 2.85,
  theta: -0.55,
  dark: 1,
  scale: 2.5,
  diffuse: 3,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1.2, 1.2, 1.2],
  offset: [0, 0],
  markers: [
    {
      location: [10.7830231, 106.6941057],
      size: 0.05,
    },
  ],
};

export default function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  config?: COBEOptions;
}) {
  let width = 0;
  let height = 0;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onResize = () => {
    if (canvasRef.current) {
      width = canvasRef.current.offsetWidth;
      height = canvasRef.current.offsetHeight;
    }
  };

  useEffect(() => {
    let phi = 2.85;
    let phi_delta = 0.0001;
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current!, {
      ...config,
      width: width * 2,
      height: height * 2,
      offset: [0, height / 1],
      onRender: (state) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.
        state.phi = phi;
        phi += phi_delta;
        if (phi >= 3 || phi <= 2.7) {
          phi_delta *= -1;
        }
      },
    });

    setTimeout(() => (canvasRef.current!.style.opacity = "1"));
    return () => globe.destroy();
  }, []);

  return (
    <div className={cn("absolute inset-0 mx-auto w-full", className)}>
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]"
        )}
        ref={canvasRef}
      />
    </div>
  );
}
