import React, { useState, useEffect } from 'react';
import { Eye, X } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import { useReviewers } from '../contexts/ReviewersContext';
import SearchBar from './SearchBar';
import ScoresDisplay from './shared/ScoresDisplay';
import {
	getManuscriptByStepStatus,
	updateManuscript,
} from '../api/manuscript.api';
import moment from 'moment';
import { getRating } from '../api/rating.api';
import { sendMail } from '../api/mail.api';

interface ProofreadingDetails {
	proofreader: string;
	proofreaderEmail: string;
	dateSent: string;
	status: string;
	revisionStatus?: string;
	revisionComments?: string;
}

interface PublishDetails {
	scopeNumber: string;
	volumeYear: string;
	datePublished: string;
	issueName?: string;
}

interface ManuscriptRecord {
	id: string;
	title: string;
	authors: string;
	scopeCode: string;
	scopeType: string;
	staffupload?: {
		fieldScope: string;
		dateSubmitted: string;
	};
	proofreadingDetails?: ProofreadingDetails;
	publishDetails?: PublishDetails;
}

interface ManuscriptDetails {
	// ... existing fields ...
	staffUpload?: {
		dateSubmitted: string;
	};
	layoutDetails?: {
		layoutArtist: string;
		layoutArtistEmail: string;
		dateFinished: string;
		status: string;
	};
	proofreadingDetails?: {
		proofreaderName: string;
		proofreaderEmail: string;
		status: string;
	};
}

