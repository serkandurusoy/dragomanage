import React          from 'react';
import classnames     from 'classnames';
import connectField   from 'uniforms/connectField';
import filterDOMProps from 'uniforms/filterDOMProps';
import nothing        from 'uniforms/nothing';

const Error = ({
                 children,
                 className,
                 errorMessage,
                 updateForm,
                 staticForm,
                 insertForm,
                 ...props
               }) =>
  !errorMessage ? nothing : (
    <div className={classnames('panel panel-danger', className)} {...filterDOMProps(props)}>
      <div className="panel-body">
        {children ? (
          children
        ) : (
          <div className="panel-heading">
            <h4 className="panel-title">
              {errorMessage}
            </h4>
          </div>
        )}
      </div>
    </div>
  )
;

export default connectField(Error, {initialValue: false});
