export default function buildKeywordRegexSelector(keyword='', fields=[], selector={}) {
  if (keyword.length > 0 && Array.isArray(fields) && fields.length > 0) {
    if(fields.includes("unvan") || fields.includes("kisaIsim")){
      const temp=[]
      temp.push(keyword
        .replace(/\s\s+/g, ' '))

      selector.$or = temp
        .filter(kw => kw.length > 0)
        .map(kw => kw.toRegEx())
        .reduce((acc,rx) => (
          [
            ...acc,
            ...fields.map(field => ({ [field]: { $regex: rx } }) ),
          ]
        ), []);
    }else{

      selector.$or = keyword
        .replace(/\s\s+/g, ' ')
        .split(' ')
        .filter(kw => kw.length > 0)
        .map(kw => kw.toRegEx())
        .reduce((acc,rx) => (
          [
            ...acc,
            ...fields.map(field => ({ [field]: { $regex: rx } }) ),
          ]
        ), []);
      if (selector.$or.length === 0) {
        delete selector.$or;
      }
    }
  }
  return selector;
}
