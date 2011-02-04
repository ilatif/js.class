JS.ENV.Test = JS.ENV.Test || {}

Test.AsyncStepsSpec = JS.Test.describe(JS.Test.AsyncSteps, function() {
  include(JS.Test.FakeClock)
  before(function() { clock.stub() })
  after(function() { clock.reset() })
  
  before(function() {
    this.StepModule = JS.Test.asyncSteps({
      multiply: function(x, y, callback) {
        var self = this
        JS.ENV.setTimeout(function() {
          self.result = x * y
          callback()
        }, 100)
      },
      subtract: function(n, callback) {
        var self = this
        JS.ENV.setTimeout(function() {
          self.result -= n
          callback()
        }, 100)
      }
    })
    this.steps = new JS.Singleton(StepModule)
  })
  
  describe("#sync", function() {
    describe("with no steps pending", function() {
      it("runs the callback immediately", function() {
        var result
        steps.sync(function() { result = typeof steps.result })
        assertEqual( "undefined", result )
      })
    })
    
    describe("with a pending step", function() {
      before(function() { steps.multiply(7,8) })
      
      it("waits for the step to complete", function(resume) {
        var result
        assertEqual( undefined, steps.result )
        steps.sync(function() {
          resume(function() { assertEqual( 56, steps.result ) })
        })
        clock.tick(110)
      })
    })
    
    describe("with many pending steps", function() {
      before(function() {
        steps.multiply(7,8)
        steps.subtract(5)
      })
      
      it("waits for all the steps to complete", function(resume) {
        var result
        assertEqual( undefined, steps.result )
        steps.sync(function() {
          resume(function() { assertEqual( 51, steps.result ) })
        })
        clock.tick(210)
      })
    })
  })
})
