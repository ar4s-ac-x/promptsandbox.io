import { memo, FC, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import useUndo from 'use-undo';

import InputNodesList from './templates/InputNodesList';
import NodeTemplate from './templates/NodeTemplate';
import TextAreaTemplate from './templates/TextAreaTemplate';
import { ChatMessageNodeDataType } from './types/NodeTypes';
import { conditionalClassNames } from '../utils/classNames';

const ChatMessage: FC<NodeProps<ChatMessageNodeDataType>> = (props) => {
	const { data, selected, id, type } = props;
	const [
		textState,
		{
			set: setText,
			// reset: resetText,
			// undo: undoText,
			// redo: redoText,
			// canUndo, canRedo
		},
	] = useUndo(data.text);
	const { present: presentText } = textState;
	const [showFullScreen, setShowFullScreen] = useState(false);

	return (
		<>
			<div
				className={conditionalClassNames(
					data.isDetailMode && 'h-[40rem] w-[35rem]',
					`m-3 shadow-lg`,
				)}
			>
				{/* how to spread  */}
				<NodeTemplate
					{...props}
					title="Message"
					fieldName="Message"
					color="purple"
					showFullScreen={showFullScreen}
					setShowFullScreen={setShowFullScreen}
					selected={selected}
					labelComponent={(
						updateNode: (id: string, data: ChatMessageNodeDataType) => void,
					) => (
						<div className="font-medium leading-6 relative flex items-end p-1">
							<div
								className="bg-purple-300 rounded-lg  p-2 rounded-br-none text-2xl cursor-pointer text-slate-700 font-semibold hover:font-bold hover:text-yellow-100"
								onClick={() => {
									if (data.role === 'user') {
										updateNode(id, {
											...data,
											role: 'assistant',
										});
									} else if (data.role === 'assistant') {
										updateNode(id, {
											...data,
											role: 'system',
										});
									} else {
										updateNode(id, {
											...data,
											role: 'user',
										});
									}
								}}
							>
								{data.role}
							</div>
							<div>
								<div
									className="-ml-1"
									style={{
										width: '20px',
										height: '20px',
										background:
											'linear-gradient(to bottom left, rgb(0,0,0,0) 0%, rgb(0,0,0,0) 50%, rgb(216 180 254) 50%, rgb(216 180 254) 100%)',
										content: '',
									}}
								></div>
							</div>
						</div>
					)}
				>
					{(updateNode: (id: string, data: ChatMessageNodeDataType) => void) => (
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
			<Handle
				type="target"
				position={Position.Left}
				id="chat-message-input"
				className="w-4 h-4"
			></Handle>
			<Handle type="source" position={Position.Right} id="chat-message" className="w-4 h-4" />
		</>
	);
};

export default memo(ChatMessage);
