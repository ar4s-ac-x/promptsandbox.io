import { Disclosure } from '@headlessui/react';
import { SignalIcon } from '@heroicons/react/20/solid';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { memo, FC, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import useUndo from 'use-undo';
import { shallow } from 'zustand/shallow';

import InputNodesList from './templates/InputNodesList';
import NodeTemplate from './templates/NodeTemplate';
import RunnableToolbarTemplate from './templates/RunnableToolbarTemplate';
import TextAreaTemplate from './templates/TextAreaTemplate';
import { LLMPromptNodeDataType } from './types/NodeTypes';
import useStore, { selector } from '../store/useStore';
import { conditionalClassNames } from '../utils/classNames';

const LLMPrompt: FC<NodeProps<LLMPromptNodeDataType>> = (props) => {
	const { data, selected, id, type } = props;
	const [textState, { set: setText }] = useUndo(data.text);
	const { present: presentText } = textState;

	const { updateNode } = useStore(selector, shallow);

	const [showFullScreen, setShowFullScreen] = useState(false);

	// TODO: Fullscreen button to edit prompts with a larger display
	return (
		<>
			<div
				className={conditionalClassNames(
					data.isDetailMode && 'h-[40rem] w-[35rem]',
					`m-3 shadow-lg`,
				)}
			>
				{RunnableToolbarTemplate(data, selected, updateNode, id)}
				{/* how to spread  */}
				<NodeTemplate
					{...props}
					title="LLM"
					fieldName="Prompt"
					showFullScreen={showFullScreen}
					setShowFullScreen={setShowFullScreen}
					selected={selected}
					color="amber"
				>
					{(updateNode: (id: string, data: LLMPromptNodeDataType) => void) => (
						<>
							<TextAreaTemplate
								{...props}
								presentText={presentText}
								setText={setText}
							/>
							<div className="flex flex-col gap-2 text-md ">
								<InputNodesList
									data={data}
									id={id}
									setText={setText}
									updateNode={updateNode}
									type={type}
								/>
							</div>
						</>
					)}
				</NodeTemplate>
			</div>
			<Disclosure
				as="div"
				style={{
					width: '35rem',
				}}
				className={conditionalClassNames(
					!data.isDetailMode && '-right-1/2',
					'space-y-1 absolute w-full',
				)}
				defaultOpen={data.response.length > 0}
			>
				{({ open }) => (
					<div className="mx-3">
						<Disclosure.Button
							className={conditionalClassNames(
								open ? 'border-b-slate-300' : '',
								'flex justify-between border-1 border-slate-400 bg-slate-200 text-slate-900 group px-2 w-full items-center rounded-t-md py-2 pr-2 text-left text-md font-semibold',
							)}
							disabled={data.response.length === 0}
						>
							<p className="flex gap-1 items-center pl-2">
								<SignalIcon
									className={conditionalClassNames(
										data.response.length > 0
											? 'text-green-500'
											: 'text-slate-400',
										' -ml-1 mr-1 h-7 w-7 flex-shrink-0',
									)}
									aria-hidden="true"
								/>
								<span
									className={conditionalClassNames(
										data.response.length === 0 && 'text-slate-400',
									)}
								>
									Current results:
								</span>
							</p>

							{/* expand svg */}
							{data.response.length > 0 && (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
									className={conditionalClassNames(
										open ? 'transform rotate-180' : '',
										'h-6 w-6',
									)}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M4.5 15.75l7.5-7.5 7.5 7.5"
									/>
								</svg>
							)}
						</Disclosure.Button>
						<Disclosure.Panel className="space-y-1 mb-10">
							<div
								className="p-3 bg-slate-50 border-1 border-t-0 
							border-slate-400 rounded-b-lg flex flex-col justify-between gap-4 items-end"
							>
								<p>{data.response}</p>
								<ClipboardIcon
									className={conditionalClassNames(
										' -ml-1 mr-1 h-7 w-7 flex-shrink-0 cursor-pointer text-slate-500 hover:text-slate-900 active:scale-50',
									)}
									aria-hidden="true"
									onClick={() => {
										navigator.clipboard.writeText(data.response);
									}}
								/>
							</div>
						</Disclosure.Panel>
					</div>
				)}
			</Disclosure>
			<Handle
				type="target"
				position={Position.Left}
				id="text-input"
				className="w-4 h-4"
			></Handle>
			<Handle type="source" position={Position.Right} id="text-output" className="w-4 h-4" />
		</>
	);
};

export default memo(LLMPrompt);
