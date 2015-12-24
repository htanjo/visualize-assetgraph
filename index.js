'use strict';

var AssetGraph = require('assetgraph');
// new AssetGraph()
  // .loadAssets('https://github.com/')
new AssetGraph({root: 'www'})
  .loadAssets('**/*.html')
  .populate({followRelations: {type: AssetGraph.query.not(['HtmlAnchor'])}})
  .writeStatsToStderr()
  .drawGraph('dist/assetgraph.svg')
  .run(function (err, assetGraph) {
    if (err) {
      console.error(err);
      return;
    }
    console.log('\ndone!');
  });
