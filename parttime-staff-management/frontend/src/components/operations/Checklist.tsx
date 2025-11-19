/* file: frontend/src/components/operations/Checklist.tsx */
import React from "react";
import { TaskChecklistDto } from "../../models/Operations";

interface Props {
  tasks: TaskChecklistDto[];
  onToggle: (taskId: number) => void;
}

export const Checklist: React.FC<Props> = ({ tasks, onToggle }) => {
  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white fw-bold">
        <i className="bi bi-check2-square me-2 text-success"></i> Checklist Công
        Việc
      </div>
      <ul className="list-group list-group-flush">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="list-group-item d-flex align-items-center"
          >
            <input
              className="form-check-input me-3"
              type="checkbox"
              id={`task-${task.id}`}
              onChange={() => onToggle(task.id!)}
              style={{ cursor: "pointer" }}
            />
            <label
              className="form-check-label flex-grow-1"
              htmlFor={`task-${task.id}`}
              style={{ cursor: "pointer" }}
            >
              {task.taskDescription}
            </label>
          </li>
        ))}
        {tasks.length === 0 && (
          <li className="list-group-item text-muted text-center py-3">
            Chưa có công việc nào.
          </li>
        )}
      </ul>
    </div>
  );
};
