"use strict";

import path from "path";

function splitWords(res) {
  let p = res.path;
  let name = res.name;
  if (name.match(/^[\D]+[\d]+$/)) {
    // Spawn101 --> Spawn 101
    name = name.replace(/(\D+)(\d+)/, '$1 $2');
  }
  const splitPattern = '(\\W|\\-|_|\\(|\\)|\\[|\\]|\\{|\\}|\\.)';
  const regex = new RegExp(splitPattern, 'g');
  let pureDigitsIdx = -1;
  res.words = name
    .replace(/^(\d+\w+)/g, '')
    .split(regex)
    .filter(s => s && s.replace(regex, ''))
    .filter((s, i) => {
      if (pureDigitsIdx > -1 && i > pureDigitsIdx) {
        return false;
      }
      let pureDigits = s.match(/^(\d+)$/);
      if (pureDigits) {
        pureDigitsIdx = i;
      }
      return !pureDigits
    })
    .map(s => s.toLowerCase());
}

function calcWeights(object) {
  const ret = [];
  for (const p in object) {
    if (object.hasOwnProperty(p)) {
      let names = object[p];

      for (let name of names) {
        let s = p + path.sep + name;
        let ext = path.extname(name);
        if (ext) {
          name = name.replace(ext, '');
        }
        const res = {source: s, path: p, name: name, ext: ext};
        splitWords(res);
        ret.push(res);
      }
    }
  }
  for (const item of ret) {
    item.weights = item.words.map(w => 0);
  }

  for (let i = 0; i < ret.length; i++) {
    const item = ret[i];
    for (let wordIdx = 0; wordIdx < item.words.length; wordIdx++) {

      if (item.weights[wordIdx] === 0) {
        // untouched:
        const word1 = item.words[wordIdx];
        let j = i + 1;

        while (j < ret.length) {
          let item2 = ret[j];
          if (wordIdx < item2.words.length && word1 === item2.words[wordIdx]) {
            item.weights[wordIdx] = item.weights[wordIdx] + 1;
          } else {
            for (let a = i + 1; a < j; a++) {
              ret[a].weights[wordIdx] = item.weights[wordIdx];
            }
            break;
          }
          j++;
        }
        // Sync weights of corresponding items:
        for (let a = i + 1; a < j; a++) {
          ret[a].weights[wordIdx] = item.weights[wordIdx];
        }
      } // if untouched

    } // for words
  } // for ret

  return ret;
}

function calcTargets(ret) {
  for (const item of ret) {
    const weights = item.weights;
    const words = item.words;

    let lastIdx = 0;
    let lastWeight = weights[lastIdx];

    item.target = '';
    if (lastWeight === 0) {
      item.target = '';/*item.path + path.sep +*/
      //item.name + item.ext;

    } else {

      for (let i = 0; i < weights.length; i++) {
        if ((weights[i] < lastWeight && weights[i] === 0 /*&& words[lastIdx].length > 3*/) || i === weights.length - 1) {
          let sliceEnd = weights[i] === 0 ? i : i + 1;
          item.target = item.target + words.slice(lastIdx, sliceEnd).join('-') + path.sep;
          lastIdx = i;
          lastWeight = weights[i];
        }
        if (weights[i] === 0) {
          break;
        }
      }
      item.target = item.target + item.name + item.ext;
    }
  }
  return ret;
}

function calcSubDirectories(ret, options) {
  const targetDir = options.targetDir ? options.targetDir : '';
  const diverseSubDir = options.diverseSubDir ? options.diverseSubDir : '_diverse';
  for (const item of ret) {
    if (!item.target) {
      item.target = path.join(...[targetDir, diverseSubDir, (item.name + item.ext)]);
    } else {
      const frags = [targetDir];
      if (options.targetDir) {
        frags.push(item.target.substr(0, 1).toLowerCase())
      }
      frags.push(item.target);
      item.target = path.join(...frags);
    }
  }
}

function fixGermanUmlauts(ret) {
  for (const item of ret) {
    item.target = item.target
      .replace(/ä/g, 'ae')
      .replace(/Ä/g, 'Ae')
      .replace(/ü/g, 'ue')
      .replace(/ü/g, 'ue')
      .replace(/Ü/g, 'Ue')
      .replace(/ö/g, 'oe')
      .replace(/Ö/g, 'Oe')
      .replace(/ß/g, 'ss')
    ;
  }
  return ret;
}

function killSonderzeichen(ret) {
  for (const item of ret) {
    item.target = item.target
      .replace(/[^a-zA-Z0-9\\()\[\]\-_\\.: ]/g, '');
  }
  return ret;
}

export function regroup(object, options) {
  let ret = calcWeights(object);

  calcTargets(ret);
  calcSubDirectories(ret, options);

  if (options.fixGermanUmlauts) {
    fixGermanUmlauts(ret);
  }

  if (options.killSonderzeichen) {
    killSonderzeichen(ret);
  }

  return ret;
}
