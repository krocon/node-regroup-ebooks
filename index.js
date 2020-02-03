"use strict";

import path from "path";
import fs from "fs";
import shell from "shelljs";
import log from "npmlog";
import walk from "walkdir";


export function writeFile(file, rows) {
  let dir = path.dirname(file);
  shell.mkdir('-p', dir);

  fs.writeFileSync(file, rows.join('\n'), (err) => {
    if (err) throw err;
    console.log('Saved!', file);
  });

  const o = {};
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let d = path.dirname(row);
    let name = path.basename(row);
    if (o[d]) {
      o[d].push(name);
    } else {
      o[d] = [name];
    }
  }

  fs.writeFileSync('./out/raw.json', JSON.stringify(o, null, 2), (err) => {
    if (err) throw err;
    console.log('Saved!', file);
  });
}

export async function scan(dir) {

  if (!dir) {
    return log.error('nsd', 'Parameter dir is missing');
  }

  let p = path.normalize(dir);
  log.info('nsd', 'Scanning ', p);

  const walkOptions = {
    return_object: true,
    no_return: false,
    find_links: false,
    filter: (p, files) => {
      // console.info('path', p); // TODO weg
      // console.info('       files', files); // TODO weg

      if (p.indexOf('.') === 0) return [];

      return files;
      // return files.filter(n => {
      //   let ext = path.extname(n);
      //   return ext === '.js'; // || n.indexOf('.') === -1;
      // });
    }
  };
  let result = await walk.async(dir, walkOptions);

  //console.info();
  // console.info('\n\n--------------------');
  // let count = 0;
  // let js = 0;
  const ret = [];
  for (let [p, stat] of Object.entries(result)) {
    // if (path.endsWith('.js')) {
    if (stat.size > 0) {
      // log.info(`${path} mode:${stat.mode} size: ${stat.size}`);
      let ext = path.extname(p);
      if (ext === '.js') {
        ret.push(p);
      }
      // js++;
    }
    // count++;
  }
  // log.info('count', count);
  // log.info('js', js);
  return ret.sort();
}


async function test() {
  let ret = await scan('./');
  console.info(ret);
  writeFile('./out/demo.txt', ret);
}

test();
