"use strict";

import path from "path";
import fs from "fs";
import shell from "shelljs";
import log from "npmlog";
import walk from "walkdir";
import {regroup} from "./regroup.mjs";


function createStructure(rows) {
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
  return o;
}

export async function scan(dirarr) {
  for (const dir of dirarr) {
    if (!dir) {
      throw new Error('Parameter dir is missing: ' + dir);
    }
  }
  let back = [];
  for (const dir of dirarr) {
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

    const ret = [];
    for (let [p, stat] of Object.entries(result)) {
      // if (path.endsWith('.js')) {
      if (stat.size > 0) {
        // log.info(`${path} mode:${stat.mode} size: ${stat.size}`);
        let ext = path.extname(p);
        if (ext === '.cbr' || ext === '.cbz') {
          ret.push(p);
        }
      }
    }
    back.push(...ret.sort());
  } // for
  return back;
}


function save2disk(filename, data) {
  let dir = path.dirname(filename);
  shell.mkdir('-p', dir);

  fs.writeFileSync(filename, data, (err) => {
    if (err) throw err;
    console.log('Saved!', file);
  });
}

async function test() {
  let rows = await scan([
    'e:/leeching/',
    'y:/ebooks/comics/_deu/__temp'
  ]);
  save2disk('./out/files.txt', rows.join('\n'));

  const o = createStructure(rows);
  save2disk('./out/struc.json', JSON.stringify(o, null, 2));

  let actions = regroup(o);
  save2disk('./out/actions.json', JSON.stringify(actions, null, 2));
}

test();
