"use client";

import { useState, useRef } from "react";
import type { Expense } from "@/lib/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface ExpenseCardProps {
  expense: Expense;
  onDelete?: (id: string) => void;
  onEdit?: (expense: Expense) => void;
  showActions?: boolean;
}

const verdictConfig = {
  good: { label: "무죄", className: "text-primary-text" },
  bad: { label: "유죄!", className: "text-destructive" },
};

const ACTION_WIDTH = 160;
const SNAP_THRESHOLD = ACTION_WIDTH * 0.4;

export function ExpenseCard({
  expense,
  onDelete,
  onEdit,
  showActions = false,
}: ExpenseCardProps) {
  const [showReason, setShowReason] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const startOffset = useRef(0);
  const isHorizontal = useRef<boolean | null>(null); // null = not yet determined
  const isDragging = useRef(false);

  const verdict = expense.verdict ? verdictConfig[expense.verdict] : null;
  const hasReason = expense.reason;

  /** 직접 DOM 스타일 업데이트 (re-render 없이 60fps 드래그) */
  const applyOffset = (offset: number) => {
    if (cardRef.current)
      cardRef.current.style.transform = `translateX(-${offset}px)`;
    if (actionsRef.current)
      actionsRef.current.style.width = `${offset}px`;
  };

  /** 스냅 애니메이션 (CSS transition 활성화) */
  const snapTo = (open: boolean) => {
    const target = open ? ACTION_WIDTH : 0;
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.2s ease";
      cardRef.current.style.transform = `translateX(-${target}px)`;
    }
    if (actionsRef.current) {
      actionsRef.current.style.transition = "width 0.2s ease";
      actionsRef.current.style.width = `${target}px`;
    }
    setIsOpen(open);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    startOffset.current = isOpen ? ACTION_WIDTH : 0;
    isHorizontal.current = null;
    isDragging.current = false;

    // transition 제거해서 드래그 시 즉각 반응
    if (cardRef.current) cardRef.current.style.transition = "none";
    if (actionsRef.current) actionsRef.current.style.transition = "none";
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // 방향 미결정 구간: 5px 이상 움직이면 확정
    if (isHorizontal.current === null) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }

    if (!isHorizontal.current) return;

    isDragging.current = true;
    e.preventDefault();

    // 오른쪽 방향은 막음 (전체 스와이프 불가)
    const raw = startOffset.current - dx;
    const clamped = Math.max(0, Math.min(ACTION_WIDTH, raw));
    applyOffset(clamped);
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;

    const currentWidth = actionsRef.current
      ? parseFloat(actionsRef.current.style.width || "0")
      : startOffset.current;

    snapTo(currentWidth >= SNAP_THRESHOLD);
  };

  const handleCardClick = () => {
    if (isOpen) {
      snapTo(false);
      return;
    }
    if (hasReason) setShowReason((v) => !v);
  };

  return (
    <div className="relative overflow-hidden mb-3">
      {/* 액션 버튼: 초기 width=0, 스와이프 시 늘어남 */}
      {showActions && (
        <div
          ref={actionsRef}
          className="absolute right-0 top-0 bottom-0 flex overflow-hidden"
          style={{ width: 0 }}
        >
          {onEdit && (
            <button
              className="w-20 shrink-0 bg-gray-200 text-black text-sm font-bold"
              onClick={() => { snapTo(false); onEdit(expense); }}
            >
              수정
            </button>
          )}
          {onDelete && (
            <button
              className="w-20 shrink-0 bg-red-500 text-white text-sm font-bold"
              onClick={() => { snapTo(false); onDelete(expense.id); }}
            >
              삭제
            </button>
          )}
        </div>
      )}

      {/* 카드 본문 */}
      <div
        ref={cardRef}
        className={cn("bg-white p-2", hasReason && !isOpen && "cursor-pointer")}
        style={{ touchAction: showActions ? "pan-y" : undefined }}
        onClick={handleCardClick}
        onTouchStart={showActions ? handleTouchStart : undefined}
        onTouchMove={showActions ? handleTouchMove : undefined}
        onTouchEnd={showActions ? handleTouchEnd : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <span className="mb-2 inline-block border-2 border-black px-2 py-0.5 text-xs font-bold text-black">
              {expense.category}
            </span>
            <p className="pixel-number text-2xl text-black">
              {formatCurrency(expense.amount)}
            </p>
            {expense.memo && (
              <p className="mt-1 text-sm text-gray-600">{expense.memo}</p>
            )}
          </div>

          <div className="text-right">
            {verdict && (
              <p className={cn("pixel-font text-lg font-bold", verdict.className)}>
                {verdict.label}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">{formatDate(expense.date)}</p>
          </div>
        </div>

        {hasReason && showReason && (
          <div className="mt-3 border-t border-gray-200 pt-3 text-sm text-gray-700">
            {expense.reason}
          </div>
        )}
      </div>
    </div>
  );
}
