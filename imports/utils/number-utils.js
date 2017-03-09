import { KURLAR } from '/imports/environment/enums';

Number.prototype.toCurrencyDisplay = function toCurrencyDisplay(digits = 2, kurKodu = KURLAR.TRY.value) {
  return this && `${this.toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })} ${KURLAR[kurKodu].symbol}`;
};

Number.prototype.toMoneyDisplay = function toMoneyDisplay(digits = 2) {
  return this &&
    this.toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
};
