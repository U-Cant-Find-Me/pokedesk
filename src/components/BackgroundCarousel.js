"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

const images = [
    "/poke0.png",
    "/poke1.jpg",
    "/poke2.png",
    "/poke3.jpg",
    "/poke4.jpg",
    "/poke5.jpg",
    "/poke6.jpg",
    "/poke7.jpg",
    "/poke8.jpg",
    "/poke9.png",
    "/poke10.png",
    "/poke11.jpg",
    "/eevee.png"
];

export default function BackgroundCarousel() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 5000); // 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden">
            {images.map((src, idx) => (
                <Image
                    key={src}
                    src={src}
                    alt="Pokémon background"
                    fill
                    className={`object-cover transition-opacity duration-1000 ${idx === current ? 'opacity-100' : 'opacity-0'}`}
                    priority={idx === 0}
                />
            ))}
            <div className="absolute inset-0 bg-white/75 dark:bg-black/75 pointer-events-none" />
        </div>
    );
}
