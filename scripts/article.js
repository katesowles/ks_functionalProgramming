(function(module) {

  function Article (opts) {
    this.author = opts.author;
    this.authorUrl = opts.authorUrl;
    this.title = opts.title;
    this.category = opts.category;
    this.body = opts.body;
    this.publishedOn = opts.publishedOn;
  }

  Article.all = [];

  Article.prototype.toHtml = function() {
    var template = Handlebars.compile($('#article-template').text());

    this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
    this.publishStatus = this.publishedOn ? 'published ' + this.daysAgo + ' days ago' : '(draft)';
    this.body = marked(this.body);

    return template(this);
  };

  Article.loadAll = function(rawData) {
    rawData.sort(function(a,b) {
      return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
    });

    Article.all = rawData.map(function(ele) {
      return new Article(ele);
    });
  };

  Article.fetchAll = function(parsed) {
    if (localStorage.rawData) {
      Article.loadAll(JSON.parse(localStorage.rawData));
      return parsed();
    }
    else {
      $.getJSON('/data/hackerIpsum.json', function(rawData) {
        Article.loadAll(rawData);
        localStorage.rawData = JSON.stringify(rawData); // Cache the json, so we don't need to request it next time.
        return parsed();
      })
  }

  Article.numWordsAll = function() {
    return Article.all.map(function(article) {
      return article.body.split(' ').length; // Grab the words from the `article` `body`; split on the spaces to grab each word
    })
    .reduce(function(a, b) {
      return a + b;// Sum up all the values!
    });
  };

  Article.allAuthors = function() {
    var individualAuthors = Article.all.map(function(currentArticle) {
      return currentArticle.author;
    })
    .reduce(function(previous, next) {
      if (previous.indexOf(next) < 0) {
        previous.push(next);
      }
      return previous;
    })
    return individualAuthors;
  };

  Article.numWordsByAuthor = function() {

    // DONE: Transform each author string into an object with 2 properties: One for the author's name, and one for the total number of words across the matching articles written by the specified author.

    return Article.allAuthors().map(function(author) {
      var articleObject = {};
      articleObject.author = author;
      articleObject.numwords = 0;
      Article.all.forEach(function(thisArticle) {
        if (thisArticle.author == author) {
          articleObject.numWords += thisArticle.body.split(' ').length;
        }
      });
      return articleObject;
      })
  };

})(window);
