import React, { useEffect, useState } from 'react';
import { Eye, X } from 'lucide-react';
import SearchBar from './SearchBar';
import { getManuscriptByStepStatus } from '../api/manuscript.api';
import moment from 'moment';

const DirectorPreReview: React.FC = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedManuscript, setSelectedManuscript] = useState<any>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const handleViewDetails = (manuscript: any) => {
		setSelectedManuscript(manuscript);
		setIsModalOpen(true);
	};

	const [manuscripts, setManuscripts] = useState([]);
	const [filteredManuscripts, setFilteredManuscripts] = useState([]);

	const getManuscripts = async () => {
		await getManuscriptByStepStatus('Pre-Review').then((res) => {
			setManuscripts(res.data);
		});
	};

	const filterRecords = () => {
		const filteredRecords = manuscripts.filter(
			(record: any) =>
				record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				record.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
				record.authors[0].toLowerCase().includes(searchTerm.toLowerCase()) ||
				record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
				record.fileCode.toLowerCase().includes(searchTerm.toLowerCase())
		);

		setFilteredManuscripts(filteredRecords);
	};

	useEffect(() => {
		getManuscripts();
	}, []);

	useEffect(() => {
		filterRecords();
	}, [searchTerm]);
	return (
		<div className="bg-white p-6 rounded-lg shadow-md">
			<h3 className="text-xl font-semibold mb-4">Pre-Review Records</h3>
			<SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
			<div className="overflow-x-auto">
				<table className="min-w-full bg-white">
					<thead className="bg-gray-100">
						<tr>
							<th className="py-3 px-4 text-left">File Code</th>
							<th className="py-3 px-4 text-left">Journal/Research Title</th>
							<th className="py-3 px-4 text-left">Field/Scope</th>
							<th className="py-3 px-4 text-left">Date Submitted</th>
							<th className="py-3 px-4 text-left">Authors</th>
							<th className="py-3 px-4 text-left">Affiliation</th>
							<th className="py-3 px-4 text-left">Status</th>
							<th className="py-3 px-4 text-left">Actions</th>
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
											{moment(record.dateSubmitted).format('LL')}
										</td>
										<td className="py-4 px-4">{record.authors[0]}</td>
										<td className="py-4 px-4">{record.affiliation}</td>
										<td className="py-4 px-4">
											<span
												className={`px-2 py-1 rounded-full text-sm ${
													record.progressStatus === 'For Revision'
														? 'bg-yellow-100 text-yellow-800'
														: record.progressStatus === 'Rejected'
														? 'bg-red-100 text-red-800'
														: 'bg-blue-100 text-blue-800'
												}`}
											>
												{record.progressStatus || 'In Progress'}
											</span>
										</td>
										<td className="py-4 px-4">
											<button
												onClick={() => handleViewDetails(record)}
												className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors inline-flex items-center"
											>
												<Eye size={16} className="mr-1" />
												View
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
											{moment(record.dateSubmitted).format('LL')}
										</td>
										<td className="py-4 px-4">{record.authors[0]}</td>
										<td className="py-4 px-4">{record.affiliation}</td>
										<td className="py-4 px-4">
											<span
												className={`px-2 py-1 rounded-full text-sm ${
													record.progressStatus === 'For Revision'
														? 'bg-yellow-100 text-yellow-800'
														: record.progressStatus === 'Rejected'
														? 'bg-red-100 text-red-800'
														: 'bg-blue-100 text-blue-800'
												}`}
											>
												{record.progressStatus || 'In Progress'}
											</span>
										</td>
										<td className="py-4 px-4">
											<button
												onClick={() => handleViewDetails(record)}
												className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors inline-flex items-center"
											>
												<Eye size={16} className="mr-1" />
												View
											</button>
										</td>
									</tr>
							  ))}
					</tbody>
				</table>
			</div>

			{/* Details Modal */}
			{isModalOpen && selectedManuscript && (
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
								<label className="font-semibold block">File Code:</label>
								<p className="text-gray-700">{selectedManuscript.fileCode}</p>
							</div>
							<div>
								<label className="font-semibold block">Manuscript Title:</label>
								<p className="text-gray-700">{selectedManuscript.title}</p>
							</div>
							<div>
								<label className="font-semibold block">Author/s:</label>
								<p className="text-gray-700">{selectedManuscript.authors[0]}</p>
							</div>
							<div>
								<label className="font-semibold block">Scope:</label>
								<p className="text-gray-700">{`${selectedManuscript.scope}`}</p>
							</div>
							<div>
								<label className="font-semibold block">Date:</label>
								<p className="text-gray-700">
									{moment(selectedManuscript.dateSubmitted).format('LL')}
								</p>
							</div>
							<div>
								<label className="font-semibold block">Email:</label>
								<p className="text-gray-700">
									{selectedManuscript.authorEmail}
								</p>
							</div>
							<div>
								<label className="font-semibold block">Affiliation:</label>
								<p className="text-gray-700">
									{selectedManuscript.affiliation}
								</p>
							</div>
							<div>
								<label className="font-semibold block">Editor:</label>
								<p className="text-gray-700">
									{selectedManuscript.editor.firstname}{' '}
									{selectedManuscript.editor.lastname}
								</p>
							</div>
							{selectedManuscript.progressStatus == 'For Revision' ? (
								<div className="col-span-2">
									<label className="font-semibold block">
										Revision Comment:
									</label>
									<p className="text-gray-700">
										{selectedManuscript.revisionComment}
									</p>
								</div>
							) : null}
							{selectedManuscript.reviewers &&
								selectedManuscript.reviewers.length > 0 && (
									<div>
										<label className="font-semibold block">Reviewers:</label>
										<ul className="list-disc list-inside text-gray-700">
											{selectedManuscript.reviewers.map(
												(reviewer: any, index: number) => (
													<li key={index}>
														{reviewer.firstname} {reviewer.lastname}
													</li>
												)
											)}
										</ul>
									</div>
								)}
							<div>
								<label className="font-semibold block mb-2">Scores:</label>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<span className="text-sm text-gray-600">
											Grammar Score:
										</span>
										<div
											className={`mt-1 text-sm ${
												selectedManuscript.grammarScore >= 85
													? 'text-green-600'
													: 'text-red-600'
											}`}
										>
											{selectedManuscript.grammarScore}% (
											{selectedManuscript.grammarScore >= 85
												? 'Passed'
												: 'Failed'}
											)
											<div className="text-gray-500 text-xs">
												Passing score: 85%
											</div>
										</div>
									</div>
									<div>
										<span className="text-sm text-gray-600">
											Plagiarism Score:
										</span>
										<div
											className={`mt-1 text-sm ${
												selectedManuscript.plagiarismScore <= 15
													? 'text-green-600'
													: 'text-red-600'
											}`}
										>
											{selectedManuscript.plagiarismScore}% (
											{selectedManuscript.plagiarismScore <= 15
												? 'Passed'
												: 'Failed'}
											)
											<div className="text-gray-500 text-xs">
												Threshold: 15%
											</div>
										</div>
									</div>
								</div>
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
		</div>
	);
};

export default DirectorPreReview;
