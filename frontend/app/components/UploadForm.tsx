/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

interface UploadFormProps {
	onSubmit: (jobDescription: string, resume: File) => void;
	isLoading: boolean;
}

const MAX_CHARS = 5000;

export default function UploadForm({ onSubmit, isLoading }: UploadFormProps) {
	const [jobDescription, setJobDescription] = useState("");
	const [resume, setResume] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [errors, setErrors] = useState<{ job?: string; resume?: string }>({});

	const fileInputRef = useRef<HTMLInputElement>(null);

	// --- File handling ---
	function handleFile(file: File) {
		if (file.type !== "application/pdf") {
			setErrors((prev) => ({
				...prev,
				resume: "Only PDF files are accepted.",
			}));
			return;
		}
		setResume(file);
		setErrors((prev) => ({ ...prev, resume: undefined }));
	}

	function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) handleFile(file);
	}

	function handleDragOver(e: DragEvent<HTMLDivElement>) {
		e.preventDefault();
		setIsDragging(true);
	}

	function handleDragLeave(e: DragEvent<HTMLDivElement>) {
		e.preventDefault();
		setIsDragging(false);
	}

	function handleDrop(e: DragEvent<HTMLDivElement>) {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files?.[0];
		if (file) handleFile(file);
	}

	// --- Form submission ---
	function handleSubmit() {
		const newErrors: { job?: string; resume?: string } = {};

		if (!jobDescription.trim()) {
			newErrors.job = "Please paste a job description before analyzing.";
		}
		if (!resume) {
			newErrors.resume = "Please upload your resume before analyzing.";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		onSubmit(jobDescription, resume!);
	}

	// --- Helpers ---
	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	const charCount = jobDescription.length;
	const isOverLimit = charCount > MAX_CHARS;

	return (
		<div className="w-full max-w-xl bg-[#201f1f] border-3 border-[#2A2D35] rounded-sm p-4 flex flex-col gap-6 font-mono">
			{/* ── Header ── */}
			<div className="flex flex-col gap-3">
				<span className="text-[11px] font-medium tracking-widest text-slate-400 uppercase">
					// ANALYZE YOUR APPLICATION
				</span>
				<div className="h-px w-full bg-[#2A2D35]" />
			</div>

			{/* ── Job Description Field ── */}
			<div className="flex flex-col gap-2">
				<label
					htmlFor="job-description"
					className="text-xs font-medium text-slate-100 tracking-wide"
				>
					Target Job Description
				</label>

				<textarea
					id="job-description"
					placeholder="Paste the full job description here..."
					value={jobDescription}
					onChange={(e) => {
						setJobDescription(e.target.value);
						if (errors.job) setErrors((prev) => ({ ...prev, job: undefined }));
					}}
					disabled={isLoading}
					rows={8}
					className={`
            w-full bg-[#0D0D0D] border-3 rounded-sm px-3.5 py-3.5
            text-slate-400 font-mono text-[13px] leading-relaxed
            placeholder:text-slate-600 resize-y min-h-[160px]
            outline-none transition-colors duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
							errors.job
								? "border-amber-500 focus:border-amber-500"
								: "border-[#2A2D35] focus:border-indigo-500"
						}
          `}
				/>

				<div className="flex justify-between items-center">
					{errors.job ? (
						<span className="text-[11px] text-amber-500">⚠ {errors.job}</span>
					) : (
						<span />
					)}
					<span
						className={`text-[11px] ${isOverLimit ? "text-amber-500" : "text-slate-600"}`}
					>
						{charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
					</span>
				</div>
			</div>

			{/* ── Resume Upload Field ── */}
			<div className="flex flex-col gap-2">
				<label className="text-xs font-medium text-slate-100 tracking-wide">
					Your Resume (PDF)
				</label>

				<input
					ref={fileInputRef}
					type="file"
					accept=".pdf,application/pdf"
					onChange={handleFileInput}
					className="hidden"
				/>

				{resume ? (
					// File selected state
					<div className="flex items-center justify-between bg-emerald-500/[0.06] border-3 border-emerald-500/25 rounded-sm px-4 py-3">
						<div className="flex items-center gap-3">
							<FileIcon />
							<div>
								<p className="text-[12px] font-medium text-emerald-400 font-mono">
									{resume.name}
								</p>
								<p className="text-[11px] text-slate-600 mt-0.5 font-mono">
									{formatFileSize(resume.size)}
								</p>
							</div>
						</div>
						<button
							onClick={() => setResume(null)}
							disabled={isLoading}
							className="text-slate-600 hover:text-amber-500 text-xs px-1.5 py-1 rounded transition-colors duration-150 disabled:cursor-not-allowed font-mono"
							aria-label="Remove file"
						>
							✕
						</button>
					</div>
				) : (
					// Drop zone
					<div
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onClick={() => !isLoading && fileInputRef.current?.click()}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ")
								fileInputRef.current?.click();
						}}
						role="button"
						tabIndex={0}
						aria-label="Upload resume PDF"
						className={`
              flex flex-col items-center gap-1.5 py-8 px-5
              border-[3px] border-dashed rounded-sm cursor-pointer
              transition-all duration-150 outline-none
              focus-visible:ring-2 focus-visible:ring-indigo-500
              focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1D24]
              ${
								isDragging
									? "border-indigo-500 bg-indigo-500/[0.08] shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
									: errors.resume
										? "border-amber-500 hover:border-amber-400"
										: "border-[#2A2D35] hover:border-indigo-500 hover:bg-indigo-500/[0.04]"
							}
            `}
					>
						<UploadIcon isDragging={isDragging} />
						<p className="text-[13px] text-slate-400 mt-1 font-mono">
							Drop your PDF here
						</p>
						<p className="text-[12px] text-slate-600 font-mono">
							or click to browse
						</p>
					</div>
				)}

				{errors.resume && (
					<p className="text-[11px] text-amber-500 mt-0.5">⚠ {errors.resume}</p>
				)}
			</div>

			{/* ── Submit Button ── */}
			<button
				onClick={handleSubmit}
				disabled={isLoading || isOverLimit}
				className="
          relative w-full overflow-hidden
          bg-indigo-500 hover:bg-indigo-400
          text-white font-mono text-sm font-medium tracking-wider
          py-3.5 px-5 rounded-sm
          transition-all duration-150
          hover:shadow-[0_0_20px_rgba(99,102,241,0.35)]
          disabled:opacity-60 disabled:cursor-not-allowed
          group
        "
			>
				{/* Shimmer sweep */}
				<span
					className="
            absolute inset-y-0 left-[-100%] w-[60%]
            bg-gradient-to-r from-transparent via-white/[0.08] to-transparent
            group-hover:left-[150%] transition-all duration-[400ms] ease-in-out
          "
					aria-hidden="true"
				/>

				<span className="relative flex items-center justify-center gap-2">
					{isLoading ? (
						<>
							<span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse" />
							<span>Analyzing</span>
							<AnimatedEllipsis />
						</>
					) : (
						"> Run Analysis"
					)}
				</span>
			</button>
		</div>
	);
}

