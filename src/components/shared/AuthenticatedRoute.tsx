import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AuthenticatedRoute = ({ children }) => {
	if (Cookies.get('access_token') && Cookies.get('role') === '1') {
		return <Navigate to={'/staff/dashboard'} replace />;
	}

	if (Cookies.get('access_token') && Cookies.get('role') === '0') {
		return <Navigate to={'/director/dashboard'} replace />;
	}

	return children;
};

export default AuthenticatedRoute;