const StaffFinalProofreading: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
	const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
	const [selectedRecord, setSelectedRecord] = useState<any>(null);
	const [revisionComments, setRevisionComments] = useState('');
	const [publishDetails, setPublishDetails] = useState({
		scopeNumber: '',
		volumeYear: new Date().getFullYear().toString(),
		datePublished: new Date().toISOString().split('T')[0],
		issueName: '',
	});
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [validationErrors, setValidationErrors] = useState<{
		[key: string]: string;
	}>({});
	const [showRevisionConfirmation, setShowRevisionConfirmation] =
		useState(false);
	const [showRevisionSuccess, setShowRevisionSuccess] = useState(false);
	const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
	const [volumeName, setVolumeName] = useState('');
	const [datePublished, setDatePublished] = useState('');
	const [formFields, setFormFields] = useState({
		issueNumber: false,
		volumeName: false,
		datePublished: false,
	});
	const [isPublishFormValid, setIsPublishFormValid] = useState(false);

	const scopeOptions = ['1', '2', 'Special Issue'];

	const handleViewDetails = (record: any) => {
		setSelectedRecord(record);
		setIsModalOpen(true);
	};

	const handleViewStatus = (record: any) => {
		setSelectedRecord(record);
		setIsStatusModalOpen(true);
	};

	const handleRevise = () => {
		setShowRevisionConfirmation(true);
	};

	const confirmRevision = async () => {
		if (selectedRecord && revisionComments) {
			await updateManuscript(selectedRecord._id, {
				progressStatus: 'For Revision',
				revisionComment: revisionComments,
			});

			await sendMail({
				message: `<p>Hello ${selectedRecord.authors[0]} <br/> Your manuscript entitled ${selectedRecord.title} needs revision. <br/>Comment: ${revisionComments}</p>`,
				recipients: [selectedRecord.authorEmail],
				subject: 'Manuscript Needs Revision',
			}).then(() => {
				setShowRevisionConfirmation(false);
				setIsReviseModalOpen(false);
				setShowRevisionSuccess(true);
				setRevisionComments('');
				getManuscripts();
			});
		}
	};

	const handlePublish = () => {
		// Reset validation errors
		setValidationErrors({});

		// Validate required fields
		const errors: { [key: string]: string } = {};
		if (!publishDetails.scopeNumber) {
			errors.scopeNumber = 'Issue number is required';
		}
		if (
			publishDetails.scopeNumber === 'Special Issue' &&
			!publishDetails.issueName
		) {
			errors.issueName = 'Issue name is required for Special Issue';
		}
		if (!publishDetails.volumeYear) {
			errors.volumeYear = 'Volume name is required';
		}
		if (!publishDetails.datePublished) {
			errors.datePublished = 'Date published is required';
		}

		if (Object.keys(errors).length > 0) {
			setValidationErrors(errors);
			return;
		}

		// Show confirmation dialog
		setShowConfirmation(true);
	};

	const confirmPublish = async () => {
		if (
			selectedRecord &&
			publishDetails.scopeNumber &&
			publishDetails.volumeYear &&
			publishDetails.datePublished
		) {
			await updateManuscript(selectedRecord._id, {
				issueNumber: publishDetails.scopeNumber,
				issueName: publishDetails.issueName,
				datePublished: datePublished,
				volumeYear: publishDetails.volumeYear,
				volumeName: volumeName,
				status: 'Published',
				progressStatus: 'Published',
				dateSent: new Date().toISOString(),
			});

			await sendMail({
				message: `<p>Hello ${selectedRecord.authors[0]} <br/>Your manuscript entitled ${selectedRecord.title} is now Published.</p>`,
				recipients: [selectedRecord.authorEmail],
				subject: 'Manuscript Update: Published',
			}).then(() => {
				setShowConfirmation(false);
				setIsPublishModalOpen(false);
				setShowSuccess(true);
				setPublishDetails({
					scopeNumber: '',
					volumeYear: new Date().getFullYear().toString(),
					datePublished: new Date().toISOString().split('T')[0],
					issueName: '',
				});
				getManuscripts();
			});
		}
	};

	const isFormComplete = () => {
		// Check if all fields have values and are not just whitespace
		const hasIssueNumber =
			publishDetails.scopeNumber && publishDetails.scopeNumber.trim() !== '';
		const hasVolumeName =
			publishDetails.volumeYear && publishDetails.volumeYear.trim() !== '';
		const hasDatePublished =
			publishDetails.datePublished &&
			publishDetails.datePublished.trim() !== '';

		// All fields must be filled to return true
		const allFieldsFilled = hasIssueNumber && hasVolumeName && hasDatePublished;

		// For Special Issue, also check issueName
		if (publishDetails.scopeNumber === 'Special Issue') {
			const hasIssueName =
				publishDetails.issueName && publishDetails.issueName.trim() !== '';
			return allFieldsFilled && hasIssueName;
		}

		return allFieldsFilled;
	};

	const validateFields = () => {
		// Check each field individually
		const fieldsStatus = {
			issueNumber:
				publishDetails.scopeNumber && publishDetails.scopeNumber.trim() !== '',
			volumeName:
				publishDetails.volumeYear && publishDetails.volumeYear.trim() !== '',
			datePublished:
				publishDetails.datePublished &&
				publishDetails.datePublished.trim() !== '',
		};

		// setFormFields(fieldsStatus);

		// Return true only if ALL fields are filled
		return (
			fieldsStatus.issueNumber &&
			fieldsStatus.volumeName &&
			fieldsStatus.datePublished
		);
	};

	useEffect(() => {
		validateFields();
	}, [publishDetails]);

	// Track form field completion
	const [formComplete, setFormComplete] = useState({
		issueNumber: false,
		volumeName: false,
		datePublished: false,
	});

	// Check if all fields are filled
	const areAllFieldsFilled = () => {
		return (
			formComplete.issueNumber &&
			formComplete.volumeName &&
			formComplete.datePublished
		);
	};

	// Update field status when values change
	useEffect(() => {
		setFormComplete({
			issueNumber: !!publishDetails.scopeNumber,
			volumeName:
				!!publishDetails.volumeYear && publishDetails.volumeYear.trim() !== '',
			datePublished: !!publishDetails.datePublished,
		});
	}, [publishDetails]);

	const validatePublishForm = () => {
		const isValid =
			publishDetails.scopeNumber?.trim() !== '' &&
			publishDetails.volumeYear?.trim() !== '' &&
			publishDetails.datePublished?.trim() !== '' &&
			// Additional check for Special Issue
			(publishDetails.scopeNumber !== 'Special Issue' ||
				(publishDetails.scopeNumber === 'Special Issue' &&
					publishDetails.issueName?.trim() !== ''));

		setIsPublishFormValid(isValid);
		return isValid;
	};

	const [manuscripts, setManuscripts] = useState<any>([]);
	const [filteredManuscripts, setFilteredManuscripts] = useState([]);
	const [remarks, setRemarks] = useState<any>([]);

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

	const getManuscripts = async () => {
		await getManuscriptByStepStatus('Final Proofreading').then((res) =>
			setManuscripts(res.data)
		);
	};

	const getRemarks = async () => {
		for (let i = 0; i < selectedRecord?.reviewers.length; i++) {
			let reviewerId = selectedRecord?.reviewers[i]._id;

			await getRating(selectedRecord._id, reviewerId).then((res) =>
				setRemarks((prev: string[]) => [...prev, res?.data.remarks])
			);
		}
	};

	useEffect(() => {
		getRemarks();
	}, [selectedRecord]);

	useEffect(() => {
		validatePublishForm();
	}, [publishDetails]);

	useEffect(() => {
		getManuscripts();
	}, []);

	useEffect(() => {
		filterRecords();
	}, [searchTerm]);

	return (
		<div className="bg-white p-6 rounded-lg shadow-md">
			<h3 className="text-xl font-semibold mb-4">Final Proofreading Records</h3>
			<SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
			<div className="overflow-x-auto">
				<table className="min-w-full bg-white">
					<thead className="bg-gray-100">
						<tr>
							<th className="py-3 px-4 text-left">File Code</th>
							<th className="py-3 px-4 text-left">Journal/Research Title</th>
							<th className="py-3 px-4 text-left">Field/Scope</th>
							<th className="py-3 px-4 text-left">Author</th>
							<th className="py-3 px-4 text-left">Date Submitted</th>
							<th className="py-3 px-4 text-left">Status</th>
							<th className="py-3 px-4 text-left">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{searchTerm === ''
							? manuscripts.map((record: any) => (
									<tr key={record.id} className="hover:bg-gray-50">
										<td className="px-4 py-2">{record.fileCode}</td>
										<td className="px-4 py-2">{record.title}</td>
										<td className="px-4 py-2">{record.scope}</td>
										<td className="px-4 py-2">{record.authors[0]}</td>
										<td className="px-4 py-2">
											{moment(record.dateSubmitted).format('LL') ||
												'Not available'}
										</td>
										<td className="px-4 py-2">
											<div className="flex items-center space-x-2">
												<span
													className={`px-2 py-1 rounded-full text-sm ${
														record.progressStatus === 'completed'
															? 'bg-green-100 text-green-800'
															: record.progressStatus === 'For Revision'
															? 'bg-yellow-100 text-yellow-800'
															: 'bg-blue-100 text-blue-800'
													}`}
												>
													{record.progressStatus === 'completed'
														? 'Completed'
														: record.progressStatus === 'For Revision'
														? 'For Revision'
														: 'In Progress'}
												</span>
												{record.progressStatus === 'revised' && (
													<button
														onClick={() => handleViewStatus(record)}
														className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
													>
														View Status
													</button>
												)}
											</div>
										</td>
										<td className="px-4 py-2">
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
							: filteredManuscripts.map((record: any) => (
									<tr key={record.id} className="hover:bg-gray-50">
										<td className="px-4 py-2">{record.fileCode}</td>
										<td className="px-4 py-2">{record.title}</td>
										<td className="px-4 py-2">{record.scope}</td>
										<td className="px-4 py-2">{record.authors[0]}</td>
										<td className="px-4 py-2">
											{moment(record.dateSubmitted).format('LL') ||
												'Not available'}
										</td>
										<td className="px-4 py-2">
											<div className="flex items-center space-x-2">
												<span
													className={`px-2 py-1 rounded-full text-sm ${
														record.progressStatus === 'completed'
															? 'bg-green-100 text-green-800'
															: record.progressStatus === 'revised'
															? 'bg-yellow-100 text-yellow-800'
															: 'bg-blue-100 text-blue-800'
													}`}
												>
													{record.progressStatus === 'completed'
														? 'Completed'
														: record.progressStatus === 'revised'
														? 'For Revision'
														: 'In Progress'}
												</span>
												{record.progressStatus === 'revised' && (
													<button
														onClick={() => handleViewStatus(record)}
														className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
													>
														View Status
													</button>
												)}
											</div>
										</td>
										<td className="px-4 py-2">
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
			{isModalOpen && selectedRecord && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[1100px] max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Proofreading Details</h3>
							<button
								title="cancelbtn"
								onClick={() => {
									setIsModalOpen(false);
									setRemarks([]);
								}}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex-1 space-y-4">
								{/* Manuscript Information Section */}
								<div className="bg-gray-50 p-4 rounded-lg mb-6">
									<h4 className="font-semibold text-gray-800 mb-3">
										Manuscript Information
									</h4>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="font-medium text-gray-700 block">
												File Code:
											</label>
											<p className="text-gray-700">{selectedRecord.fileCode}</p>
										</div>
										<div>
											<label className="font-medium text-gray-700 block">
												Date Submitted:
											</label>
											<p className="text-gray-700">
												{selectedRecord.dateSubmitted
													? new Date(
															selectedRecord.dateSubmitted
													  ).toLocaleDateString('en-US', {
															year: 'numeric',
															month: 'long',
															day: 'numeric',
													  })
													: 'Not available'}
											</p>
										</div>
										<div className="col-span-2">
											<label className="font-medium text-gray-700 block">
												Journal/Research Title:
											</label>
											<p className="text-gray-700">{selectedRecord.title}</p>
										</div>
										<div className="col-span-2">
											<label className="font-medium text-gray-700 block">
												Author/s:
											</label>
											<p className="text-gray-700">
												{selectedRecord.authors[0]}
											</p>
										</div>
										<div className="col-span-2">
											<label className="font-medium text-gray-700 block">
												Author/s Email:
											</label>
											<p className="text-gray-700">
												{selectedRecord.authorEmail}
											</p>
										</div>
										<div className="col-span-2">
											<label className="font-medium text-gray-700 block">
												Field/Scope:
											</label>
											<p className="text-gray-700">{`${selectedRecord.scope}`}</p>
										</div>
										<div className="col-span-2">
											<label className="font-medium text-gray-700 block">
												Editor:
											</label>
											<p className="text-gray-700">
												{selectedRecord.editor.firstname}{' '}
												{selectedRecord.editor.lastname}
											</p>
										</div>
									</div>
								</div>

								{/* Add Scores Display */}
								<div className="bg-gray-50 p-4 rounded-lg mb-6">
									<h4 className="font-semibold text-gray-800 mb-3">
										Manuscript Scores
									</h4>
									<ScoresDisplay manuscript={selectedRecord} />
								</div>

								{/* Layout Information Section */}
								<div className="mb-6">
									<h4 className="text-lg font-semibold mb-4">
										Layout Information
									</h4>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="font-semibold block">
												Layout Artist:
											</label>
											<p className="text-gray-700">
												{selectedRecord.layoutArtistName}
											</p>
										</div>
										<div>
											<label className="font-semibold block">
												Layout Artist Email:
											</label>
											<p className="text-gray-700">
												{selectedRecord.layoutArtistEmail}
											</p>
										</div>
										<div>
											<label className="font-semibold block">
												Date Finished:
											</label>
											<p className="text-gray-700">
												{moment(selectedRecord.layoutFinishDate).format('LL')}
											</p>
										</div>
									</div>
								</div>

								{/* Proofreading Details Section */}
								<div className="mt-6 border-t pt-4">
									<h4 className="text-lg font-semibold mb-4">
										Proofreading Details
									</h4>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="font-semibold block">
												Proofreader:
											</label>
											<p className="text-gray-700">
												{selectedRecord.proofReaderName}
											</p>
										</div>
										<div>
											<label className="font-semibold block">
												Proofreader Email:
											</label>
											<p className="text-gray-700">
												{selectedRecord.proofReaderEmail}
											</p>
										</div>
										{/* <div>
											<label className="font-semibold block">
												Date Finished:
											</label>
											<p className="text-gray-700">
												{selectedRecord.proofreadingDetails?.dateSent}
											</p>
										</div> */}
									</div>
								</div>
							</div>

							{/* Assigned Reviewers Section */}
							<div className="w-[350px] border-l pl-6">
								<h4 className="text-lg font-semibold mb-4">
									Assigned Reviewers
								</h4>
								<div className="space-y-4">
									{selectedRecord?.reviewers.map(
										(reviewer: any, index: number) => (
											<div
												key={index}
												className="bg-white p-3 rounded-md shadow-sm border border-gray-100"
											>
												<div className="flex justify-between items-start">
													<div>
														<p className="font-medium text-gray-800">
															{reviewer.firstname} {reviewer.middlename}{' '}
															{reviewer.lastname}
														</p>
														<p className="text-gray-600 text-sm mt-1">
															{reviewer.email}
														</p>
														<p className="text-gray-600 text-sm mt-1">
															{reviewer.affiliation}
														</p>
														<p className="text-gray-600 text-sm mt-1">
															Expertise: {reviewer.fieldOfExpertise}
														</p>

														{selectedRecord && (
															<div className="mt-2">
																<p className="text-sm font-medium text-gray-700">
																	Remarks:
																</p>
																<span
																	className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
																		remarks[index] === 'Excellent'
																			? 'bg-green-100 text-green-800'
																			: remarks[index] === 'acceptable'
																			? 'bg-blue-100 text-blue-800'
																			: remarks[index] ===
																			  'acceptable-with-revision'
																			? 'bg-yellow-100 text-yellow-800'
																			: 'bg-red-100 text-red-800'
																	}`}
																>
																	{remarks[index]
																		?.split('-')
																		.map(
																			(word: string) =>
																				word.charAt(0).toUpperCase() +
																				word.slice(1)
																		)
																		.join(' ') || 'No Remarks found'}
																</span>
															</div>
														)}
													</div>
													<span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
														Reviewer {index + 1}
													</span>
												</div>
											</div>
										)
									)}
									{(!selectedRecord.reviewers ||
										selectedRecord.reviewers.length === 0) && (
										<p className="text-gray-500 italic">
											No reviewers assigned
										</p>
									)}
								</div>
							</div>
						</div>

						<div className="mt-6 flex justify-end space-x-4">
							<button
								onClick={() => setIsModalOpen(false)}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Close
							</button>
							<button
								onClick={() => {
									setIsModalOpen(false);
									setIsReviseModalOpen(true);
								}}
								className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
							>
								Revise
							</button>
							<button
								onClick={() => {
									setIsModalOpen(false);
									setIsPublishModalOpen(true);
								}}
								className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
							>
								Publish
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Revise Modal */}
			{isReviseModalOpen && selectedRecord && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[500px]">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Revise Manuscript</h3>
							<button
								title="cancelbtn"
								onClick={() => setIsReviseModalOpen(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>
						<div className="mb-4">
							<h4 className="text-lg font-semibold mb-2">Manuscript Title:</h4>
							<p className="text-gray-700">{selectedRecord.title}</p>
						</div>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Revision Comments
								</label>
								<textarea
									value={revisionComments}
									onChange={(e) => setRevisionComments(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									rows={4}
									placeholder="Enter revision comments"
									required
								/>
							</div>
						</div>
						<div className="mt-6 flex justify-end space-x-4">
							<button
								onClick={() => setIsReviseModalOpen(false)}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handleRevise}
								className={` text-white px-4 py-2 rounded ${
									revisionComments === ''
										? 'bg-gray-400 hover:bg-gray-600'
										: 'bg-yellow-500 hover:bg-yellow-600'
								}  transition-colors`}
								disabled={revisionComments === ''}
							>
								Submit Revision
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Publish Modal */}
			{isPublishModalOpen && selectedRecord && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[500px]">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Publish Manuscript</h3>
							<button
								title="cancelbtn"
								onClick={() => {
									setIsPublishModalOpen(false);
									setPublishDetails({
										...publishDetails,
										scopeNumber: '',
									});
									setVolumeName('');
									setDatePublished('');
								}}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>
						<div className="mb-4">
							<h4 className="text-lg font-semibold mb-2">Manuscript Title:</h4>
							<p className="text-gray-700">{selectedRecord.title}</p>
						</div>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Issue Number <span className="text-red-500">*</span>
								</label>
								<select
									title="selectIssueNumber"
									value={publishDetails.scopeNumber}
									onChange={(e) =>
										setPublishDetails({
											...publishDetails,
											scopeNumber: e.target.value,
										})
									}
									className={`w-full px-3 py-2 border ${
										validationErrors.scopeNumber
											? 'border-red-500'
											: 'border-gray-300'
									} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
								>
									<option value="">Select Issue Number</option>
									{scopeOptions.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
								{validationErrors.scopeNumber && (
									<p className="mt-1 text-sm text-red-500">
										{validationErrors.scopeNumber}
									</p>
								)}
							</div>

							{publishDetails.scopeNumber === 'Special Issue' && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Issue Name <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={publishDetails.issueName}
										onChange={(e) =>
											setPublishDetails({
												...publishDetails,
												issueName: e.target.value,
											})
										}
										placeholder="Enter Special Issue Name"
										className={`w-full px-3 py-2 border ${
											validationErrors.issueName
												? 'border-red-500'
												: 'border-gray-300'
										} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
									/>
									{validationErrors.issueName && (
										<p className="mt-1 text-sm text-red-500">
											{validationErrors.issueName}
										</p>
									)}
								</div>
							)}
							<div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Volume Number <span className="text-red-500">*</span>
									</label>
									<select
										title="selectIssueNumber"
										value={volumeName}
										onChange={(e) => setVolumeName(e.target.value)}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
									>
										<option value="">Select Volume Number</option>
										{Array.from({ length: 99 }, (_, i) => i + 1).map(
											(option) => (
												<option key={option} value={option}>
													{option}
												</option>
											)
										)}
									</select>
									{/* {validationErrors.scopeNumber && (
										<p className="mt-1 text-sm text-red-500">
											{validationErrors.scopeNumber}
										</p>
									)} */}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Date Published <span className="text-red-500">*</span>
								</label>
								<input
									type="date"
									value={datePublished}
									onChange={(e) => setDatePublished(e.target.value)}
									className={`w-full px-3 py-2 border ${
										validationErrors.datePublished
											? 'border-red-500'
											: 'border-gray-300'
									} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
									required
								/>
								{validationErrors.datePublished && (
									<p className="mt-1 text-sm text-red-500">
										{validationErrors.datePublished}
									</p>
								)}
							</div>
						</div>
						<div className="mt-6 flex justify-end space-x-4">
							<button
								onClick={() => {
									setIsPublishModalOpen(false);
									setPublishDetails({
										...publishDetails,
										scopeNumber: '',
									});
									setVolumeName('');
									setDatePublished('');
								}}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handlePublish}
								disabled={
									publishDetails.scopeNumber === '' ||
									volumeName === '' ||
									datePublished === ''
								}
								className={`px-4 py-2 rounded-md transition-colors ${
									publishDetails.scopeNumber === '' ||
									volumeName === '' ||
									datePublished === ''
										? 'bg-gray-300 text-gray-500 cursor-not-allowed'
										: 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
								}`}
							>
								Publish
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Confirmation Modal */}
			{showConfirmation && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
					<div className="bg-white p-6 rounded-lg w-[400px]">
						<h3 className="text-xl font-semibold mb-4">Confirm Publication</h3>
						<p className="text-gray-700 mb-6">
							Are you sure you want to publish this manuscript?
						</p>
						<div className="flex justify-end space-x-4">
							<button
								onClick={() => setShowConfirmation(false)}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								No
							</button>
							<button
								onClick={confirmPublish}
								className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
							>
								Yes
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Success Modal */}
			{showSuccess && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
					<div className="bg-white p-6 rounded-lg w-[400px]">
						<div className="text-center">
							<h3 className="text-xl font-semibold mb-4">Success!</h3>
							<div className="bg-white p-4 rounded-lg">
								<p className="text-gray-600">
									Successfully moved to Published section!
								</p>
							</div>
							<button
								onClick={() => setShowSuccess(false)}
								className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Revision Confirmation Modal */}
			{showRevisionConfirmation && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
					<div className="bg-white p-6 rounded-lg w-[400px]">
						<h3 className="text-xl font-semibold mb-4">Confirm Revision</h3>
						<p className="text-gray-700 mb-6">
							Are you sure you want to send this manuscript for revision?
						</p>
						<div className="flex justify-end space-x-4">
							<button
								onClick={() => setShowRevisionConfirmation(false)}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={confirmRevision}
								className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
							>
								Confirm
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Revision Success Modal */}
			{showRevisionSuccess && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
					<div className="bg-white p-6 rounded-lg w-[400px]">
						<div className="text-center">
							<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
								<svg
									className="h-6 w-6 text-green-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								Revision Submitted Successfully
							</h3>
							<p className="text-sm text-gray-500 mb-6">
								The manuscript has been sent for revision.
							</p>
							<button
								onClick={() => setShowRevisionSuccess(false)}
								className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Status Modal */}
			{isStatusModalOpen && selectedRecord && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[500px]">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Revision Status</h3>
							<button
								title="cancelbtn"
								onClick={() => setIsStatusModalOpen(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>

						<div className="space-y-4">
							<div>
								<h4 className="text-lg font-semibold mb-2">
									Manuscript Title:
								</h4>
								<p className="text-gray-700">{selectedRecord.title}</p>
							</div>

							<div>
								<h4 className="text-lg font-semibold mb-2">Status:</h4>
								<span className="px-2 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
									For Revision
								</span>
							</div>

							<div>
								<h4 className="text-lg font-semibold mb-2">
									Revision Comments:
								</h4>
								<div className="bg-gray-50 p-4 rounded-lg">
									<p className="text-gray-700 whitespace-pre-wrap">
										{selectedRecord.proofreadingDetails?.revisionComments ||
											'No comments available'}
									</p>
								</div>
							</div>
						</div>

						<div className="mt-6 flex justify-end">
							<button
								onClick={() => setIsStatusModalOpen(false)}
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

export default StaffFinalProofreading;
