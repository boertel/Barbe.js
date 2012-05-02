module("Rendering");

test("static template", 1, function () {
    equal(new Barbe.View("template-static").render(), "This is a static template.");
});

test("partial template", 1, function () {
    equal(new Barbe.View("template-partial").render(), "Include another template: This is a static template.");
});

test("basic template", 1, function () {
    equal(new Barbe.View("template-basic", {data: {name: "Barbe.js"}}).render(), "This is a basic template created with Barbe.js");
});

test("altered response", 1, function () {
    var cb = function (response) {
        response.nameUpperCase = response.name.toUpperCase();
        return response;
    };
    equal(new Barbe.View("template-alteration", {data: {name: "Barbe.js"}, success: cb}).render(), "This is a template created with Barbe.js and the data has been altered: BARBE.JS.");
});

module("Anchor");

test("defines in javascript", 1, function () {
    var anchor = "anchor-javascript-anchor";
    var view = new Barbe.View("template-anchor", {data: {name: "Barbe.js"}}, anchor);
    equal(view.anchor.id, anchor);
});

test("is undefined", 1, function () {
    try {
        var view = new Barbe.View("template-static", {}, "anchor-undefined");
    } catch (e) {
        ok(true, "exception has been throwed");
    }
});


module("Asynchronous");

asyncTest("get data", 1, function () {
    var view = new Barbe.View("template-api", {
        url: "https://api.github.com/users/boertel",
        dataType: "jsonp"
    }).grow(function () {
        start();
        equal($("#anchor-api").html(), "Benjamin Oertel");
    });
});

asyncTest("altering response", 1, function () {
    var view = new Barbe.View("template-api-advanced", {
        url: "https://api.github.com/users/boertel",
        dataType: "jsonp",
        success: function (response) {
            response.data.name = response.data.name.toUpperCase();
            return response;
        }
    }).grow(function () {
        start();
        equal($("#anchor-api-advanced").html(), "BENJAMIN OERTEL");
    });
});
