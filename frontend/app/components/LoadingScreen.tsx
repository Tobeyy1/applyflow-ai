import React from "react";
import { FaCheck } from "react-icons/fa6";
import { GoDotFill } from "react-icons/go";
import { LuInfo } from "react-icons/lu";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

// type Props = {}

const LoadingScreen = () => {
	return (
		<div className="flex w-[100vw] items-center justify-center bg-gradient-to-br from-[#121120] via-[#000000] to-[#121120]  h-screen flex-1">
			<div className="flex flex-col items-left justify-center p-6 gap-4 bg-zinc-900 border-3 border-zinc-800 rounded-sm">
				<div className="border-3 border-zinc-800 w-full max-w-[500px]">
					<div className="flex items-center text-gray-400 gap-2 border-zinc-800 border-b-3 text-xs p-1 ">
						<span className="flex gap items-center text-slate-500 ">
							<GoDotFill />
							<GoDotFill />
							<GoDotFill />
						</span>
						<p className="uppercase">ApplyFlow</p>
					</div>
					<div className="flex flex-col gap-4 text-gray-400 p-4">
						<div className="flex items-center w-full gap-2 text-xs">
							<span className="text-indigo-500">
								<MdOutlineKeyboardArrowRight />{" "}
							</span>
							<p className="flex-1 flex ">Reading resume ...</p>
							<span className="text-emerald-500">
								<FaCheck />
							</span>
						</div>
						<div className="flex items-center w-full gap-2 text-xs  ">
							<span className="text-indigo-500">
								<MdOutlineKeyboardArrowRight />{" "}
							</span>
							<p className="flex-1 flex ">Parsing job description ...</p>
							<span className="text-emerald-500">
								<FaCheck />
							</span>
						</div>
						<div className="flex items-center w-full gap-2 text-xs  ">
							<span className="text-indigo-500">
								<MdOutlineKeyboardArrowRight />{" "}
							</span>
							<p className="flex-1 flex ">Generating results ...</p>
							<span className="text-emerald-500">
								<GoDotFill />
							</span>
						</div>
					</div>
				</div>
				<div className="flex items-center text-gray-400 text-xs gap-2">
					<span>
						<LuInfo />
					</span>
					<p className="flex flex-1">This usually takes 15-30 seconds.</p>
					<p>[ PROCESSING ]</p>
				</div>
			</div>
		</div>
	);
};

export default LoadingScreen;
