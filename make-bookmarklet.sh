#!/usr/bin/env bash
SOURCE=copyfiles.js
DESTINATION=copyfiles-bookmarklet.js

uglify=$(which uglifyjs)
if [ "$uglify" == "" ]; then
  echo "uglifyjs command not found. Install it via npm install -g uglify-js"
  exit 0
fi

cat <(echo -n "javascript:") <(uglifyjs $SOURCE) > $DESTINATION

echo "Bookmarklet generated in $DESTINATION"
