import React, { useEffect, useState } from 'react';
import { User, ExternalLink } from 'lucide-react';
import { useReviewers } from '../contexts/ReviewersContext';
import { getReviewers } from '../api/reviewer.api';

const DirectorReviewersInfo: React.FC = () => {
	const [reviewers, setReviewers] = useState<any>([]);
	const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);

	const getAllReviewers = async () => {
		await getReviewers().then((res) => {
			setReviewers(res.data);
		});
	};

	useEffect(() => {
		getAllReviewers();
	}, []);

	return (
		<div className="reviewers-info-container">
			<div className="bg-white p-6 rounded-lg shadow-md">
				{reviewers.length === 0 ? (
					<p className="text-gray-500 text-center py-4">
						No reviewers available.
					</p>
				) : (
					<div className="space-y-4">
						{reviewers.map((reviewer: any) => (
							<div
								key={reviewer._id}
								className="flex items-center bg-gray-100 p-4 rounded-lg"
							>
								<div className="flex-shrink-0 mr-4">
									<User size={40} className="text-gray-500" />
								</div>
								<div className="flex-grow">
									<h3 className="text-lg font-semibold">
										{`${reviewer.firstname} ${reviewer.middlename} ${reviewer.lastname}`}
									</h3>
									<p className="text-gray-600">{reviewer.fieldOfExpertise}</p>
									<p className="text-gray-500">{reviewer.email}</p>
									<p className="text-gray-500">{reviewer.affiliation}</p>
								</div>
								{reviewer.publicationLink && (
									<div className="flex-shrink-0">
										<a
											href={reviewer.publicationLink}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-500 hover:text-blue-700 flex items-center"
										>
											<ExternalLink size={20} className="mr-1" />
											Publications
										</a>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default DirectorReviewersInfo;
