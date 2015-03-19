var Promise = require('bluebird');
var _ = require('lodash');
var fs = Promise.promisifyAll(require('fs'));
var markdown = require('markdown').markdown;
var request = require('request');
var url = require('url');

function getLinks(tree) {
  var links = [];

  if (!_.isArray(tree)) {
    return links;
  }

  if (tree[0] === 'link') {
    // Only absolute links
    var urlObj = url.parse(tree[1].href);
    if (urlObj.protocol) {
      links = [tree[1].href];
    }
  } else {
    links = _.flatten(_.map(tree.slice(1), getLinks));
  }
  return links;
}

fs.readFileAsync(__dirname + '/../README.md', 'utf8')
  .then(function (text) {
    var tree = markdown.parse(text);
    var links = getLinks(tree);

    // Get linked pages in parallel
    Promise.map(links, function (link) {
      return new Promise(function (resolve, reject) {
        request.head(link, {rejectUnauthorized: false, timeout: 5000},
            function (error, response, body) {
          // Always resolve (do not fail fast).
          if (error) {
            resolve({
              link: link,
              error: error
            });
          } else {
            resolve({
              link: link,
              status: response.statusCode
            });
          }
        });
      });
    }, {concurrency: 10})
      .then(function (results) {
        return _.filter(results, function (result) {
          return result.error || result.status !== 200;
        });
      })
      .then(function (results) {
        // With bad links, we need to do a little manual confirmation.
        // For example, if we get an error, it's possible the endpoint 
        // does not respond to head.
        console.log(results);
      });
  });
