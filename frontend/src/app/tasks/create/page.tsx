import CreateTaskForm from '@/components/tasks/CreateTaskForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Task | TaskFlow',
};

export default function CreateTaskPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <CreateTaskForm />
      </div>
    </div>
  );
}
