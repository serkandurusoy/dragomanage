String.prototype.toTitleCase = function toTitleCase() {
  return this.replace(/\s\s+/g, ' ').trim().split(' ').map(t => t.charAt(0).toLocaleUpperCase() + t.slice(1).toLocaleLowerCase()).join(' ');
};

String.prototype.toSentenceCase = function toLabelCase() {
  const trimmed = this.replace(/\s\s+/g, ' ').trim();
  return trimmed.charAt(0).toLocaleUpperCase() + trimmed.slice(1).toLocaleLowerCase();
};

String.prototype.toLabelCase = function toLabelCase() {
  return this.replace(/\s\s+/g, ' ').trim().toLocaleLowerCase();
};

String.prototype.toTrimmed = function toTrimmed() {
  return this.replace(/\s\s+/g, ' ').trim();
};

String.prototype.enumValueToLabel = function enumValueToLabel(enm) {
  return enm && Object.keys(enm).map(k => enm[k]).find(e => e.value.toString() === this.toString()).label;
};

String.prototype.toRegEx = function toRegEx() {
  return new RegExp(this.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'), 'i');
};
