'use strict';

/* global hexo */

/*
 * Registers .ejs files under this repo's own layout/ directory as Hexo
 * theme views (same view registry `layout: [...]` routes and the `partial()`
 * helper resolve against), so they behave exactly like files under
 * themes/isdcf/layout/ without actually living inside the isdcf theme
 * submodule.
 *
 * Hexo's `theme.getView()`/`setView()` key views purely by the path passed
 * in -- the underlying file doesn't need to exist under theme_dir (see
 * node_modules/hexo/dist/theme/{index,view}.js) -- so registering content
 * read from an arbitrary path works the same as the theme box's own
 * `layout/*path` processor (node_modules/hexo/dist/theme/processors/view.js).
 *
 * Currently used for registry.ejs and its registry-tables partials (see
 * scripts/registries.js).
 */

const fs = require('fs');
const path = require('path');

const siteLayoutDir = path.join(hexo.base_dir, 'layout');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(function (entry) {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

if (fs.existsSync(siteLayoutDir)) {
  walk(siteLayoutDir).forEach(function (file) {
    const relPath = path.relative(siteLayoutDir, file).split(path.sep).join('/');
    hexo.theme.setView(relPath, fs.readFileSync(file, 'utf8'));
  });
}
