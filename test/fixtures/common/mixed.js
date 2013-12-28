
module("Module 19");

test("a basic test example", function() {
    var value = "hello";
    equal(value, "hello", "We expect value to be hello");
});

test("a failing test example", function() {
    var value = "hello";
    equal(value, "world", "We expect to fail");
});

test("another failing test example", function () {
    var value = "hello";
    equal(value, "world");
});
