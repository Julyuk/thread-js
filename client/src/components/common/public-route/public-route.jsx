import * as React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { AppRoute } from 'src/common/enums/enums';
import { locationType } from 'src/common/prop-types/prop-types';

const PublicRoute = ({ component: Component, ...rest }) => {
  const { user } = useSelector(state => ({
    user: state.profile.user
  }));

  const hasUser = Boolean(user);

  return hasUser
    ? <Navigate to={{ pathname: AppRoute.ROOT, state: { from: rest.location } }} />
    : <Component {...rest} />;
};

PublicRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  location: locationType
};

PublicRoute.defaultProps = {
  location: undefined
};

export default PublicRoute;
