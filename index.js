"use strict";

import path from "path";
import log from "npmlog";
import walk from "walkdir";

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
    filter: (path, files) => {
      return files.filter(n => n.indexOf('.git') === -1);
    }
  };
  let result = await walk.async(dir, walkOptions);

  //console.info(JSON.stringify(result,null,4));
  let count = 0;
  let js = 0;
  for (let [path, stat] of Object.entries(result)) {
    if (path.endsWith('.js')) {
      log.log(`${path} mode:${stat.mode} size: ${stat.size}`);
      js++;
    }
    count++;
  }

  log.info('count', count);
  log.info('js', js);

}


scan('./..');
