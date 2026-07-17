import React, { useState } from "react";
import { User, Task, TaskSubmission } from "../types";
import { ClipboardList, CheckCircle2, Clock, XCircle, ArrowUpRight, Upload, AlignLeft, AlertCircle, Link } from "lucide-react";

interface TasksViewProps {
  user: User;
  tasks: Task[];
  submissions: TaskSubmission[];
  onTaskSubmitted: (updatedUser: User, submission: TaskSubmission) => void;
}

export default function TasksView({ user, tasks, submissions, onTaskSubmitted }: TasksViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [textProof, setTextProof] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSubmissionForTask = (taskId: string) => {
    return submissions.find((s) => s.task_id === taskId);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setError(null);
    setIsSubmitting(true);

    let proofData = "";
    if (selectedTask.proof_type === "text") {
      if (!textProof.trim()) {
        setError("Please enter the required text proof.");
        setIsSubmitting(false);
        return;
      }
      proofData = textProof.trim();
    } else {
      if (!imagePreview) {
        setError("Please select or upload a proof screenshot.");
        setIsSubmitting(false);
        return;
      }
      proofData = imagePreview; // Sending Base64 data which is perfect for storage mock/Supabase
    }

    try {
      const res = await fetch("/api/tasks/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          taskId: selectedTask.id,
          proofData: proofData,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onTaskSubmitted(data.user, data.submission);
        // Reset state
        setTextProof("");
        setImageFile(null);
        setImagePreview(null);
        setSelectedTask(null);
      } else {
        setError(data.error || "Failed to submit task proof.");
      }
    } catch (err) {
      setError("Network connection issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTaskSubmission = (task: Task) => {
    setError(null);
    setSelectedTask(task);
    setTextProof("");
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div id="tasks-view-container" className="space-y-4 pb-6">
      {/* Top Banner stats */}
      <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex items-center justify-between shadow-xs">
        <div>
          <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Social Tasks Completed</h3>
          <h2 className="text-xl font-black mt-1">
            {submissions.filter((s) => s.status === "approved").length}{" "}
            <span className="text-xs text-slate-500 font-normal">Tasks Approved</span>
          </h2>
          <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
            Earn high commissions for join, follow, and review tasks
          </p>
        </div>
        <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 shrink-0">
          <ClipboardList className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Task Earning Pool</h3>
        {tasks.length === 0 ? (
          <div className="bg-slate-50 border border-slate-100 text-center py-10 rounded-xl text-slate-500 text-xs">
            No active tasks available. Reloading or try again later.
          </div>
        ) : (
          tasks.map((task) => {
            const submission = getSubmissionForTask(task.id);
            return (
              <div
                key={task.id}
                id={`task-card-${task.id}`}
                className={`bg-white border p-4 rounded-xl transition-all flex flex-col justify-between ${
                  submission?.status === "approved"
                    ? "border-emerald-100 bg-emerald-50/5"
                    : submission?.status === "pending"
                    ? "border-amber-100/60 bg-amber-50/5"
                    : submission?.status === "rejected"
                    ? "border-rose-100/60 bg-rose-50/5"
                    : "border-slate-100 hover:border-slate-200 shadow-xs"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-800 tracking-tight">{task.title}</h4>
                      {task.verify_method === "auto" && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                          Auto
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-normal line-clamp-2">{task.description}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3 font-mono">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Reward</span>
                    <span className="text-xs font-bold text-emerald-600">৳{task.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-1">
                  <div className="flex items-center space-x-2 text-[9px] text-slate-400 font-medium">
                    <span className="bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                      {task.proof_type === "image" ? "Screenshot" : "Text ID"}
                    </span>
                    <span>•</span>
                    <span>
                      {task.completed_count || 0}/{task.limit_count || 1000} Done
                    </span>
                  </div>

                  {/* Submission States */}
                  {submission?.status === "approved" && (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100/60 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approved</span>
                    </span>
                  )}

                  {submission?.status === "pending" && (
                    <span className="bg-amber-50 text-amber-700 border border-amber-100/60 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Reviewing</span>
                    </span>
                  )}

                  {submission?.status === "rejected" && (
                    <button
                      onClick={() => openTaskSubmission(task)}
                      className="bg-rose-50 hover:bg-rose-100/80 text-rose-700 border border-rose-100/60 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Redo Task</span>
                    </button>
                  )}

                  {!submission && (
                    <button
                      onClick={() => openTaskSubmission(task)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-colors"
                    >
                      <span>Complete</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {submission?.status === "rejected" && submission.rejection_reason && (
                  <div className="mt-3 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100/50 text-[10px] text-rose-800 font-medium leading-relaxed">
                    <span className="font-bold">Reason:</span> {submission.rejection_reason}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* SUBMIT PROOF DRAWER / MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-t-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-slide-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTask(null)}
              className="absolute right-4 top-4 bg-slate-100 hover:bg-slate-200 text-slate-500 p-1.5 rounded-full transition-all"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Earn ৳{selectedTask.amount.toFixed(2)}
                </span>
                {selectedTask.verify_method === "auto" && (
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Auto Reward
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">{selectedTask.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{selectedTask.description}</p>
            </div>

            {/* Instruction block */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <p className="font-bold text-slate-700">Follow steps carefully:</p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                <li>
                  Click the promotional link button below to launch the social platform.
                </li>
                <li>Complete the required action (Follow, Subscribe, Like, or Share).</li>
                <li>Take a screenshot or note the username you used for verification.</li>
              </ol>
            </div>

            {/* Link redirection button */}
            <a
              href={selectedTask.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-blue-50 text-blue-700 font-bold py-3.5 rounded-2xl hover:bg-blue-100 transition-all text-xs flex items-center justify-center space-x-2 border border-blue-200"
            >
              <Link className="w-4 h-4" />
              <span>Launch Official Campaign Link</span>
            </a>

            <form onSubmit={submitProof} className="space-y-4 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Submit Verification Proof</h4>

              {error && (
                <div className="bg-rose-50 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-rose-100">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {selectedTask.proof_type === "text" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center space-x-1">
                    <AlignLeft className="w-3.5 h-3.5" />
                    <span>Provide Username or Profile URL</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={textProof}
                    onChange={(e) => setTextProof(e.target.value)}
                    placeholder="e.g. @my_telegram_handle or My Youtube Account Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 transition-all"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center space-x-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Proof Screenshot</span>
                  </label>
                  <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 rounded-2xl p-4 transition-all text-center relative flex flex-col items-center justify-center min-h-[140px] cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      required={!imagePreview}
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {imagePreview ? (
                      <div className="relative w-full max-h-[180px] overflow-hidden rounded-xl">
                        <img src={imagePreview} alt="Screenshot proof" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 right-2 bg-black/75 text-white text-[9px] font-bold px-2 py-1 rounded">
                          Change Screen
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 py-2">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-600">Select Image Proof</p>
                        <p className="text-[10px] text-slate-400">JPEG, PNG, or WEBP up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md text-xs flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Proof...</span>
                  </>
                ) : (
                  <span>Submit Completion Verification</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
