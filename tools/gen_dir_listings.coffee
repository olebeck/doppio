#! /usr/bin/env coffee

# Check if we're in the right directory.
fs = require 'fs'
path = require 'path'

gdl_path = path.resolve('./tools/gen_dir_listings.coffee')

# Sanity check.
if !path.existsSync(gdl_path)
  console.error "Please run this in the base doppio directory."
  return

# Create / and /home to bootstrap everything.
fsobj =
  home:
    doppio: {}

symLinks = {}

rdSync = (dpath, parentObj, name) ->
  files = fs.readdirSync(dpath)
  parentObj[name] = {}
  for file in files
    # Ignore hidden files.
    if file[0] == '.'
      continue

    fpath = dpath + '/' + file
    fstat = fs.statSync(fpath)
    lstat = fs.lstatSync(fpath)

    # Avoid infinite loops.
    if lstat.isSymbolicLink()
      if !symLinks[lstat.dev]? then symLinks[lstat.dev] = {}
      # Ignore; we've seen it before
      if symLinks[lstat.dev][lstat.ino]? then continue
      symLinks[lstat.dev][lstat.ino] = 0

    if fstat.isDirectory()
      rdSync(fpath, parentObj[name], file)
    else
      parentObj[name][file] = null

# Gogogogo!
cur_dir = process.cwd()
rdSync(cur_dir, fsobj['home'], 'doppio')

process.on('exit', (-> console.log JSON.stringify(fsobj)))
