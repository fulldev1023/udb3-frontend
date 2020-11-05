import PropTypes from 'prop-types';
import { Alert as BootstrapAlert } from 'react-bootstrap';
import styled from 'styled-components';
import { getValueFromTheme } from './theme';

const AlertVariants = {
  INFO: 'info',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
};

const getValue = getValueFromTheme(`alert`);

const StyledBootstrapAlert = styled(BootstrapAlert)`
  &.alert {
    border-radius: ${getValue('borderRadius')};
  }
`;

const Alert = ({ variant, visible, dismissible, children, className }) => (
  <StyledBootstrapAlert
    variant={variant}
    hidden={!visible}
    dismissible={dismissible}
    className={className}
  >
    {children}
  </StyledBootstrapAlert>
);

Alert.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(Object.values(AlertVariants)),
  visible: PropTypes.bool,
  dismissible: PropTypes.bool,
  children: PropTypes.node,
};

Alert.defaultProps = {
  variant: AlertVariants.INFO,
  visible: false,
  dismissible: false,
};

export { AlertVariants, Alert };