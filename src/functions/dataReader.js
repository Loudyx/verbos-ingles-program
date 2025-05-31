import dat1 from '../data/infinitive-part.json'
import dat2 from'../data/irregular-verbs.json'
import dat3 from'../data/mix-patt.json'
import dat4 from'../data/no-change.json'
import dat5 from'../data/patt-I-A-U.json'
import dat6 from'../data/same-past-participe.json'
import dat7 from'../data/stranges.json'
import dat8 from'../data/t-tten-patt.json'
import dat9 from'../data/unique.json'

export const getAllData = () => {
  let data = [...dat1]; // Hacer copia para no modificar el original
  data = data.concat(dat2, dat3, dat4, dat5, dat6, dat7, dat8, dat9);
  console.log(data);
  return data;
};


