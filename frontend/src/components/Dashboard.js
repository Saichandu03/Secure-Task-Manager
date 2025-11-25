import React, { useEffect, useState } from "react";
import api from "../api";
import TaskForm from "./TaskForm";
import TaskModal from "./TaskModal";
import ConfirmModal from "./ConfirmModal";
import Loader from "./Loader";
import { useAuth } from "../AuthContext";

function TaskItem({ t, onDelete, onToggle, onEdit, isAdmin, currentUserId }) {
  const completed = !!t.completed;
  const createdAt = t.createdAt;
  const updatedAt = t.updatedAt;
  const fmt = (d) => {
    try {
      const dt = new Date(d || Date.now());
      const pad = (n) => String(n).padStart(2, "0");
      const day = pad(dt.getDate());
      const month = pad(dt.getMonth() + 1);
      const year = dt.getFullYear();
      const hours = pad(dt.getHours());
      const mins = pad(dt.getMinutes());
      const secs = pad(dt.getSeconds());
      return `${day}/${month}/${year}, ${hours}:${mins}:${secs}`;
    } catch (e) {
      return new Date(d || Date.now()).toLocaleString();
    }
  };
  let ownerLabel = "unknown";
  if (t.owner) {
    if (typeof t.owner === "string") ownerLabel = t.owner.slice(0, 8);
    else if (t.owner.name || t.owner.email)
      ownerLabel = t.owner.name || t.owner.email;
    else if (t.owner._id || t.owner.id)
      ownerLabel = String(t.owner._id || t.owner.id).slice(0, 8);
  }
  const oid =
    typeof t.owner === "string"
      ? t.owner
      : t.owner && (t.owner._id || t.owner.id || t.owner.id);
  const isOwner = !!(
    currentUserId &&
    oid &&
    String(oid) === String(currentUserId)
  );
  const showOwner = false; // owner display removed per requirements

  return (
    <div
      className={`list-group-item d-flex justify-content-between align-items-center ${
        completed ? "completed" : "pending"
      }`}
    >
      <div className="d-flex align-items-start gap-3">
        <button
          title={completed ? "Mark as incomplete" : "Mark as complete"}
          className={`status-dot btn p-0 mt-1 ${
            completed ? "status-complete" : "status-pending"
          }`}
          onClick={() => onToggle(t)}
          aria-label="Toggle complete"
        />
        <div>
          <div
            className={`fw-semibold ${
              completed ? "completed-title" : "pending-title"
            }`}
          >
            {t.title}
          </div>
          {t.description && (
            <div className="text-muted small">{t.description}</div>
          )}
          <div className="text-muted small">
            {/* timestamps on one line */}
            <div>
              <small className="text-muted">
                Created: {fmt(createdAt)}
                <span className="mx-2">•</span>
                Updated: {fmt(updatedAt || createdAt)}
              </small>
            </div>
            <div>
              <small className="text-muted">
                {isAdmin ? (
                  <>
                    {!isOwner && (
                      <>Created by: {t.createdBy ? (t.createdBy.name || t.createdBy.email) : ownerLabel}</>
                    )}
                    {t.updatedBy && t.createdBy && (String((t.updatedBy._id || t.updatedBy.id)) !== String((t.createdBy._id || t.createdBy.id))) && (
                      <span className="ms-2">• Updated by: {t.updatedBy.name || t.updatedBy.email}</span>
                    )}
                  </>
                ) : (
                  t.updatedBy && t.createdBy && (String((t.updatedBy._id || t.updatedBy.id)) !== String((t.createdBy._id || t.createdBy.id))) ? (
                    <>Updated by: {t.updatedBy.name || t.updatedBy.email}</>
                  ) : null
                )}
              </small>
            </div>
          </div>
        </div>
      </div>
      <div className="btn-group task-actions">
        {(isOwner || isAdmin) ? (
          <>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => onEdit(t)}
            >
              Edit
            </button>
            {isOwner ? (
              <button
                className="btn btn-sm btn-danger"
                onClick={() => onDelete(t)}
              >
                Delete
              </button>
            ) : (
              <span className="text-muted small ms-2">Admin edit</span>
            )}
          </>
        ) : (
          <span className="text-muted small">Read-only</span>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/tasks");
      setTasks(r.data.tasks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addOrRefresh = (createdTask) => {
    if (createdTask) {
      setTasks((prev) => [createdTask, ...(prev || [])]);
      return;
    }
    return load();
  };

  const [confirmTask, setConfirmTask] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const openConfirm = (task) => setConfirmTask(task);
  const closeConfirm = () => setConfirmTask(null);
  const handleConfirmDelete = async () => {
    if (!confirmTask) return closeConfirm();
    const id =
      (confirmTask && (confirmTask._id || confirmTask.id)) ||
      (typeof confirmTask === "string" ? confirmTask : null);
    if (!id) {
      console.warn("No id available for delete", confirmTask);
      return closeConfirm();
    }
    try {
      setDeleting(true);
      await api.delete(`/tasks/${id}`);
      // remove from state immediately
      setTasks((prev) => (prev || []).filter(t => String(t._id || t.id) !== String(id)));
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
      closeConfirm();
    }
  };

  const toggle = async (task) => {
    try {
      const r = await api.put(`/tasks/${task._id || task.id}`, {
        title: task.title,
        description: task.description,
        completed: !task.completed,
      });
      const updated = r && r.data && r.data.task ? r.data.task : null;
      if (updated) {
        setTasks(prev => (prev || []).map(t => (String(t._id || t.id) === String(updated._id || updated.id) ? updated : t)));
      } else {
        load();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const openEdit = (task) => setEditing(task);
  const closeEdit = () => setEditing(null);
  const saveEdit = async (updated) => {
    try {
      setSaving(true);
      const r = await api.put(`/tasks/${updated._id || updated.id}`, {
        title: updated.title,
        description: updated.description,
        completed: !!updated.completed,
      });
      const newTask = r && r.data && r.data.task ? r.data.task : null;
      if (newTask) {
        setTasks(prev => (prev || []).map(t => (String(t._id || t.id) === String(newTask._id || newTask.id) ? newTask : t)));
      } else {
        // fallback
        await load();
      }
      closeEdit();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const pending = total - done;
  const showAdminOwner = user && user.role === "admin";

  const currentUserId = user && (user._id || user.id);
  const tasksForCounts = tasks.filter((t) => {
    const oid =
      typeof t.owner === "string"
        ? t.owner
        : t.owner && (t.owner._id || t.owner.id);
    return currentUserId && oid && String(oid) === String(currentUserId);
  });
  const totalOwned = tasksForCounts.length;
  const doneOwned = tasksForCounts.filter((t) => t.completed).length;
  const pendingOwned = totalOwned - doneOwned;

  let visibleTasks = [];
  if (activeTab === "all" && showAdminOwner) {
    visibleTasks = tasks.filter(t => !(t.owner && (t.owner.role === 'admin')));
  } else {
    visibleTasks = tasks.filter((t) => {
      const oid =
        typeof t.owner === "string"
          ? t.owner
          : t.owner && (t.owner._id || t.owner.id);
      const isMine =
        currentUserId && oid && String(oid) === String(currentUserId);
      return (
        isMine && (activeTab === "completed" ? !!t.completed : !t.completed)
      );
    });
  }

  return (
    <div className="row gy-3">
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3 className="mb-0">Dashboard</h3>
          <div className="text-end text-muted">
            Tasks: <strong>{totalOwned}</strong> • Completed:{" "}
            <strong>{doneOwned}</strong>
          </div>
        </div>
      </div>

      <div className="col-md-7">
        <div className="card p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Tasks</h5>
            <div>
              <div className="btn-group" role="tablist" aria-label="Task tabs">
                <button
                  className={`btn btn-sm ${
                    activeTab === "pending"
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => setActiveTab("pending")}
                >
                  Pending{" "}
                  <span className="badge bg-light text-dark ms-2">
                    {pendingOwned}
                  </span>
                </button>
                <button
                  className={`btn btn-sm ${
                    activeTab === "completed"
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => setActiveTab("completed")}
                >
                  Completed{" "}
                  <span className="badge bg-light text-dark ms-2">{doneOwned}</span>
                </button>
                {showAdminOwner && (
                  <button
                    className={`btn btn-sm ${
                      activeTab === "all"
                        ? "btn-primary"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => setActiveTab("all")}
                  >
                    All Users
                  </button>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <Loader text="Loading tasks…" />
          ) : (
            <div className="list-group">
              {visibleTasks.length === 0 && (
                <div className="empty-state text-center py-4">
                  <div className="mb-3 display-6 text-muted">🗒️</div>
                  <div className="h6">No {activeTab} tasks</div>
                  <div className="text-muted small">
                    Create a task using the form on the right.
                  </div>
                </div>
              )}
              {visibleTasks.map((t) => (
                <TaskItem
                  key={t._id || t.id}
                  t={t}
                  onDelete={openConfirm}
                  onToggle={toggle}
                  onEdit={openEdit}
                  isAdmin={showAdminOwner}
                  currentUserId={user && (user._id || user.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="col-md-5">
        <div className="card p-3">
          <h5 className="mb-3">Create a task</h5>
          <TaskForm onAdded={addOrRefresh} />
        </div>
      </div>
      {editing && (
        <TaskModal
          show={!!editing}
          task={editing}
          onClose={closeEdit}
          onSave={saveEdit}
          saving={saving}
        />
      )}

      <ConfirmModal
        show={!!confirmTask}
        title="Delete task"
        message={
          confirmTask
            ? `Are you sure you want to delete "${confirmTask.title}"? This cannot be undone.`
            : ""
        }
        onCancel={closeConfirm}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        confirmText="Delete"
      />
    </div>
  );
}
