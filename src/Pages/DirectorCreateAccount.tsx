import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import bgImage from '../assets/Bg.jpeg';
import { registerUser } from '../api/auth.api';

const DirectorCreateAccount: React.FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const handleCreateAccount = async () => {
		if (password !== confirmPassword) {
			alert("Passwords don't match!");
			return;
		} else {
			await registerUser({
				email,
				password,
				role: 0,
			}).then((res) => {
				if (res.status === 201) {
					setEmail('');
					setPassword('');
					setConfirmPassword('');
				}
			});
		}
	};

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const togglePasswordVisibility = () => {
		setShowPassword((prev) => !prev);
	};

	const toggleConfirmPasswordVisibility = () => {
		setShowConfirmPassword((prev) => !prev);
	};

	return (
		<div
			className="h-full flex items-center justify-center bg-cover bg-center bg-no-repeat rounded-lg overflow-hidden"
			style={{
				backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${bgImage})`,
				minHeight: 'calc(100vh - 180px)',
			}}
		>
			<div className="bg-white p-8 rounded-lg shadow-md w-96 m-4">
				<h2 className="text-2xl font-bold mb-6 text-center text-[#111877]">
					Create Director Account
				</h2>
				<div>
					<div className="mb-4">
						<label
							htmlFor="email"
							className="block text-gray-700 text-sm font-bold mb-2"
						>
							Email
						</label>
						<input
							type="email"
							id="email"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#111877]"
							placeholder="Enter your email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className="mb-4">
						<label
							htmlFor="password"
							className="block text-gray-700 text-sm font-bold mb-2"
						>
							Password
						</label>
						<div className="relative w-full">
							<input
								type={showPassword ? 'text' : 'password'}
								id="password"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#111877] pr-10"
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
							<button
								type="button"
								onClick={togglePasswordVisibility}
								className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
							>
								{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						</div>
					</div>
					<div className="mb-6">
						<label
							htmlFor="confirmPassword"
							className="block text-gray-700 text-sm font-bold mb-2"
						>
							Confirm Password
						</label>

						<div className="relative w-full">
							<input
								type={showConfirmPassword ? 'text' : 'password'}
								id="confirmPassword"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#111877] pr-10"
								placeholder="Confirm your password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
							/>
							<button
								type="button"
								onClick={toggleConfirmPasswordVisibility}
								className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
							>
								{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						</div>
					</div>
					<button
						type="submit"
						disabled={email === '' || password === '' || confirmPassword === ''}
						onClick={handleCreateAccount}
						className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#111877] hover:bg-[#1c2680] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#111877]"
					>
						<UserPlus className="w-5 h-5 mr-2" />
						Create Account
					</button>
				</div>
			</div>
		</div>
	);
};

export default DirectorCreateAccount;
