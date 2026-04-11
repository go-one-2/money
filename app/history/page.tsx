"use client";

import { useState, useMemo } from "react";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { Header } from "@/components/header";
import { ExpenseList } from "@/components/expense-list";
import { ExpenseForm } from "@/components/expense-form";
import { useExpenseStore } from "@/lib/store";
import { CATEGORIES, type Category, type Expense } from "@/lib/types";
import { CATEGORY_ICONS } from "@/components/add/constants";
import { cn } from "@/lib/utils";

type VerdictFilter = "all" | "bad" | "good";

const VERDICT_TABS: { label: string; value: VerdictFilter }[] = [
  { label: "전체", value: "all" },
  { label: "유죄", value: "bad" },
  { label: "무죄", value: "good" },
];

export default function HistoryPage() {
  const { expenses, deleteExpense } = useExpenseStore();
  const [verdictFilter, setVerdictFilter] = useState<VerdictFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    if (verdictFilter !== "all") {
      result = result.filter((e) => e.verdict === verdictFilter);
    }
    if (categoryFilter !== "all") {
      result = result.filter((e) => e.category === categoryFilter);
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, verdictFilter, categoryFilter]);

  const handleDelete = (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deleteExpense(id);
    }
  };

  return (
    <>
      <Header title="소비 내역" />

      {/* 탭 */}
      <div className="bg-black">
        <div className="flex">
          {VERDICT_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setVerdictFilter(tab.value)}
              className={cn(
                "flex-1 pt-4 pb-2 font-bold transition-colors",
                verdictFilter === tab.value
                  ? "text-primary border-primary border-b-2"
                  : "font-normal text-gray-500",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto min-h-screen max-w-md bg-white">
        {/* 카테고리 필터 */}
        <div className="border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-500">카테고리</span>
            <button
              onClick={() => setShowCategorySelect((v) => !v)}
              className="flex items-center gap-2 font-medium text-black"
            >
              {categoryFilter === "all" ? (
                <LayoutGrid className="h-4 w-4" />
              ) : (
                CATEGORY_ICONS[categoryFilter]
              )}
              <span>{categoryFilter === "all" ? "전체" : categoryFilter}</span>
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", showCategorySelect && "rotate-180")}
              />
            </button>
          </div>

          {/* 카테고리 드롭다운 */}
          {showCategorySelect && (
            <div className="px-4 pb-3">
              <div className="grid grid-cols-4 gap-2">
                {/* 전체 버튼 */}
                <button
                  onClick={() => {
                    setCategoryFilter("all");
                    setShowCategorySelect(false);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3",
                    categoryFilter === "all"
                      ? "bg-[var(--pixel-lime)] text-[var(--pixel-border)]"
                      : "text-black",
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="text-xs">전체</span>
                </button>

                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategoryFilter(cat);
                      setShowCategorySelect(false);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3",
                      categoryFilter === cat
                        ? "bg-[var(--pixel-lime)] text-[var(--pixel-border)]"
                        : "text-black",
                    )}
                  >
                    {CATEGORY_ICONS[cat]}
                    <span className="text-xs">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-4">
          <ExpenseList
            expenses={filteredExpenses}
            onDelete={handleDelete}
            onEdit={(expense) => setEditingExpense(expense)}
            showActions
            emptyMessage="소비 내역이 없습니다."
          />
        </div>
      </main>

      {editingExpense && (
        <div className="pixel-dialog-overlay fixed inset-0 z-50 flex items-center justify-center">
          <div className="pixel-dialog mx-4 w-full max-w-md p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="pixel-font text-lg font-semibold">소비 수정</h2>
              <button
                onClick={() => setEditingExpense(null)}
                className="text-muted-foreground hover:text-card-foreground text-xl"
              >
                ✕
              </button>
            </div>
            <ExpenseForm expense={editingExpense} onSuccess={() => setEditingExpense(null)} />
          </div>
        </div>
      )}
    </>
  );
}
