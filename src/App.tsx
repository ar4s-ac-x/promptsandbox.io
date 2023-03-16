import ReactFlow, {
	MiniMap,
	Controls,
	Background,
	BackgroundVariant,
	Panel,
	MarkerType,
} from 'reactflow';

import 'reactflow/dist/base.css';

import { ChevronDoubleRightIcon, ChevronDoubleLeftIcon } from '@heroicons/react/20/solid';

import { shallow } from 'zustand/shallow';

import useStore, { selector } from './store/useStore';

import LeftSidePanel from './windows/LeftSidePanel';
import SettingsPanel from './windows/SettingsPanel/panel';
import LLMPromptNode from './nodes/LLMPromptNode';
import TextInputNode from './nodes/TextInputNode';
import ConnectionLine from './connection/ConnectionLine';
import { useEffect, useState } from 'react';

const nodeTypes = { llmPrompt: LLMPromptNode, textInput: TextInputNode };

export default function App() {
	const {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		onConnect,
		onAdd,
		onNodeDragStop,
		onEdgesDelete,
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
					width: '15vw',
				}}
				// make absolute and place in left side of screen
				className="absolute z-10 flex"
			>
				{nodeView && <LeftSidePanel onAdd={onAdd} />}
				<div
					style={{
						height: '30px',
						width: '20px',
					}}
					className="m-0 cursor-pointer shadow-lg bg-slate-200 border-b-1 border-r-1 border-slate-300"
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
							className={'text-slate-800 group-hover:text-gray-500 h-full mx-auto'}
							aria-hidden="true"
						/>
					) : (
						<ChevronDoubleLeftIcon
							style={{
								height: '30px',
								width: '20px',
							}}
							className={'text-slate-800 group-hover:text-gray-500 h-full mx-auto'}
							aria-hidden="true"
						/>
					)}
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
				<div style={{}}>
					<ReactFlow
						nodes={nodes}
						edges={edges}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={onConnect}
						nodeTypes={nodeTypes}
						connectionLineComponent={ConnectionLine}
						onNodeDragStart={onNodeDragStop}
						onNodeClick={onNodeDragStop}
						onEdgesDelete={onEdgesDelete}
						defaultEdgeOptions={{
							type: 'smoothstep',
							animated: true,
							style: {
								strokeWidth: 2,
								// stroke: '#FF0072',
								stroke: '#002',
							},
							markerEnd: {
								type: MarkerType.ArrowClosed,
								width: 25,
								height: 25,
								// color: "#FF0072",
								color: '#002',
							},
						}}
					>
						<Controls
							// shift right enough to not be overlapped by LeftSidePanel
							style={{
								marginLeft: `${nodeView ? '15vw' : '1vw'}`,
							}}
						/>
						<MiniMap
						// shift left enough to not be overlapped by SettingsPanel
						/>
						<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
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
										'text-slate-800 group-hover:text-gray-500 h-full mx-auto'
									}
									aria-hidden="true"
								/>
							) : (
								<ChevronDoubleRightIcon
									style={{
										height: '30px',
										width: '20px',
									}}
									className={' group-hover:text-gray-500 h-full mx-auto'}
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
							className="absolute left-0 top-0 bottom-0 bg-blue-200 cursor-col-resize opacity-0 hover:opacity-80 transition-opacity duration-300"
							style={{
								width: '4px',
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
