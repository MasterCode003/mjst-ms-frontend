import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateRoute = ({ redirect, children }) => {
	if (!Cookies.get('access_token') && !Cookies.get('role')) {
		return <Navigate to={redirect} replace />;
	}
	return children;
};

export default PrivateRoute;
