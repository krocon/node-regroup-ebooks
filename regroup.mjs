"use strict";

import path from "path";

export function regroup(object) {
/*


      var digits = name.match(/(\d)+/g);
      var words = name.match(/(\D)+/g);

      if (digits && digits.length >= 1 && words && words.length >= 2) {

        var folder = words[0];
        //console.info('in ) "'+folder+'"');
        folder = folder
          .replace(/#/g, '')
          .replace(/ Band /g, '')
          .replace(/'/g, '')
          .replace(/(^[\.\s_-]+|[\.\s_-]+$)/g, '');

        if (folder) {
          if (!groups[folder]) groups[folder] = [];
          groups[folder].push(file);
        }
      }
    }

    for (var dir in groups) {
      if (groups.hasOwnProperty(dir)) {
        var files = groups[dir];

        if (files.length >= minGroupSize) {
          groupCount++;
          for (i = 0; i < files.length; i++) {
            var f = files[i];
            rows.push({
              id: idx++,
              base: f.base,
              src: f,
              dir: dir,
              target: {
                dir: targetDir + '/' + dir,
                base: f.base
              }
            });
          }
        }
      }
    }
    return {
      groupCount: groupCount,
      rows: rows
    };
  }

  let para = {
    ignoreBrackets: true,
    minsize: 1,
    targetDir: ''
  };

*/

  function calcName(p, name) {

    // 'die ist (1929) - 01 ein.jpg'.replace(/\[[^\]]+\]/g, '').replace(/\([^\)]+\)/g, '');
    // -->  "die ist  - 01 ein.jpg"

    const splitPattern = '( |\\-|_)';
    const regex = new RegExp(splitPattern, 'g');
    const ws = name
      .split(regex)
      .filter( s => s.replace(regex, ''));

    const digits = name.match(/(\d)+/g);
    const words = name.match(/(\D)+/g);

    if (digits && digits.length >= 1 && words && words.length >= 2) {

      var folder = words[0];
      //console.info('in ) "'+folder+'"');
      folder = folder
        .replace(/#/g, '')
        .replace(/ Band /g, '')
        .replace(/'/g, '')
        .replace(/(^[\.\s_-]+|[\.\s_-]+$)/g, '');

      // if (folder) {
      //   if (!groups[folder]) groups[folder] = [];
      //   groups[folder].push(file);
      // }
    }
    return name;
  }

  const ret = [];
  for (const p in object) {
    if (object.hasOwnProperty(p)) {
      let names = object[p];
      for (const name of names) {
        let s = p + path.sep + name;
        ret.push(
          [
            s,
            calcName(p, name)
          ]
        );
      }
    }
  }

  return ret;
}
