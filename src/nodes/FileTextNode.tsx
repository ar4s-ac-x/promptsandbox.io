import { memo, FC, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import useUndo from 'use-undo';
import { shallow } from 'zustand/shallow';

import InputNodesList from './templates/InputNodesList';
import NodeTemplate from './templates/NodeTemplate';
import { FileTextDataType } from './types/NodeTypes';
import { db } from '../backgroundTasks/dexieDb/db';
import useStore, { selector } from '../store/useStore';

const FileText: FC<NodeProps<FileTextDataType>> = (props) => {
	const { data, selected, id, type } = props;
	const [textState, { set: setText }] = useUndo(data.text);
	const { present: presentText } = textState;

	const [showPrompt, setshowPrompt] = useState(true);
	const [showFullScreen, setShowFullScreen] = useState(false);
	const { documents } = useStore(selector, shallow);

	return (
		<div className="">
			<div
				style={{
					width: '35rem',
				}}
				className={`m-3 bg-slate-100 shadow-lg border-2  ${
					selected ? 'border-sky-600' : 'border-slate-400'
				} flex flex-col `}
			>
				<NodeTemplate
					{...props}
					title="File Text"
					fieldName="File"
					bgColor="bg-sky-400"
					show={showPrompt}
					setShow={setshowPrompt}
					showFullScreen={showFullScreen}
					setShowFullScreen={setShowFullScreen}
				>
					{(updateNode: (id: string, data: FileTextDataType) => void) => (
						<>
							<div className="py-1">
								<select
									id="model"
									name="fileId"
									className="block w-full rounded-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-2xl sm:leading-6"
									value={data.fileName}
									onChange={async (e) => {
										const selectedFile = e.target.selectedOptions[0].value;
										const document = await db.DocumentMetadata.filter((doc) => {
											return doc.name === selectedFile;
										}).first();
										updateNode(id, {
											...data,
											response: document?.content || '',
											fileName: document?.name || '',
										});
									}}
								>
									{documents?.map((document) => (
										<option key={document.id} value={document.name || ''}>
											{document.name}
										</option>
									))}
								</select>
							</div>
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
				id="filetext-input"
				className="w-4 h-4"
			></Handle>
			<Handle
				type="source"
				position={Position.Right}
				id="filetext-output"
				className="w-4 h-4"
			/>
		</div>
	);
};

export default memo(FileText);
