"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const BACKGROUND_COUNT = 8;
const BASE_PATH = "/backgrounds";

function pickRandomIndex(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

export default function RandomBackground() {
  const [bg, setBg] = useState(null);

  useEffect(() => {
    const index = pickRandomIndex(BACKGROUND_COUNT);
    const url = `${BASE_PATH}/background-${index + 1}.jpg`;

    const raf = requestAnimationFrame(() => {
      setBg(url);
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  if (!bg) {
    return <div className="fixed inset-0 -z-10 bg-black" />;
  }

  return (
    <div className="fixed inset-0 -z-10">
      <Image
        src={bg}
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
}
