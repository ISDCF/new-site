'use strict';

/* global hexo */

/*
 * Hexo generator that ports the ISDCF Registries site
 * (https://github.com/ISDCF/registries-site) into this Hexo site as native
 * pages, rendered via the theme's own registry.ejs layout.
 *
 * Registry DATA comes from the `external/registries` git submodule
 * (JSON files under src/main/data/). Page copy (descriptive markdown)
 * comes from registries/content/ (ported from
 * registries-site's own content/ directory). See scripts/lib/registries-core.js
 * for the page manifest and all the pure (Hexo-independent) logic.
 *
 * Each returned route is `{ path, layout: ['registry'], data }`. Hexo's own
 * router (see node_modules/hexo/dist/hexo/index.js, createLoadThemeRoute /
 * _routerRefresh) renders `data` through themes/isdcf/layout/registry.ejs
 * and then automatically wraps the result in themes/isdcf/layout/layout.ejs
 * -- exactly the same mechanism used by hexo-generator-index/-archive for
 * normal posts/pages, so no manual view-rendering calls are needed here.
 */

const core = require('./lib/registries-core');
const hexoUrlFor = require('hexo-util').url_for;

hexo.extend.generator.register('registries', function (locals) {
  const md = core.createMarkdownRenderer();

  // Ported content markdown bakes in site-root-absolute hrefs/srcs (see
  // rewriteInternalUrls in registries-core.js). Reuse Hexo's own url_for
  // logic (bound to this site's real config) to fix those up, so they
  // still resolve correctly when config.url has a path component (e.g.
  // "https://isdcf.github.io/new-site/" -> root "/new-site/").
  const urlFor = hexoUrlFor.bind({ config: hexo.config, path: '' });

  const pageRoutes = core.realPages.map(function (pageDef) {
    const sections = core.loadSections(pageDef.pageTemplate, md, urlFor);
    const isRegistryTable = pageDef.pageType === 'registryTable';

    let registryData = null;
    if (isRegistryTable) {
      try {
        registryData = core.loadRegistryData(pageDef.pageTemplate);
      } catch (err) {
        hexo.log.error('[registries] Failed to load registry data for "' + pageDef.pageTemplate + '": ' + err.message);
        registryData = [];
      }
    }

    const navigation = core.getPrevNext(pageDef.pageOrder);

    const data = {
      title: pageDef.pageTitle,
      isRegistry: true,
      pageTemplate: pageDef.pageTemplate,
      pageTitle: pageDef.pageTitle,
      pageType: pageDef.pageType,
      idType: pageDef.idType || null,
      menuLevel: pageDef.menuLevel,
      breadCrumb: pageDef.breadCrumb || null,
      pageOrder: pageDef.pageOrder,
      sections: sections,
      registryData: registryData,
      allPages: core.pages,
      sectionLandingPage: core.SECTION_LANDING_PAGE,
      prevPage: navigation.prev,
      nextPage: navigation.next,
      routePath: core.routePath,
      strip: core.stripIllegalChars
    };

    return {
      // Hexo's router strips the leading slash and appends "index.html" to
      // any path ending in "/" (see hexo/dist/hexo/router.js `_format`), so
      // "/registry/general/" becomes the route "registry/general/index.html".
      path: core.routePath(pageDef.pageTemplate),
      layout: ['registry'],
      data: data
    };
  });

  // Static images referenced by ported content markdown (e.g.
  // "/img/registries/dcnc_ov-vf.jpg"). These live under
  // registries/img/, outside Hexo's normal theme-asset
  // pipeline, so they need their own (layout-less, raw-buffer) routes.
  const imageRoutes = core.loadImageAssets();

  return pageRoutes.concat(imageRoutes);
});
