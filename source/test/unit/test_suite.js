Test.Unit.extend({
  TestSuite: new JS.Class({
    include: Enumerable,

    extend: {
      STARTED:  'Test.Unit.TestSuite.STARTED',
      FINISHED: 'Test.Unit.TestSuite.FINISHED',

      forEach: function(tests, block, continuation, context) {
        var looping    = false,
            pinged     = false,
            n          = tests.length,
            i          = -1,
            breakTime  = new Date().getTime(),
            setTimeout = this.setTimeout;

        var ping = function() {
          pinged = true;
          var time = new Date().getTime();

          if (Console.BROWSER && (time - breakTime) > 1000) {
            breakTime = time;
            looping = false;
            setTimeout(iterate, 0);
          }
          else if (!looping) {
            looping = true;
            while (looping) iterate();
          }
        };

        var iterate = function() {
          i += 1;
          if (i === n) {
            looping = false;
            return continuation && continuation.call(context || null);
          }
          pinged = false;
          block.call(context || null, tests[i], ping);
          if (!pinged) looping = false;
        };

        ping();
      },

      // Fun fact: in IE, typeof setTimeout === 'object'
      setTimeout: (function() {
        return (typeof setTimeout === 'undefined')
               ? undefined
               : setTimeout;
      })()
    },

    initialize: function(metadata, tests) {
      this._metadata = metadata;
      this._tests    = tests;
    },

    forEach: function(block, continuation, context) {
      this.klass.forEach(this._tests, block, continuation, context);
    },

    run: function(result, continuation, callback, context) {
      if (this._metadata.fullName)
        callback.call(context || null, this.klass.STARTED, this);

      this.forEach(function(test, resume) {
        test.run(result, resume, callback, context)

      }, function() {
        if (this._metadata.fullName)
          callback.call(context || null, this.klass.FINISHED, this);

        continuation.call(context || null);

      }, this);
    },

    size: function() {
      var totalSize = 0, i = this._tests.length;
      while (i--) {
        totalSize += this._tests[i].size();
      }
      return totalSize;
    },

    empty: function() {
      return this._tests.length === 0;
    },

    metadata: function() {
      return JS.extend({size: this.size()}, this._metadata);
    }
  })
});