// ── Sub-components ──

function UploadIcon({ isDragging }: { isDragging: boolean }) {
	return (
		<svg
			width="32"
			height="32"
			viewBox="0 0 24 24"
			fill="none"
			stroke={isDragging ? "#6366f1" : "#475569"}
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="transition-colors duration-150"
		>
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
			<polyline points="14 2 14 8 20 8" />
			<line x1="12" y1="18" x2="12" y2="12" />
			<polyline points="9 15 12 12 15 15" />
		</svg>
	);
}

function FileIcon() {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#10b981"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
			<polyline points="14 2 14 8 20 8" />
			<polyline points="9 12 11 14 15 10" />
		</svg>
	);
}

function AnimatedEllipsis() {
	const [dots, setDots] = useState(".");

	// useEffect would be cleaner here but useState's initializer
	// runs once — we use a ref-based interval instead
	const initialized = useRef(false);
	const [, forceUpdate] = useState(0);
	const dotsRef = useRef(".");

	if (!initialized.current) {
		initialized.current = true;
		if (typeof window !== "undefined") {
			setInterval(() => {
				dotsRef.current =
					dotsRef.current === "..." ? "." : dotsRef.current + ".";
				forceUpdate((n) => n + 1);
			}, 400);
		}
	}

	return <span aria-hidden="true">{dotsRef.current}</span>;
}
