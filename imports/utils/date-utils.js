import moment from 'moment-timezone';

Date.prototype.toFormattedDate = function toFormattedDate() {
  return this && this.toLocaleDateString('tr', {timeZone: 'UTC'});
};

Date.prototype.toFormattedTime = function toFormattedTime() {
  return this && this.toLocaleString('tr');
};

Date.prototype.isSame = function isSame(date) {
  return moment(this).isSame(date);
};

Date.prototype.isBefore = function isBefore(date) {
  return moment(this).isBefore(date);
};

Date.prototype.isSameOrBefore = function isSameOrBefore(date) {
  return moment(this).isSameOrBefore(date);
};

Date.prototype.isSameOrAfter = function isSameOrAfter(date) {
  return moment(this).isSameOrAfter(date);
};

Date.prototype.isAfter = function isAfter(date) {
  return moment(this).isAfter(date);
};

Date.prototype.add = function add(number,unit) {
  return moment(this).add(number,unit).toDate();
};

Date.prototype.subtract = function subtract(number,unit) {
  return moment(this).subtract(number,unit).toDate();
};

Date.prototype.daysApartFromNow = function daysApartFromNow() {
  return Math.round(Math.abs(parseFloat(moment.duration(moment(this)-moment()).asDays())));
};

Date.sistemAcilis = function sistemAcilis() {
  return moment.utc('20170101').toDate();
};

Date.today = function today() {
  return moment.utc().startOf('d').toDate();
};

Date.yesterday = function yesterday() {
  return moment.utc().subtract(1,'d').startOf('d').toDate();
};

Date.tomorrow = function tomorrow() {
  return moment.utc().add(1,'d').startOf('d').toDate();
};

Date.lastMonth = function lastMonth() {
  return moment.utc().subtract(1,'M').startOf('d').toDate();
};

Date.nextMonth = function nextMonth() {
  return moment.utc().add(1,'M').startOf('d').toDate();
};

Date.lastQuarter = function lastQuarter() {
  return moment.utc().subtract(3,'M').startOf('d').toDate();
};

Date.nextQuarter = function nextQuarter() {
  return moment.utc().add(3,'M').startOf('d').toDate();
};

Date.lastYear = function lastYear() {
  return moment.utc().subtract(1,'y').startOf('d').toDate();
};

Date.nextYear = function nextYear() {
  return moment.utc().add(1,'y').startOf('d').toDate();
};

Date.inTwoYears = function inTwoYears() {
  return moment.utc().add(2,'y').startOf('d').toDate();
};
