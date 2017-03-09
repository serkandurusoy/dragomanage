import { Tahsilatlar as collection} from '/imports/api/model';
import { wsBuilder } from './shared/odeme-tahsilat';

export default function(ws) {
  return wsBuilder(ws, collection);
}
