"use strict";

import path from "path";
import fs from "fs";
import shell from "shelljs";
import log from "npmlog";
import walk from "walkdir";
import {regroup} from "./modules/regroup.mjs";
import {move} from "./modules/fileutil.mjs";

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

async function scan(dirarr) {
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
        if (p.indexOf('.') === 0) return [];
        return files;
      }
    };
    let result = await walk.async(dir, walkOptions);

    const ret = [];
    for (let [p, stat] of Object.entries(result)) {
      if (stat.size > 0) {
        let ext = path.extname(p);
        if (ext === '.cbr' || ext === '.cbz' || ext === '.CBR' || ext === '.CBZ') {
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
    log.log('Saved!', file);
  });
}

export async function group(options) {

  if (options.silent || options.quite) {
    log.level = 'error';
  }

  let rows = await scan(options.sourceDirs);
  if (options.logFileList) {
    save2disk(options.logFileList, rows.join('\n'));
  }

  const o = createStructure(rows);
  if (options.logStructure) {
    save2disk(options.logStructure, JSON.stringify(o, null, 2));
  }


  let actions = regroup(o, options);
  if (options.logDebugList) {
    save2disk(options.logDebugList, JSON.stringify(actions, null, 2));
  }

  if (options.logActionList) {
    let simple = actions.map(item => {
      return {
        source: item.source,
        target: item.target
      };
    });
    save2disk(options.logActionList, JSON.stringify(simple, null, 2));
  }

  if (!options.logOnly) {
    for (const action of actions) {
      await move(action.source, action.target);
    }
  }
}


async function test() {
  let options = {
    sourceDirs: [
      'f:/ebooks/_deu/__temp3'
      // 'e:/leeching',
      // 'e:/leeching/comics',
      // 'f:/ebooks/_deu/__temp2'
    ],
    targetDir: 'f:/ebooks/_deu/__temp2', //'e:/leeching-out',
    diverseSubDir: '_diverse',
    extraSubDirFirstLetterLowercase: true,
    fixGermanUmlauts: true,
    killSonderzeichen: true,

    logOnly: false,
    logFileList: './out/00_files.txt',
    logStructure: './out/01_struc.json',
    logDebugList: './out/02_debug.json',
    logActionList: './out/03_actions.json',
  };
  await group(options);
}

test();
