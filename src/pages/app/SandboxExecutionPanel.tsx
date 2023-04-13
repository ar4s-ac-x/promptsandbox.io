import { useState } from 'react';

import RunFromStart from '../../components/RunFromStart';
import { RFState } from '../../store/useStore';

function SandboxExecutionPanel({
	nodes,
	setNodes,
	setChatApp,
}: {
	nodes: RFState['nodes'];
	setNodes: RFState['setNodes'];
	setChatApp: RFState['setChatApp'];
}) {
	const [isLoading, setIsLoading] = useState(false);
	return (
		<div className="flex gap-4 items-center z-10">
			<RunFromStart isLoading={isLoading} setIsLoading={setIsLoading} />
			<button
				className="bg-red-100/50 hover:bg-red-200/50 border-2 border-red-500 text-red-800 text-md font-semibold py-1 h-full px-2  rounded flex items-center"
				onClick={() => {
					// Are you sure prompt
					if (window.confirm('Are you sure you want to clear the responses?')) {
						const clearedNodes = nodes.map((node) => {
							return {
								...node,
								data: {
									...node.data,
									response: '',
									isLoading: false,
								},
							};
						});
						setIsLoading(false);
						setNodes(clearedNodes);
						setChatApp([]);
					}
				}}
			>
				<span>Clear Run</span>
			</button>
		</div>
	);
}

export default SandboxExecutionPanel;