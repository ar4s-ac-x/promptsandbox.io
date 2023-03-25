import ClassifyNode from '../nodes/ClassifyNode';
import ReactFlow, {
	MiniMap,
	Background,
	BackgroundVariant,
	Panel,
	MarkerType,
	ReactFlowInstance,
	Controls,
} from 'reactflow';

import 'reactflow/dist/base.css';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDoubleRightIcon, ChevronDoubleLeftIcon } from '@heroicons/react/20/solid';

import { shallow } from 'zustand/shallow';

import useStore, { selector } from '../store/useStore';

import LeftSidePanel from '../windows/LeftSidePanel';
import SettingsPanel from '../windows/SettingsPanel/panel';
import LLMPromptNode from '../nodes/LLMPromptNode';
import TextInputNode from '../nodes/TextInputNode';
import ConnectionLine from '../connection/ConnectionLine';
import Notification from '../components/Notification';
import { NodeTypesEnum } from '../nodes/types/NodeTypes';
import RunFromStart from '../components/RunFromStart';
import ChatPromptNode from '../nodes/ChatPromptNode';
import ChatMessageNode from '../nodes/ChatMessageNode';
import PlaceholderNode from '../nodes/PlaceholderNode';
import CustomEdge from '../edges/CustomEdgeType';
import ClassifyCategoriesNode from '../nodes/ClassifyCategoriesNode';

const nodeTypes = {
	classify: ClassifyNode,
	classifyCategories: ClassifyCategoriesNode,
	llmPrompt: LLMPromptNode,
	textInput: TextInputNode,
	chatPrompt: ChatPromptNode,
	chatMessage: ChatMessageNode,
	placeholder: PlaceholderNode,
};

const edgeTypes = {
	custom: CustomEdge,
};

