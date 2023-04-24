import mm from 'music-metadata';
import { promises as fsp } from 'fs';
import path from 'path';

const dryRun = false;
let fileCount = 0;
let dirCount = 0;
let errorCount = 0;

const sanitize = str => str.replace(/[\\/:*?"<>|]/g, '');

const organize = async (srcPath, outPath) => {
  const srcDir = await fsp.opendir(srcPath);
  for await (const srcEnt of srcDir) {
    const srcFile = path.resolve(srcPath, srcEnt.name);
    if (srcEnt.isDirectory()) {
      dirCount += 1;
      await organize(srcFile, outPath); // flatten!
    } else {
      fileCount += 1;
      try {
        const metadata = await mm.parseFile(srcFile);
        const { year, albumartist, artist, album, title, disk, track } = metadata.common;
        const trackNo = disk && disk.no > 0 ? `${disk.no}__${track.no}` : `${track.no}`;
        const ext = path.extname(srcEnt.name);
        const dirName = `${year}__${sanitize(albumartist || artist)}__${sanitize(album)}`;
        const outName = `${dirName}/${trackNo}__${sanitize(title)}${ext}`;
        const outFile = path.resolve(outPath, outName);
        console.log(srcFile, '-->', outFile);
        if (!dryRun) {
          await fsp.mkdir(path.resolve(outPath, dirName), { recursive: true });
          await fsp.copyFile(srcFile, outFile);
        }
      } catch (e) {
        errorCount += 1;
        console.error(e);
      }
    }
  }
};

export const main = async () => {
  const srcPath = path.resolve('c:\\users\\iolo\\downloads\\music');
  const outPath = path.resolve('c:\\users\\iolo\\downloads\\mp3');
  await organize(srcPath, outPath);
  console.log(`${fileCount} files in ${dirCount} directories (${errorCount} errors occurred)`);
};
