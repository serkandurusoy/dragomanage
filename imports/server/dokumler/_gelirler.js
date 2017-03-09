import { Gelirler as collection} from '/imports/api/model';
import { wsBuilder } from './shared/gelir-gider';

export default function(ws) {
  return wsBuilder(ws, collection);
}
