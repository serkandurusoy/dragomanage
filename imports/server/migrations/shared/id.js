import { Random } from 'meteor/random';

export const KEVSER = Random.id();

export const VDURUN = Random.id();

export const CKID = {};
Array.from({length: 25}).forEach((_,ix) => CKID[`CK${ix+1}`] = Random.id());
