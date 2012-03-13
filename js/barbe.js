/* 
*/
(function () {
    "Barbe:nomunge";
    var Barbe = {
        html: {},
        templates: {},
        settings: {
            template: {
                engine: Mustache.render,
                type: ['text/html']
            },
            ajax: $.ajax
        },

        // save template in a dictionary and add the render function to create the final result.
        add: function (name, str_template, anchor) {
            if (Barbe.html.hasOwnProperty(name)) {
                throw "[Barbe] You've already got a template by the name: \"" + name + "\"";
            }
            else {
                Barbe.html[name] = str_template;
                Barbe.templates[name] = {};

                if (typeof anchor !== "undefined") {
                    var element = document.getElementById(anchor);
                    if (element !== null) {
                        Barbe.templates[name].anchor = element;
                    }
                }
                Barbe.templates[name].render = function (data) {
                    data = data || {};
                    var html = Barbe.settings.template.engine(Barbe.html[name], data, Barbe.html);
                    if (Barbe.templates[name].anchor !== undefined) {
                        Barbe.templates[name].anchor.innerHTML = html;
                    }
                    return html;
                };
                
            }
        },
        // parse the html to collect templates defined by <script type="<Barbe.settings.template.type>" id=""></script>
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
    Barbe.View = function (template, provider, anchor) {
        if (template === undefined || Barbe.templates[template] === undefined) {
            throw "[Barbe] template #" + template + " not found.";
        }
        this.template = Barbe.templates[template].render;
        this.anchor = Barbe.templates[template].anchor;

        if (anchor !== undefined) {
            this.anchor = document.getElementById(anchor);
            if (this.anchor === null) {
                throw "[Barbe] anchor #" + anchor + " not found.";
            } else {
                Barbe.templates[template].anchor = this.anchor;
            }
        }

        this.provider = provider || {};
    };

    // linked the template with the data
    Barbe.View.prototype.render = function (response) {
        // Mustache doesn't like array as data, so we have to create 
        // a dumb object named "array" that contained the array
        if (Array.isArray(response)) {
            response = {
                array: response
            };
        }

        this.view = this.template(response);
        return this.view;
    };

    // Attach the populated template to the anchor
    Barbe.View.prototype.castAnchor = function (response, callback) {
        this.loader && this.loader.remove();
        var rendered = this.render(response);
        callback && callback.call(this, rendered);
    };

    // process to the ajax call
    Barbe.View.prototype.ajax = function (callback) {
        var that = this;
        var provider = this.provider.success;
        var monkeySuccess = function (response) {
            if (provider !== undefined) {
                response = provider.call(that, response);
            }
            that.castAnchor.call(that, response, callback);
        };
        that.ajaxParams = this.provider;
        that.ajaxParams.success = monkeySuccess;
        Barbe.settings.ajax(that.ajaxParams);
    };

    // decide if the template is populated with an API call or directly with pure dictionary
    Barbe.View.prototype.grow = function (callback) {
        if (this.provider.url !== undefined) {
            this.loader = new Barbe.Loader(this.anchor);
            this.ajax.call(this, callback);
        } else {
            var response = this.provider.data;
            if (this.provider.success !== undefined) {
                response = this.provider.success && this.provider.success(this.provider.data);
            }
            this.castAnchor(response, callback);
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
