"use client";

import { useState } from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { PiStarFourFill } from "react-icons/pi";
import UploadForm from "./components/UploadForm";
import LoadingScreen from "./components/LoadingScreen";
import ResultScreen from "./components/ResultScreen";

export default function Home() {
	const [isLoading, setIsLoading] = useState(false);
	const [data, setData] = useState(null);

	async function handleSubmit(jobDescription: string, resume: File) {
		setIsLoading(true);
		const formData = new FormData();
		formData.append("job_description", jobDescription);
		formData.append("resume", resume);

		const res = await fetch("http://localhost:8000/analyze", {
			method: "POST",
			body: formData,
		});
		const data = await res.json();
		setIsLoading(false);
		setData(data);
		// pass data to your ResultPanel
	}

	const init = () => {
		setIsLoading(false);
		setData(null);
	};

	if (isLoading) {
		return <LoadingScreen />;
	}

	if (data) {
		return <ResultScreen data={data} onReset={init} />;
	}

	return (
		<div className="flex w-full flex-wrap bg-gradient-to-br from-[#121120] via-[#000000] to-[#121120]  h-screen flex-1">
			<div className="flex-1 flex gap-6 min-w-[300px] flex-col h-auto border-r border-[#1A1D24]  p-6">
				<header>
					<h1 className="text-3xl">Apply Flow</h1>
				</header>
				<div className="flex flex-col gap-4 items-left justify-center flex-1">
					<p className="flex items-center gap-2 text-xs text-slate-400">
						<span>
							<MdOutlineKeyboardArrowRight />
						</span>{" "}
						your resume. their job. perfect match.
					</p>
					<p className="flex items-center gap-2 text-xs text-white">
						<span className="text-indigo-500">
							<PiStarFourFill />
						</span>
						Deep semantic analysis of job descriptions.
					</p>
					<p className="flex items-center gap-2 text-xs text-white">
						<span className="text-indigo-500">
							<PiStarFourFill />
						</span>
						Precision gap identification in your experience.
					</p>
					<p className="flex items-center gap-2 text-xs text-white">
						<span className="text-indigo-500">
							<PiStarFourFill />
						</span>
						Tailored optimization strategies for high-stakes roles.
					</p>
				</div>
				<div className="text-sm text-muted-foreground">Powered by AI.</div>
			</div>
			<div className="flex-1 min-w-[300px] flex h-auto  items-center justify-center p-6 ">
				<UploadForm onSubmit={handleSubmit} isLoading={isLoading} />
			</div>
		</div>
	);
}
