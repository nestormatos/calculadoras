/* Validates a tool page: extracts inline <script> (no src), syntax-checks it,
   counts '@@' markers, and checks <div>/</div> balance. Usage: node _validate.js <file> */
'use strict';
var fs = require('fs');
var path = require('path');
var os = require('os');
var { execSync } = require('child_process');
var file = process.argv[2];
var html = fs.readFileSync(file, 'utf8');
var m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.log('NO INLINE SCRIPT'); process.exit(1); }
var tmp = path.join(os.tmpdir(), 'ph_check_' + Date.now() + '.js');
fs.writeFileSync(tmp, m[1], 'utf8');
try { execSync('node --check "' + tmp + '"', { stdio: 'pipe' }); console.log('script: syntax OK'); }
catch (e) { console.log('script: SYNTAX ERROR\n' + e.stderr); process.exit(1); }
var at = (html.match(/@@/g) || []).length;
var open = (html.match(/<div(\s|>)/g) || []).length;
var close = (html.match(/<\/div>/g) || []).length;
console.log('@@ markers: ' + at + ' | <div>: ' + open + ' | </div>: ' + close + (open === close ? ' (balanced)' : ' (MISMATCH)'));
fs.unlinkSync(tmp);
