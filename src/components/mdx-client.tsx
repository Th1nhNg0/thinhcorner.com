"use client";

import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import { cn } from "@/lib/utils";
import "./react-medium-image-zoom.css";

export function RoundedImage(props) {
  return (
    <Zoom>
      <Image
        {...props}
        alt={props.alt}
        className={cn("rounded-xl object-cover", props.className)}
      />
    </Zoom>
  );
}
export function RoundedImageRaw(props) {
  return (
    <Zoom>
      <picture>
        <img
          {...props}
          alt={props.alt}
          className={cn("rounded-xl object-cover", props.className)}
        />
      </picture>
    </Zoom>
  );
}
