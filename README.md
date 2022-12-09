# xufs

A convenient library 📚 to extent the capabilities from `fs` node.js library, where all of the applied functions are **automatically recursive** and _async_ (unless the sync version is used if applicable).

## assertf

Throws an `error` when a passed file or files do not exists

## search

Based on a [`predicate`](https://stackoverflow.com/questions/1344015/what-is-a-predicate) returns a `string` Array containing all **matches**.

## throu

Iterates recursively given throu the folder names and upon the observe option executes a `watcher` every time it passes `files`, `folders` or `both`.

## read

Reads the contents from a file and returns it as a `string` object.

## extract

Extracts the contents from a file and returns it as a `Buffer` object.

## mkdir

Will create a directory and all of its predecesors if does not exist.

## copy

Copies content _from_ one place _to_ another.

- If the source is the same as the destination, all the contents will be copied exactly as they are.
- If the source is a **file** and the destination a **folder** a copy from the file will be copied to the folder
- If the source is a **folder** and the destination a **file** will `throw` an Error

## destroy

Will remove from the disk a directory and all of its descendants if exist.

## empty

Will remove from the disk all the inner content from a directory.

## findSync

Finds synchronously a file with possible extensions withing a route

## resolve

Reolves a set of paths forcing the _base folder_ to be current **working directory** (uses `cwd`).

## pipe

Pipes functions to apply multiple actions to some content
