import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import LoginPage from './Pages/LoginPage';
import StaffLoginPage from './Pages/StaffLoginPage';
import DirectorsPage from './Pages/DirectorsPage';
import StaffDashboard from './components/StaffDashboard';
import StaffCreateAccount from './Pages/StaffCreateAccount';
import DirectorCreateAccount from './Pages/DirectorCreateAccount';
import { EditorsProvider } from './contexts/EditorsContext';
import { ReviewersProvider } from './contexts/ReviewersContext';
import { RecordProvider } from './contexts/RecordContext';
import { DashboardProvider } from './contexts/DashboardContext';
import './index.css';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/shared/PrivateRoute';
import AuthenticatedRoute from './components/shared/AuthenticatedRoute';

function App() {
	return (
		<>
			<Toaster position="bottom-right" />
			<RecordProvider>
				<DashboardProvider>
					<ReviewersProvider>
						<EditorsProvider>
							<Router>
								<div className="min-h-screen">
									<Routes>
										<Route
											path="/"
											element={
												<AuthenticatedRoute>
													<LandingPage />
												</AuthenticatedRoute>
											}
										/>
										{/* Director routes */}
										<Route path="/director">
											<Route path="login" element={<LoginPage />} />
											<Route
												path="create-account"
												element={
													<PrivateRoute redirect={'/'}>
														<DirectorCreateAccount />
													</PrivateRoute>
												}
											/>
											<Route
												path="dashboard"
												element={
													<PrivateRoute redirect={'/'}>
														<DirectorsPage />
													</PrivateRoute>
												}
											/>
										</Route>

										{/* Staff routes */}
										<Route path="/staff">
											<Route path="login" element={<StaffLoginPage />} />
											<Route
												path="create-account"
												element={
													<PrivateRoute redirect={'/'}>
														<StaffCreateAccount />
													</PrivateRoute>
												}
											/>
											<Route
												path="dashboard"
												element={
													<PrivateRoute redirect={'/'}>
														<StaffDashboard />
													</PrivateRoute>
												}
											/>
										</Route>
									</Routes>
								</div>
							</Router>
						</EditorsProvider>
					</ReviewersProvider>
				</DashboardProvider>
			</RecordProvider>
		</>
	);
}

export default App;
