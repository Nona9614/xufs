import * as fs from "fs";
import * as path from "path";

import * as process from 'process';
import lienzo from "./lienzo";

import { FgExIchor, ExDefault, FgExOrange, SpLine, FgExAmber, FgExCoral, FgExBlood, FgExString } from 'node-lienzo';


export const isFolder = (value: string) => !value.includes(".");

/**
 * Asserts when a file or files do not exists
 */
export function assertf(...filenames: string[]) {
  for (const filename of filenames) {
      if (!fs.existsSync(filename)) throw new Error(`File does not exists:\n${FgExIchor}${filename}${ExDefault}`);        
  }
}

/**
 * Returns the directories from the folder
 * @param folder The folder to get the directories
 */
export function readdir(folder: string) {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(folder, function (error, files) {
      if (error) reject(error);
      else resolve(files);
    });
  });
}

type SearchPredicate = (pathname: string) => boolean;
async function _search(folder: string, predicate: SearchPredicate, found: string[] = []) {
  const dirs = await readdir(folder);
  for (let i = 0; i < dirs.length; i++) {
    const dir = path.join(folder, dirs[i]);
    const isValid = predicate(dir);
    if (isValid) found.push(dir);
    // Recursively resolve folders
    if (isFolder(dir)) found = await _search(dir, predicate, found);
  }
  return found;
}

/**
 * Based on the predicate to match returns an array of pathnames
 * @param folders The folders to search
 * @param predicate How validate the search
 */
export async function search(predicate: SearchPredicate, ...folders: string[]) {
  let found: string[] = [];
  for (const folder of folders) {
    found = await _search(folder, predicate, found)
  }
  return found;
}

type ThrouWatcher = (pathname: string) => Promise<void> | void
type ThrouObserve = 'files' | 'folders' | 'both';
export async function _throu(
  pathname: string,
  watcher: ThrouWatcher,
  observe: ThrouObserve
) {
  const dirs = await readdir(pathname);
  for (let i = 0; i < dirs.length; i++) {
    const dir = path.join(pathname, dirs[i]);
    const _isFolder = isFolder(dir);
    if (
      (observe === "files" && !_isFolder) ||
      (observe === "folders" && _isFolder) ||
      observe === "both"
    ) {
      await watcher(pathname);
    }

    // Recursively resolve folders
    if (_isFolder) await _throu(dir, watcher, observe);
  }
}

/**
 * Iterates recursively given throu the folder names
 * and executes the `watcher` every time it passes a file
 * @param folders The folders to search
 * @param context
 * @param context.watcher Watches for each iteration
 * @default context Observes both files and folders
 */
 export async function throu(context: {
  watcher: ThrouWatcher,
  observe?: ThrouObserve
 }, ...folders: string[]) {
  const observe = context.observe ? context.observe : 'both';
  for (const folder of folders) {
    await _throu(folder, context.watcher, observe);
  }
}

function _read(filename: string, encoding?: BufferEncoding) {
  return new Promise<any>((resolve, reject) => {
      if (!fs.existsSync(filename)) reject(Error(`File does not exists:\n${FgExIchor}${filename}${ExDefault}`));
      else {
          fs.readFile(filename, {
            encoding,
          }, (error, data) => {
              if (error) reject(error);
              else resolve(data);
          });      
      }
  });
}
/**
 * Reads the content from a file as `String`
 * @param filename The file to be readed
 */
export async function read(filename: string, encoding: BufferEncoding = 'utf-8') {
  const content = await _read(filename, encoding) as string
  return content;
}

/**
 * Extracts the content from a file as `Buffer`
 * @param filename The file to be readed
 */
 export async function extract(filename: string) {
  const content = await _read(filename) as Buffer;
  return content;
}

/**
 * Creates a folder
 * @param pathname The relative path to create the folder
 * @remarks If a filename is passed, a folder with the pathname will be created
 */
export function mkdir(pathname: string) {
  return new Promise<void>((resolve, reject) => {
    const route = isFolder(pathname) ? pathname : path.dirname(pathname);
    if (fs.existsSync(route)) resolve();
    else {
      fs.mkdir(route, (error) => {
        if (error) reject(error);
        else {
          lienzo.function("Folder created").line().string(route).line().print();
          resolve();
        }
      });
    }
  });
}

