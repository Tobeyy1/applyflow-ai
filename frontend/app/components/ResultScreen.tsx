/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

import { AnalyzeResponse } from "@/types";
import React from "react";
import { BsStars } from "react-icons/bs";
import { GoDotFill } from "react-icons/go";
import {
	HiArrowLongLeft,
	HiArrowLongRight,
	HiOutlineCheckCircle,
} from "react-icons/hi2";
import { IoWarningOutline } from "react-icons/io5";
import { LuSearchCheck } from "react-icons/lu";
import {
	MdOutlineKeyboardArrowRight,
	MdOutlineTextSnippet,
} from "react-icons/md";
import { RxCopy } from "react-icons/rx";

type Props = {
	data: AnalyzeResponse;
	onReset: () => void;
};

const ResultScreen = ({ data, onReset }: Props) => {
	const [isCopied, setIsCopied] = React.useState(false);
	const onCopy = async () => {
		try {
			await navigator.clipboard.writeText(data.cover_letter.content);
			setIsCopied(true);
			console.log("Copied!");
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};
	return (
		<div className="flex flex-col w-full bg-gradient-to-br from-[#121120] via-[#000000] to-[#121120] min-h-screen">
			<header className="flex items-center justify-between border-b-3 px-6 py-4 border-zinc-800">
				<h1 className="text-xl font-bold">ApplyFlow</h1>
				<button
					className="border border-zinc-800 rounded-xs flex gap-4 items-center text-xs px-4 py-2 cursor-pointer rounded hover:border-indigo-500 hover:text-indigo-500 transition-colors duration-250"
					onClick={onReset}
				>
					<span>
						<HiArrowLongLeft />
					</span>
					New Analysis
				</button>
			</header>
			<div className="flex flex-col p-6 flex-1 gap-6">
				<div className="flex flex-wrap items-center border-2 border-zinc-800 rounded-xs w-full gap-[10%] bg-[#1C1B1B] p-4">
					<h2 className="text-5xl flex items-center gap-2 ">
						{data.gap_analysis.match_score}%
						<div className="flex flex-col text-[10px] gap-1 justify-center flex-0 text-nowrap">
							<p>Match Score</p>
							<p>Analysis complete against target profile</p>
						</div>
					</h2>
					<div className="flex flex-col flex-1 gap-2 justify-center">
						<div className="flex items-center gap-2 flex-wrap">
							<div className="flex items-center gap px-[4px] py-[2px] text-[#10B981] border-2 border-[#10B981] text-[10px] rounded-xs text-nowrap">
								<span>
									<GoDotFill />
								</span>
								<p>{data.gap_analysis.strong_matches.length} Strong Matches</p>
							</div>
							<div className="flex items-center gap px-[4px] py-[2px] text-[#F59E0B] border-2 border-[#F59E0B] text-[10px] rounded-xs text-nowrap">
								<span>
									<GoDotFill />
								</span>
								<p>{data.gap_analysis.skill_gaps.length} Skill Gaps</p>
							</div>
							<div className="flex items-center gap px-[4px] py-[2px] text-indigo-500 border-2 border-indigo-500 text-[10px] rounded-xs text-nowrap">
								<span>
									<GoDotFill />
								</span>
								<p>
									{data.gap_analysis.experience_reframes.length} Experience
									Reframes
								</p>
							</div>
						</div>
						<div className="w-full h-[4px] bg-zinc-800 rounded">
							<div
								className={`h-full w-[${data.gap_analysis.match_score}%] bg-[#F59E0B] rounded`}
							/>
						</div>
					</div>
				</div>
				{/* //Cover letter and Gap Analysis  */}
				<div className="flex gap-4 flex-1 flex-wrap">
					{/* Cover Letter */}
					<div className="flex flex-1 min-w-[300px] flex-col bg-[#1C1B1B] p-4 rounded-xs border-2 border-zinc-800 gap-4">
						<h3 className="flex items-center justify-between border-b-2 border-zinc-800 pb-2 text-[10px] uppercase text-zinc-400">
							// Cover letter
							<span>
								<MdOutlineTextSnippet />
							</span>
						</h3>
						<p className="flex flex-1 text-sm flex-col text-[#fffff]">
							{data.cover_letter.content}
						</p>
						<button
							className="flex w-full py-2 uppercase gap-2 items-center justify-center text-[#ffffff] border-2 border-zinc-800 rounded text-[10px] cursor-pointer"
							onClick={onCopy}
						>
							<span>
								<RxCopy />
							</span>
							{isCopied ? "Copied!" : "Copy to Clipboard"}
						</button>
					</div>
					{/* Gap Analysis  */}
					<div className="flex flex-col p-4 flex-1 rounded-xs border-2 bg-[#1C1B1B] border-zinc-800 gap-4">
						<h3 className="flex items-center justify-between border-b-2 border-zinc-800 pb-2 text-[10px] uppercase text-zinc-400">
							// Gap Analysis
							<span>
								<LuSearchCheck />
							</span>
						</h3>
						<div className="flex flex-col text-[10px] text-zinc-400 ">
							<span className="uppercase">Summary</span>
							<p className=" pl-2 border-l-2 border-zinc-800 text-xs">
								{data.gap_analysis.summary}
							</p>
						</div>
						<div className="flex gap-4 flex-wrap w-full text-xs">
							{/* Strong Matches */}
							<div className="flex flex-col gap-2 flex-1">
								<h5 className="flex uppercase text-[10px] item-center gap-1">
									<span className="text-[#10B981]">
										<HiOutlineCheckCircle />
									</span>
									Strong Matches
								</h5>
								<div className="flex gap-2 flex-wrap">
									{data.gap_analysis.strong_matches.map(
										(match: string, index: number) => (
											<div
												key={index}
												className="py-[2px] px-2 border-2 border-[#10B981] text-[#10B981] rounded text-nowrap"
											>
												{match}
											</div>
										),
									)}
								</div>
							</div>
							{/* Skill Gaps */}
							<div className="flex flex-col gap-2 flex-1">
								<h5 className="flex uppercase text-[10px] item-center gap-2">
									<span className="text-[#F59E0B]">
										<IoWarningOutline />
									</span>
									Skill Gaps
								</h5>
								<div className="flex gap-2 flex-wrap">
									{data.gap_analysis.skill_gaps.map(
										(gap: string, index: number) => (
											<div
												key={index}
												className="py-[2px] px-2 border-2 border-[#F59E0B] text-[#F59E0B] rounded text-nowrap"
											>
												{gap}
											</div>
										),
									)}
								</div>
							</div>
						</div>

						{/* Experience Reframes */}
						<div className="flex flex-col gap-4 border-t-2 pt-4 border-zinc-800 w-full">
							<h5 className="uppercase gap-2 flex text-xs text-zinc-400 items-center">
								<span className="text-[#10B981]">
									<BsStars />
								</span>
								Experience reframes
							</h5>

							{data.gap_analysis.experience_reframes.map(
								(
									reframe: {
										current_experience: string;
										better_positioning: string;
									},
									index: number,
								) => (
									<div
										key={index}
										className="flex flex-col border border-zinc-800 border-l-3 border-l-indigo-500 bg-[#000000] rounded-sm  text-xs p-2"
									>
										<div className="flex items-center  gap-2">
											<span>
												<MdOutlineKeyboardArrowRight />
											</span>
											<p>{reframe.current_experience}</p>
										</div>
										<div className="flex items-center pl-4 text-indigo-500 gap-2">
											<span>
												<HiArrowLongRight />
											</span>
											<p>{reframe.better_positioning}</p>
										</div>
									</div>
								),
							)}
						</div>
						{/* Next Steps */}
						<div className="flex flex-col gap-4 text-xs w-full">
							<h5 className="text-xs uppercase">Next Steps</h5>
							{data.gap_analysis.recommended_next_steps.map(
								(step: string, index: number) => (
									<div key={index} className="flex gap-2 items-center">
										<span className="text-indigo-500 ">
											{String(index + 1).padStart(2, "0")}.
										</span>
										<p className="text-[#ffffff]">{step}</p>
									</div>
								),
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ResultScreen;