export default function MainApp() {
	const {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		onConnect,
		onAdd,
		onNodeDragStop,
		onEdgesDelete,
		unlockGraph,
		reactFlowInstance,
		setReactFlowInstance,
	} = useStore(selector, shallow);

	const [settingsView, setSettingsView] = useState(true);
	const [nodeView, setNodeView] = useState(true);

	const [settingsPanelWidth, setSettingsPanelWidth] = useState(300); // Initial width

	const [isResizing, setIsResizing] = useState(false);

	const handleMouseDown = (e: any) => {
		e.preventDefault();
		setIsResizing(true);
	};

	const handleMouseUp = () => {
		setIsResizing(false);
	};

	useEffect(() => {
		const handleMouseMove = (e: any) => {
			if (!isResizing) return;
			const newWidth = window.innerWidth - e.clientX;
			setSettingsPanelWidth(newWidth);
		};

		if (isResizing) {
			window.addEventListener('mousemove', handleMouseMove);
			window.addEventListener('mouseup', handleMouseUp);
		} else {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		}

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isResizing]);

	const reactFlowWrapper = useRef<HTMLDivElement | null>(null);

	const handleDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			if (
				!(
					reactFlowWrapper &&
					reactFlowWrapper.current &&
					reactFlowInstance &&
					'project' in reactFlowInstance
				)
			) {
				return;
			}

			const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
			const type = event.dataTransfer.getData('application/reactflow');

			// check if the dropped element is valid
			if (typeof type === 'undefined' || !type) {
				return;
			}

			const position = reactFlowInstance.project({
				x: event.clientX - reactFlowBounds.left,
				y: event.clientY - reactFlowBounds.top,
			});

			let nodeTypeEnum = NodeTypesEnum.llmPrompt;
			if (type === 'llmPrompt') {
				nodeTypeEnum = NodeTypesEnum.llmPrompt;
			} else if (type === 'textInput') {
				nodeTypeEnum = NodeTypesEnum.textInput;
			} else if (type === 'chatPrompt') {
				nodeTypeEnum = NodeTypesEnum.chatPrompt;
			} else if (type === 'chatMessage') {
				nodeTypeEnum = NodeTypesEnum.chatMessage;
			} else if (type === 'classify') {
				nodeTypeEnum = NodeTypesEnum.classify;
			}

			onAdd(nodeTypeEnum, position);
		},
		[onAdd, reactFlowInstance],
	);

	const onInit = (reactFlowInstance: ReactFlowInstance) => {
		reactFlowInstance.fitView();
		setReactFlowInstance(reactFlowInstance);
	};

	return (
		<div
			style={{
				height: '100vh',
				width: '100vw',
			}}
			className="flex"
		>
			<div
				style={{
					height: '100vh',
					width: nodeView ? '15vw' : 0,
					maxWidth: '200px',
				}}
				className="absolute z-10 flex max-w-sm"
			>
				{nodeView && (
					<LeftSidePanel
						onAdd={onAdd}
						reactFlowWrapper={reactFlowWrapper}
						reactFlowInstance={reactFlowInstance}
					/>
				)}
				<div
					style={{
						height: '30px',
						width: '20px',
					}}
					className="m-0 cursor-pointer shadow-lg bg-slate-200 border-b-1 border-r-1 border-slate-300 flex gap-10 item-center"
				>
					<div
						className="grow"
						onClick={() => {
							setNodeView(!nodeView);
						}}
					>
						{nodeView ? (
							<ChevronDoubleRightIcon
								style={{
									height: '30px',
									width: '20px',
								}}
								className={
									'text-slate-800 group-hover:text-slate-500 h-full mx-auto'
								}
								aria-hidden="true"
							/>
						) : (
							<ChevronDoubleLeftIcon
								style={{
									height: '30px',
									width: '20px',
								}}
								className={
									'text-slate-800 group-hover:text-slate-500 h-full mx-auto'
								}
								aria-hidden="true"
							/>
						)}
					</div>
				</div>
			</div>

			<div
				className="grid grid-cols-2"
				style={{
					gridTemplateColumns: '1fr auto',
					height: '100vh',
					width: '100vw',
				}}
			>
				<div style={{}} ref={reactFlowWrapper}>
					<ReactFlow
						multiSelectionKeyCode="Shift"
						onDrop={handleDrop}
						nodesDraggable={unlockGraph}
						nodesConnectable={unlockGraph}
						nodesFocusable={unlockGraph}
						edgesFocusable={unlockGraph}
						elementsSelectable={unlockGraph}
						onInit={(reactFlowInstance: ReactFlowInstance) => onInit(reactFlowInstance)}
						onDragOver={(e) => e.preventDefault()}
						nodes={nodes}
						edges={edges}
						defaultViewport={{
							x: 0,
							y: 0,
							zoom: 0.3,
						}}
						minZoom={0.3}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={onConnect}
						nodeTypes={nodeTypes}
						edgeTypes={edgeTypes}
						connectionLineComponent={ConnectionLine}
						onNodeDragStart={onNodeDragStop}
						onNodeClick={onNodeDragStop}
						onEdgesDelete={onEdgesDelete}
						defaultEdgeOptions={{
							type: 'default',
							animated: true,
							style: {
								strokeWidth: 2,
								stroke: '#002',
							},
							markerEnd: {
								type: MarkerType.ArrowClosed,
								width: 25,
								height: 25,
								color: '#002',
							},
						}}
					>
						<Controls className="ml-52" />
						<MiniMap pannable={true} />
						<Background variant={BackgroundVariant.Lines} gap={12} size={1} />
						<Panel position="top-center" aria-label="graph-runner">
							<div className="flex gap-4">
								<RunFromStart />
							</div>
						</Panel>
						<Panel position="top-center">
							<Notification />
						</Panel>
						<Panel
							position="top-right"
							className="m-0 cursor-pointer shadow-lg bg-slate-200 border-b-1 border-l-1 border-slate-300"
							onClick={() => {
								setSettingsView(!settingsView);
							}}
						>
							{settingsView ? (
								<ChevronDoubleLeftIcon
									style={{
										height: '30px',
										width: '20px',
									}}
									className={
										'text-slate-800 group-hover:text-slate-500 h-full mx-auto'
									}
									aria-hidden="true"
								/>
							) : (
								<ChevronDoubleRightIcon
									style={{
										height: '30px',
										width: '20px',
									}}
									className={' group-hover:text-slate-500 h-full mx-auto'}
									aria-hidden="true"
								/>
							)}
						</Panel>
					</ReactFlow>
				</div>

				{settingsView ? (
					<div
						className=""
						style={{
							width: `${settingsPanelWidth}px`,
							position: 'relative',
						}}
					>
						<div
							// animate on hover to show that it's resizable
							className="absolute -left-2 top-0 bottom-0 bg-blue-200 cursor-col-resize opacity-0 hover:opacity-80 transition-opacity duration-300"
							style={{
								width: '10px',
							}}
							onMouseDown={handleMouseDown}
						/>
						<SettingsPanel />
					</div>
				) : (
					<div
						// animate on hover to show that it's resizable
						className="bg-slate-200 shadow-xl border-1 border-slate-300"
						style={{
							width: '10px',
							height: '100vh',
						}}
						onMouseDown={handleMouseDown}
					/>
				)}
			</div>
		</div>
	);
}