/**
 * Creates a folder synchonously
 * @param pathname The relative path to create the folder
 * @remarks If a filename is passed, a folder with the pathname will be created
 */
 export function mkdirSync(pathname: string) {
  const route = isFolder(pathname) ? pathname : path.dirname(pathname);
  if (fs.existsSync(route)) return;
  fs.mkdirSync(route);
  lienzo.function("Folder created").line().string(route).line().print();
}

function _write(filename: string, data: string | Buffer, append = false) {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(
      filename,
      append ? `${data}\r\n` : data,
      {
        encoding: "utf-8",
        flag: append ? "a+" : "w",
      },
      (error) => {
        if (error) reject(error);
        else {
            lienzo.null("File created").line().string(filename).line().print();
            resolve();
        }
      }
    );
  });
}

export function writeSync(
  filename: string,
  data: string | Buffer,
  append: boolean
) {
  mkdirSync(filename);
  fs.writeFileSync(filename, data, {
    encoding: "utf-8",
    flag: append ? "a+" : "w",
  });
}

export function readSync(filename: string) {
  return fs.readFileSync(filename, { encoding: "utf-8" });
}

export async function write(filename: string, data: string | Buffer, append = false) {
  await mkdir(filename);
  await _write(filename, data, append);
}

async function _copy(from: string, to: string, append = false, fallback = "copy", recursions = 0) {

  const isFromFolder = isFolder(from);
  const isToFolder = isFolder(to);

  if (recursions >= 50) throw new Error(`${recursions} recursions reached, process stop before memory leak`);

  if (!(from && to)) throw new Error(`Not valid values input paths for copy:\nfrom:\n${from}\nto:\n${to}\n`); 
  const _fallback = path.isAbsolute(fallback) ? fallback : path.resolve(process.cwd(), fallback);

  if (isFromFolder && isToFolder) {
      await mkdir(to);
      const dirs = await readdir(from);
      for (const dir of dirs) {
          await _copy(path.join(from, dir), path.join(to, dir), append, _fallback, recursions + 1);
      }
  } else if (!isFromFolder && !isToFolder) {
      const data = await _read(from);
      await _write(to, data, append);
  } else if (!isFromFolder && isToFolder) {
      const _to = path.isAbsolute(to) ? to : path.resolve(_fallback, to);
      await mkdir(_to);
      const name = path.basename(from);
      const data = await _read(from);
      await _write(path.resolve(_to, name), data, append);
  } else if (isFromFolder && !isToFolder)  {
      throw Error(`If 'from' is a folder, 'to' cannot be a file:\nfrom:\n${from}\nto:\n${to}\n`);
  }
}

/**
 * Copies content from one place to another
 * @param from The folder or file to copy from
 * @param to The folder or file to place the content
 * @param append If set to true the content will be attached instead of overwrite the files
 * @param fallback A fallback folder in case no folder fo place the copied content is found
 */
export function copy(from: string, to: string, append = false, fallback = "copy") {
  return _copy(from, to, append, fallback);
}

/**
 * Removes a file from the disk
 * @param filename The file to remove from the disk
 */
export function destroy(filename: string) {
  return new Promise<void>((resolve, reject) => {
      fs.rm(filename, {
          recursive: true
      }, function (error) {
          if (!fs.existsSync(filename)) resolve();
          else if (error) reject(error)
          else resolve();
      })
  })
}

function _empty(folder: string) {
  return new Promise<void>((resolve, reject) => {
      fs.rm(folder, {
          recursive: true
      }, function (error) {
          if (!fs.existsSync(folder)) resolve();
          else if (error) reject(error)
          else resolve();
      })
  })
}

/**
 * Finds synchronously a file with possible extensions withing a route
 * @returns the path if found otherwise `null`
 */
export function findSync(route: string, filename: string, extensions: string[]) {
  const tries: string[] = []
  for (const extension of extensions) {
    const posibility = path.join(route, filename) + extension;
    tries.push(posibility);
    if (fs.existsSync(posibility)) return { extension, found: posibility, tries };
  }
  return { extensions, found: null, tries };
}

/**
 * Removes all files and folders inside a folder
 * @param folder The file to remove from the disk
 * @param create Creates folder if not exists
 */
export async function empty(folder: string, create: boolean) {
  if (create && !fs.existsSync(folder)) await mkdir(folder);
  await _empty(folder);
}

/** Resolves folders and uses as base the current working working directory */
export function resolve(...paths: string[]) {
  return path.resolve.apply(path, [process.cwd(), ...paths])
}
