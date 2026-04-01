import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';

export default function Progress() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/student/progress`, { withCredentials: true });
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      toast.error('Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (taskId, completed) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/api/student/progress`,
        { task_id: taskId, completed: !completed },
        { withCredentials: true }
      );
      setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !completed } : t));
      toast.success(completed ? 'Task marked as pending' : 'Task completed!');
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Failed to update task');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="p-6 md:p-8" data-testid="progress-page">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>Progress</h1>
        <p className="text-slate-500 mt-2">Track your daily preparation tasks</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-700">Overall Progress</p>
          <p className="text-2xl font-semibold text-indigo-600">{progressPercentage}%</p>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
            data-testid="progress-bar"
          ></div>
        </div>
        <p className="text-xs text-slate-500 mt-2">{completedCount} of {tasks.length} tasks completed</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-medium text-slate-900 mb-6" style={{fontFamily: 'Outfit'}}>Task Checklist</h2>
        <div className="space-y-3">
          {tasks.map((task, idx) => (
            <div
              key={idx}
              data-testid={`task-item-${idx}`}
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-600 transition-all"
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggle(task.id, task.completed)}
                data-testid={`task-checkbox-${idx}`}
                className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
              />
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                }`}>
                  Day {task.day}: {task.task}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{task.company}</p>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-center text-slate-500 py-8">No tasks yet. Generate a roadmap to start!</p>
          )}
        </div>
      </div>
    </div>
  );
}
