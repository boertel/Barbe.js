/* 
* barbe.js – 
*/
(function () {
    "Barbe:nomunge";
    var Barbe = {
        html: {},
        templateSystem: {
            compile: Mustache.to_html,
            type: ['text/html']
        },

        add: function (name, str_template, anchor) {
            if (Barbe.html.hasOwnProperty(name)) {
                throw "You've already got a template by the name: \"" + name + "\"";
            }
            else {
                Barbe.html[name] = str_template;
                // TODO move to Barbe.templates[name]
                Barbe[name] = function (data) {
                    data = data || {};
                    return Barbe.templateSystem.compile(Barbe.html[name], data, Barbe.html);
                };
                if (typeof anchor !== "undefined") {
                    var element = document.getElementById(anchor);
                    if (element !== null) {
                        element.innerHTML = Barbe[name]();
                    }
                }
            }
        },
        grab: function () {
            scripts = document.scripts || document.getElementsByTagName('script');
            for(var i = 0, len = scripts.length; i < len; i++) {
                var s = scripts[i];
                if (Barbe.templateSystem.type.indexOf(s.type) !== -1) {
                    Barbe.add(s.id, s.innerHTML, s.getAttribute("data-anchor"));
                }
            }
        }
    };

    // Barbe.View
    Barbe.View = function () {
        var args = arguments[0] || {};
        this.template = args.template;
        this.anchor = args.anchor;
        // function (data, callback) where data is the parameters for the api call and callback is this.castAnchor
        this.provider = args.provider;
        this.data = args.data || {};
    };
    Barbe.View.prototype.render = function (response) {
        // Mustache doesn't like array as data, so we have to create a dumb object named "array" that contained the array
        if (Array.isArray(response)) {
            response = {array: response};
        }
        this.response = response;
        if (Barbe[this.template] !== undefined) {
            this.view = Barbe[this.template](response, true);
            return this.view;
        }
    };
    Barbe.View.prototype.castAnchor = function (response, after) {
        var rendered, element;

        rendered = this.render(response);
        element = document.getElementById(this.anchor);
        if (element !== null) {
            element.innerHTML = rendered;
            after && after.call(this, element);
        }
    };
    Barbe.View.prototype.draw = function (after) {
        if (this.provider !== undefined) {
            var callback = function (response) {
                this.castAnchor(response, after);
            };
            this.provider.call(this, this.data, callback);
        }
        else {
            this.castAnchor(this.data, after);
        }
    };

    window.Barbe = Barbe;
    Barbe.grab();
})();

if(!Array.isArray) {
    Array.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}
