"use client";

import { useState } from "react";
import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KEYPAD_BUTTONS, formatAmount } from "./constants";

interface AmountInputProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  onComplete: () => void;
  isTransitioning: boolean;
}

export function AmountInput({
  amount,
  onAmountChange,
  onComplete,
  isTransitioning,
}: AmountInputProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handleKeyPress = (key: string) => {
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 150);

    if (key === "delete") {
      onAmountChange(amount.slice(0, -1));
    } else if (key === "000") {
      if (amount.length > 0 && amount.length <= 9) {
        onAmountChange(amount + "000");
      }
    } else {
      if (amount.length < 12) {
        onAmountChange(amount + key);
      }
    }
  };

  return (
    <>
      {/* Amount Display */}
      <div
        className={`
          flex-1 flex flex-col items-center justify-center px-4
          transition-all duration-300 ease-out
          ${isTransitioning ? "opacity-50" : "opacity-100"}
        `}
      >
        <p
          className={`text-muted-foreground mb-6 pixel-font transition-opacity duration-200 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
        >
          얼마를 쓰셨어요?
        </p>

        <div
          className={`text-4xl pixel-number tracking-tight transition-all duration-300 ${isTransitioning ? "opacity-0 -translate-y-8" : "opacity-100 translate-y-0"}`}
        >
          {formatAmount(amount)}원
        </div>
      </div>

      {/* Keypad Section */}
      <div
        className={`px-4 pb-4 transition-all duration-300 ${isTransitioning ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"}`}
      >
        <div className="grid grid-cols-3 gap-1 mb-4">
          {KEYPAD_BUTTONS.flat().map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className={`
                h-16 flex items-center justify-center text-xl
                transition-colors
                ${
                  activeKey === key
                    ? "bg-[var(--pixel-lime)] text-[var(--pixel-border)]"
                    : "bg-transparent text-foreground"
                }
                ${key === "delete" ? "" : "pixel-font"}
              `}
            >
              {key === "delete" ? <Delete className="w-6 h-6" /> : key}
            </button>
          ))}
        </div>

        <Button
          variant="pixel-lime"
          className="w-full"
          onClick={onComplete}
          disabled={!amount}
        >
          완료
        </Button>
      </div>
    </>
  );
}
