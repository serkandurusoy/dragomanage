import { Accounts } from 'meteor/accounts-base';
import { ReactiveVar } from 'meteor/reactive-var';

export const loginFailure = new ReactiveVar(null);

Accounts.onLoginFailure(err => {
  loginFailure.set(err);
});

Accounts.onLogin(() => {
  loginFailure.set(null);
});
