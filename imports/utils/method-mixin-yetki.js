import { Meteor } from 'meteor/meteor';
export default function methodMixinYetki(methodOptions) {

  const {
    yetkiler,
    run,
  } = methodOptions;

  methodOptions.run = function () {
    this.unblock();

    if (!this.userId) {
      throw new Meteor.Error('403', 'Kullanıcı bulunamadı');
    }

    if (!yetkiler || !Array.isArray(yetkiler) || yetkiler.length === 0) {
      throw new Meteor.Error('403', 'Kullanıcı yetkili değil');
    }

    if (yetkiler.find(yetki => !Meteor.user().yetkili(yetki))) {
      throw new Meteor.Error('403', 'Kullanıcı yetkili değil');
    }

    return run.call(this, ...arguments);

  }

  return methodOptions;

}
