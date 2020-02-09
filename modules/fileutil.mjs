"use strict";

import fse from "fs-extra";
import child_process from "child_process";
import os from "os";
import log from "npmlog";
import mkdirp from "mkdirp";
import path from "path";

let exec = child_process.exec;
let platform = os.platform();
let osx = platform === 'darwin';

function slash2backSlash(s) {
  return s.replace(/\//g, '\\');
}

export async function move(source, target) {

  const targetDir = path.dirname(target);

  await mkdirp(targetDir);

  let cmd = osx ?
    ('mv "' + source + '" "' + target + '"') :
    ('move /Y "' + slash2backSlash(source) + '" "' + slash2backSlash(target) + '"');

  log.info('cmd move(): ', cmd);

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      log.warn('cmd error. Second try via fse.');
      log.info('fse.move(): ', source, target);
      fse.move(source, target, error => {
        log.error('cmd error: ', error);
      });
    }
  });

}
