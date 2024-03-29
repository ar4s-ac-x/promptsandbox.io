import { memo, FC, useState } from 'react';
import { NodeProps } from 'reactflow';
import useUndo from 'use-undo';
import { shallow } from 'zustand/shallow';

import NodeTemplate from './templates/NodeTemplate';
import { GlobalVariableDataType } from './types/NodeTypes';
import useStore, { selector } from '../store/useStore';
import { conditionalClassNames } from '../utils/classNames';
import { handleChange } from '../utils/handleFormChange';

const GlobalVariable: FC<NodeProps<GlobalVariableDataType>> = (props) => {
	const { data, selected, id, type } = props;
	const [responseState, { set: setResponse }] = useUndo(data.text);
	const { present: presentResponse } = responseState;

	const [name, { set: setName }] = useUndo(data.name);
	const { present: presentName } = name;

	const { updateNode, globalVariables, setGlobalVariables } = useStore(selector, shallow);

	const [showFullScreen, setShowFullScreen] = useState(false);

	return (
		<div className="">
			<div
				className={conditionalClassNames(
					data.isDetailMode && 'h-[40rem] w-[35rem]',
					`m-3 shadow-lg`,
				)}
			>
				<NodeTemplate
					{...props}
					title="Global Variable"
					fieldName="Name"
					color="slate"
					showFullScreen={showFullScreen}
					setShowFullScreen={setShowFullScreen}
					type={type}
					selected={selected}
				>
					{() => (
						<>
							<input
								type="name"
								name="name"
								className="nodrag block h-16 w-full rounded-md border-0 text-slate-900 shadow-sm ring-inset ring-slate-300 placeholder:text-slate-400 ring-2 focus:ring-inset focus:ring-slate-600 sm:py-1.5 sm:text-xl sm:leading-6"
								value={presentName}
								onChange={(e) => {
									setName(e.target.value);
									updateNode(id, {
										...data,
										name: e.target.value,
									});
									const newGlobalVariables = { ...globalVariables };
									newGlobalVariables[id] = e.target.value;
									setGlobalVariables(newGlobalVariables);
								}}
							/>
							<label
								htmlFor="response"
								className="block font-medium leading-6 text-2xl"
							>
								Initial Value:
							</label>
							<textarea
								rows={4}
								name="text"
								id={`text-${id}`}
								className="nowheel nodrag text-2xl flex-grow w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-1 focus:ring-inset focus:ring-slate-400 sm:leading-10"
								value={presentResponse}
								onFocus={(e) => {
									e.target.selectionStart = 0;
									e.target.selectionEnd = 0;
								}}
								onChange={(e) => {
									setResponse(e.target.value);
									handleChange(e, id, data, updateNode);
								}}
							/>
						</>
					)}
				</NodeTemplate>
			</div>
		</div>
	);
};

export default memo(GlobalVariable);
