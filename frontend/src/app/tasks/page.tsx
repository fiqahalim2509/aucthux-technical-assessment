import TasksClient from '@/components/tasks/TasksClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tasks | TaskFlow',
};

export default function TasksPage() {
  return <TasksClient />;
}
