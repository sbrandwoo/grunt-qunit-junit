
// This test is without a module, but the others will have a module
test("a failing test example", function() {
    var value = "hello";
    equal(value, "world", "We expect to fail");
});

setTimeout(function () {
    module("Module 19");

    // This will need to be XML encoded
    test("A failing test that checks XML encoding", function() {
        var value = "<a>";
        equal(value, "<p>", 'A quote: "We expect to fail"');
    });

    test("a basic test example", function() {
        var value = "hello";
        equal(value, "hello", "We expect value to be hello" );
    });

    test("another basic test example", function() {
        var value = "hello";
        equal(value, "hello", "We expect value to be hello" );
    });

    asyncTest('an async test example', function() {
        var value = "world";
        setTimeout(function() {
            equal(value, "world", "We expect value to be world");
            start();
        }, 500);
    });

    // The / should be replaced with a . with the default classNamer.
    module("Module 20/Stacks");

    // This should have a stack trace!
    test("A failing test that should stack track", function() {
        x = y + 2;
        equal(value, "hello", "We expect value to be hello" );
    });
}, 1);

// This will cause a "global failure" outside of the test modules
x = y + 2;