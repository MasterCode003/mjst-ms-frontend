import React, { useEffect, useState } from 'react';
import { Eye, X } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import SearchBar from './SearchBar';
import { getManuscriptByStepStatus } from '../api/manuscript.api';
import moment from 'moment';

const StaffRejected: React.FC = () => {
	const { rejectedRecords } = useRecords();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
	const [selectedRecord, setSelectedRecord] = useState<any>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedYear, setSelectedYear] = useState<string>('all');

	// Generate year options from 2024 to 2100
	const yearOptions = Array.from({ length: 76 }, (_, i) =>
		(2024 + i).toString()
	);

	const handleViewComments = (record: any) => {
		setSelectedRecord(record);
		setIsCommentsModalOpen(true);
	};

	const [manuscripts, setManuscripts] = useState<any>([]);
	const [filteredManuscripts, setFilteredManuscripts] = useState([]);

	const filterRecords = () => {
		const filteredRecords = manuscripts.filter(
			(record: any) =>
				record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				record.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
				record.scopeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
				record.authors[0].toLowerCase().includes(searchTerm.toLowerCase()) ||
				record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
				record.fileCode.toLowerCase().includes(searchTerm.toLowerCase())
		);

		setFilteredManuscripts(filteredRecords);
	};

	const getManuscripts = async () => {
		setManuscripts([]);
		setSearchTerm('');
		if (selectedYear === 'all') {
			await getManuscriptByStepStatus('Rejected').then((res) =>
				setManuscripts(res.data)
			);
			return;
		}
		await getManuscriptByStepStatus('Rejected', Number(selectedYear)).then(
			(res) => setManuscripts(res.data)
		);
	};

	useEffect(() => {
		getManuscripts();
	}, [selectedYear]);

	useEffect(() => {
		filterRecords();
	}, [searchTerm]);

	return (
		<div className="staff-rejected-container">
			<div className="bg-white p-6 rounded-lg shadow-md">
				<h3 className="text-xl font-semibold mb-4">Rejected Records</h3>
				<div className="mb-6">
					<SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

					{/* Year Filter */}
					<div className="mt-4 p-4 bg-gray-50 rounded-lg">
						<div className="flex items-center">
							<label className="text-sm font-medium text-gray-700 mr-2">
								Filter by Year:
							</label>
							<select
								title="selectYear"
								value={selectedYear}
								onChange={(e) => setSelectedYear(e.target.value)}
								className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							>
								<option value="all">All Years</option>
								{yearOptions.map((year) => (
									<option key={year} value={year}>
										{year}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="min-w-full bg-white">
						<thead className="bg-gray-100">
							<tr>
								<th className="py-3 px-4 text-left">File Code</th>
								<th className="py-3 px-4 text-left">Journal/Research Title</th>
								<th className="py-3 px-4 text-left">Field/Scope</th>
								<th className="py-3 px-4 text-left">Date Rejected</th>
								<th className="py-3 px-4 text-left">Rejection Stage</th>
								<th className="py-3 px-4 text-left">Comments</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{searchTerm === ''
								? manuscripts.map((record: any, index: number) => (
										<tr key={index} className="hover:bg-gray-50">
											<td className="py-4 px-4">{record.fileCode}</td>
											<td className="py-4 px-4">{record.title}</td>
											<td className="py-4 px-4">{`${record.scope}`}</td>
											<td className="py-4 px-4">
												{record.rejectDate
													? moment(record.rejectDate).format('LL')
													: ''}
											</td>
											<td className="py-4 px-4">
												{record.rejectReason ? 'Pre-Review' : 'Double-Blind'}
											</td>
											<td className="py-4 px-4">
												<button
													onClick={() => handleViewComments(record)}
													className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
												>
													View Comments
												</button>
											</td>
										</tr>
								  ))
								: filteredManuscripts.map((record: any, index: number) => (
										<tr key={index} className="hover:bg-gray-50">
											<td className="py-4 px-4">{record.fileCode}</td>
											<td className="py-4 px-4">{record.title}</td>
											<td className="py-4 px-4">{`${record.scope}`}</td>
											<td className="py-4 px-4">
												{record.rejectDate
													? moment(record.rejectDate).format('LL')
													: ''}
											</td>
											<td className="py-4 px-4">
												{record.rejectReason ? 'Pre-Review' : 'Double-Blind'}
											</td>
											<td className="py-4 px-4">
												<button
													onClick={() => handleViewComments(record)}
													className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
												>
													View Comments
												</button>
											</td>
										</tr>
								  ))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Details Modal */}
			{isModalOpen && selectedRecord && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[600px]">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Manuscript Details</h3>
							<button
								title="cancelbtn"
								onClick={() => setIsModalOpen(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>
						<div className="space-y-4">
							<div>
								<label className="font-semibold block">Manuscript Title:</label>
								<p className="text-gray-700">{selectedRecord.title}</p>
							</div>
							<div>
								<label className="font-semibold block">File Code:</label>
								<p className="text-gray-700">{selectedRecord.scopeCode}</p>
							</div>
							<div>
								<label className="font-semibold block">Author/s:</label>
								<p className="text-gray-700">{selectedRecord.authors}</p>
							</div>
							<div>
								<label className="font-semibold block">Scope:</label>
								<p className="text-gray-700">{`${selectedRecord.scope}`}</p>
							</div>
							<div>
								<label className="font-semibold block">Date Rejected:</label>
								<p className="text-gray-700">{selectedRecord.rejectDate}</p>
							</div>
							<div>
								<label className="font-semibold block">Rejection Reason:</label>
								<p className="text-gray-700">{selectedRecord.rejectReason}</p>
							</div>
						</div>
						<div className="mt-6 flex justify-end">
							<button
								onClick={() => setIsModalOpen(false)}
								className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Comments Modal */}
			{isCommentsModalOpen && selectedRecord && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[500px]">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Rejection Comments</h3>
							<button
								title="cancelbtn"
								onClick={() => setIsCommentsModalOpen(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>
						<div className="space-y-4">
							<div>
								<label className="font-semibold block">Manuscript Title:</label>
								<p className="text-gray-700">{selectedRecord.title}</p>
							</div>
							<div>
								<label className="font-semibold block">Author/s:</label>
								<p className="text-gray-700">{selectedRecord.authors}</p>
							</div>
							{selectedRecord.rejectReason && (
								<div className="mt-2 p-4 bg-gray-50 rounded-lg">
									<label className="font-semibold block">
										Rejection Reason:
									</label>
									<p className="text-gray-700 whitespace-pre-wrap">
										{selectedRecord.rejectReason}
									</p>
								</div>
							)}

							{selectedRecord.rejectComment && (
								<div>
									<label className="font-semibold block">Comments:</label>
									<div className="mt-2 p-4 bg-gray-50 rounded-lg">
										<p className="text-gray-700 whitespace-pre-wrap">
											{selectedRecord.rejectComment}
										</p>
									</div>
								</div>
							)}
						</div>
						<div className="mt-6 flex justify-end">
							<button
								onClick={() => setIsCommentsModalOpen(false)}
								className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default StaffRejected;
