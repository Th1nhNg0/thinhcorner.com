"use client";

import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "./react-medium-image-zoom.css";

export function RoundedImage(props) {
  return (
    <Zoom>
      <Image alt={props.alt} className="rounded-xl  object-cover" {...props} />
    </Zoom>
  );
}
export function RoundedImageRaw(props) {
  return (
    <Zoom>
      <picture>
        <img alt={props.alt} className="rounded-xl " {...props} />
      </picture>
    </Zoom>
  );
}
