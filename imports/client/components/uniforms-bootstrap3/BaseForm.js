import BaseForm    from 'uniforms/BaseForm';
import classnames  from 'classnames';
import {PropTypes} from 'react';

const Bootstrap3 = parent => class extends parent {
  static Bootstrap3 = Bootstrap3;

  static displayName = `Bootstrap3${parent.displayName}`;

  static propTypes = {
    ...parent.propTypes,

    staticForm: PropTypes.bool,

    grid: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
      PropTypes.string
    ])
  };

  getChildContextState() {
    return {
      ...super.getChildContextState(),
      staticForm: this.props.staticForm,
      grid: this.props.grid
    };
  }

  getNativeFormProps() {
    const error = this.getChildContextError();
    const {
      className,
      staticForm,
      grid,

      ...props
    } = super.getNativeFormProps();

    return {
      ...props,
      className: classnames('form', {error, 'form-horizontal': grid}, className)
    };
  }
};

export default Bootstrap3(BaseForm);
