import React, { Component } from 'react';
import moment from 'moment-timezone';
import 'moment/locale/tr';
import classNames from 'classnames';
import ReactDateTime from 'react-datetime';
import { connectField } from 'uniforms';
import wrapField from '/imports/client/components/uniforms-bootstrap3/wrapField';
import { StaticFieldInput } from '/imports/client/components/uniforms-custom';

export default connectField(function DateTimeField({staticField, ...props}) {
  return wrapField({feedbackable: true, ...props},
    props.staticForm || staticField
      ? <StaticFieldInput
          className={props.className}
          content={props.content}
          notFoundText={props.notFoundText}
          value={props.value} />
      : <DateTime {...props}/>
  )
});

class DateTime extends Component {

  keyDown = (e) => {
    e.preventDefault();
    if (['Backspace', 'Delete'].includes(e.key)) {
      this.props.onChange(null);
      this.refs.picker.closeCalendar();
      e.target.blur();
    } else if (['Escape', 'Enter'].includes(e.key)) {
      this.refs.picker.closeCalendar();
      e.target.blur();
    }
  }

  render() {

    const {
      props
    } = this;

    let inputProps = props.inputProps || {};
    if (props.disabled !== undefined || props.disabled !== null) {
      inputProps.disabled = props.disabled
    }
    inputProps.name = props.name;
    inputProps.placeholder = props.placeholder;
    inputProps.onKeyDown = this.keyDown;

    return <ReactDateTime
      className={classNames('customSelect', 'customDate', props.className)}
      id={props.id}
      name={props.name}
      onChange={value => {
        if (moment.isMoment(value)) {
          props.onChange(value.toDate())
        } else {
          props.onChange(null);
        }
      }}
      ref={ 'picker' /* props.ref */}
      value={props.value}
      dateFormat={props.dateFormat || 'DD.MM.YYYY'}
      timeFormat={props.timeFormat || false}
      input={props.input}
      open={props.open}
      locale={props.locale || 'tr'}
      utc={props.utc || ( props.timeFormat === true ? false : true )}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      viewMode={props.viewMode /*'years', 'months', default: 'days', 'time'*/}
      inputProps={inputProps}
      isValidDate={props.isValidDate}
      renderDay={props.renderDay}
      renderMonth={props.renderMonth}
      renderYear={props.renderYear}
      strictParsing={props.strictParsing}
      closeOnSelect={props.closeOnSelect === false ? false : true}
      closeOnTab={props.closeOnTab === false ? false : true}
      timeConstraints={props.timeConstraints  /* { hours: { min: 9, max: 15, step: 2 }}  hours, minutes, seconds and milliseconds */}
      disableOnClickOutside={props.disableOnClickOutside}
    />
  }

}
