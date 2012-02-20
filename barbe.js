/* 
* barbe.js – 
*/
(function () {
    "Barbe:nomunge";
    var Barbe = {
        html: {},
        templates: {},
        settings: {
            template: {
                compile: Mustache.to_html,
                type: ['text/html']
            },
            ajax: $.ajax
        },

        add: function (name, str_template, anchor) {
            if (Barbe.html.hasOwnProperty(name)) {
                throw "You've already got a template by the name: \"" + name + "\"";
            }
            else {
                Barbe.html[name] = str_template;
                Barbe.templates[name] = function (data) {
                    var html;
                    data = data || {};
                    html = Barbe.templateSystem.compile(Barbe.html[name], data, Barbe.html);
                    if (typeof anchor !== "undefined") {
                        var element = document.getElementById(anchor);
                        if (element !== null) {
                            element.innerHTML = html;
                        }
                    }
                    return html;
                };
                
            }
        },
        grab: function () {
            scripts = document.scripts || document.getElementsByTagName('script');
            for(var i = 0, len = scripts.length; i < len; i++) {
                var s = scripts[i];
                if (Barbe.settings.template.type.indexOf(s.type) !== -1) {
                    Barbe.add(s.id, s.innerHTML, s.getAttribute("data-anchor"));
                }
            }
        }
    };

    // Barbe.View
    Barbe.View = function () {
        var args = arguments[0] || {};
        this.template = args.template;
        this.anchor = document.getElementById(args.anchor);
        if (this.anchor === null) {
            throw "[Barbe] #" + args.anchor + " not found.";
        }
        // function (data, callback) where data is the parameters for the api call and callback is this.castAnchor
        this.provider = args.provider;
        this.data = args.data || {};
    };
    Barbe.View.helpers = {};
    Barbe.View.prototype.render = function (response) {
        // Mustache doesn't like array as data, so we have to create a dumb object named "array" that contained the array
        if (Array.isArray(response)) {
            response = {array: response};
        }
        this.response = response;
        if (Barbe.templates[this.template] !== undefined) {
            this.view = Barbe.templates[this.template](response, true);
            return this.view;
        }
    };
    Barbe.View.prototype.castAnchor = function (response, after) {
        var rendered = this.render(response);
        this.loader && this.loader.remove();
        this.anchor.innerHTML = rendered;
        after && after.call(this, this.anchor);
    };
    Barbe.View.prototype.ajax = function (data) {
        var that = this;
        var monkeySuccess = function (response) {
            response = that.provider.success && that.provider.success.call(that, response);
            that.castAnchor.call(that, response);
        };
        that.ajaxParams = this.provider;
        that.ajaxParams.success = monkeySuccess;
        Barbe.settings.ajax(that.ajaxParams);
    };
    Barbe.View.prototype.draw = function (after) {
        if (this.provider !== undefined) {
            if (typeof this.provider === "function") {
                response = this.provider.success && this.provider.success(this.data);
                this.castAnchor(response, after);
            } else {
                this.loader = new Barbe.Loader(this.anchor);
                this.ajax.call(this, this.data);
            }
        }
        else {
            this.castAnchor(this.data, after);
        }
    };

    // Barbe.Loader
    Barbe.Loader = function (anchor) {
        this.anchor = anchor;
        this.div = document.createElement("div");
        this.div.className = "barbe-loader";
        this.div.id = "barbe_loader";
        while (this.anchor.hasChildNodes()) {
            this.anchor.removeChild(this.anchor.lastChild);
        }
        this.anchor.appendChild(this.div);
    };
    Barbe.Loader.prototype.remove = function () {
        this.anchor.removeChild(this.div);
    };

    window.Barbe = Barbe;
    Barbe.grab();
})();

if(!Array.isArray) {
    Array.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}
