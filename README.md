xufs 
================================

A convenient library 📚 to extent the capabilities from `fs` node.js library, where all of the applied functions are __automatically recursive__ and _async_ (unless the sync version is used if applicable).

assertf
---------------------------------
Throws an `error` when a passed file or files do not exists

readdir
---------------------------------
Returns all tthe directories and subdirectories from a folder as a `string` Array.

search
---------------------------------
Based on a [`predicate`](https://stackoverflow.com/questions/1344015/what-is-a-predicate) returns a `string` Array containing all __matches__.

read
---------------------------------
Reads the contents from a file and returns it as a `Buffer` object.

mkdir
---------------------------------
Will create a directory and all of its predecesors if does not exist.

copy
---------------------------------
Copies content _from_ one place _to_ another.
* If the source is the same as the destination, all the contents will be copied exactly as they are.
* If the source is a __file__ and the destination a __folder__ a copy from the file will be copied to the folder
* If the source is a __folder__ and the destination a __file__ will `throw` an Error

destroy
---------------------------------
Will remove from the disk a directory and all of its descendants if exist.

empty
---------------------------------
Will remove from the disk all the inner content from a directory.

findSync
---------------------------------
Finds synchronously a file with possible extensions withing a route

resolve
---------------------------------
Reolves a set of paths forcing the _base folder_ to be current __working directory__ (uses `cwd`).
