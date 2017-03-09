export default function docToModifier(schema,doc) {
  schema.clean(doc);

  const $set = schema
    .objectKeys()
    .filter(key => (doc[key] !== undefined && doc[key] !== null))
    .reduce((acc, key) => ({...acc, [key]: doc[key]}), {});

  const $unset = schema
    .objectKeys()
    .filter(key => (doc[key] === undefined || doc[key] === null))
    .reduce((acc, key) => ({...acc, [key]: ''}), {});

  let modifier = {};

  if (Object.keys($set).length > 0) {
    Object.assign(modifier,{$set});
  }

  if (Object.keys($unset).length > 0) {
    Object.assign(modifier,{$unset});
  }

  return modifier;
}
