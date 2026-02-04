"use client";

import { useEffect, useState } from "react";

interface LoadingScreenProps {
  isVisible: boolean;
}

export function LoadingScreen({ isVisible }: LoadingScreenProps) {
  const [loadingDots, setLoadingDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`fixed inset-0 flex flex-col bg-background overflow-hidden transition-transform duration-300 ease-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* 픽셀 저울 애니메이션 */}
        <div className="flex flex-col items-center">
          {/* 저울대 (흔들리는 부분) */}
          <div className="relative w-32 animate-scale-swing origin-top">
            {/* 가로 막대 */}
            <div className="h-2 bg-[var(--pixel-lime)] relative">
              <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-3 h-3 bg-[var(--pixel-lime)]" />
            </div>

            {/* 왼쪽 줄 + 접시 */}
            <div className="absolute left-1 top-2 flex flex-col items-center">
              <div className="w-0.5 h-12 bg-foreground/50" />
              <div className="w-5 h-1 bg-foreground/70 rounded-sm" />
              <div className="w-3 h-1 bg-foreground/70 rounded-sm" />
            </div>

            {/* 오른쪽 줄 + 접시 */}
            <div className="absolute right-1 top-2 flex flex-col items-center">
              <div className="w-0.5 h-12 bg-foreground/50" />
              <div className="w-5 h-1 bg-foreground/70 rounded-sm" />
              <div className="w-3 h-1 bg-foreground/70 rounded-sm" />
            </div>
          </div>

          {/* 기둥 - 저울대 바로 아래 붙임 */}
          <div className="w-2 h-20 bg-foreground/80" />
          {/* 받침대 */}
          <div className="w-10 h-2 bg-foreground/80 rounded-sm" />
          <div className="w-6 h-1 bg-foreground/60 rounded-sm" />
        </div>

        {/* 로딩 텍스트 */}
        <div className="mt-8 text-center">
          <p className="text-xl pixel-font text-foreground">
            판단 중{loadingDots}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            소비 내역을 분석하고 있어요
          </p>
        </div>
      </div>
    </div>
  );
}
