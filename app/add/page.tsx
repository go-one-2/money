'use client';

import { Header } from '@/components/header';
import { ExpenseForm } from '@/components/expense-form';

export default function AddExpensePage() {
  return (
    <>
      <Header title="소비 입력" />
      <main className="container px-4 py-6 max-w-md mx-auto">
        <ExpenseForm />
      </main>
    </>
  );
}
