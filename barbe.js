/* 
 * @author: Benjamin Oertel (https://github.com/boertel)
 * @date: 01/01/2012
 * 
*/
(function () {
    "Barbe:nomunge";
    var Barbe = {
        html: {},
        templates: {},
        settings: {
            /*
            template: {
                render: Mustache.render,
                compile: undefined,
                type: ['text/html']
            },
            */
            template: {
                render: function (self, context, partials) {
                    return self.render(context, partials);
                },
                compile: function (str) {
                    return Hogan.compile(str);
                },
                type: ['text/html']
            },
            ajax: $.ajax,
            loader: {
                className: "barbe-loader",
                id: "barbe_loader"
            }
        },

        /**
         * Initalize template in a dictionary: add the render function to create the final result.
         * @param name         {string} name of the template
         * @param str_template {string} template itself
         * @param [anchor]     {string} id of the anchor
         */
        add: function (name, str_template, anchor) {
            if (Barbe.html.hasOwnProperty(name)) {
                throw "[Barbe] You've already got a template by the name: \"" + name + "\"";
            }
            else {
                if (Barbe.settings.template.compile !== undefined) {
                    Barbe.html[name] = Barbe.settings.template.compile(str_template);
                } else {
                    Barbe.html[name] = str_template;
                }
                Barbe.templates[name] = {};

                if (typeof anchor !== "undefined") {
                    var element = document.getElementById(anchor);
                    if (element !== null) {
                        Barbe.templates[name].anchor = element;
                    }
                }
                Barbe.templates[name].render = function (data) {
                    data = data || {};
                    var html = Barbe.settings.template.render(Barbe.html[name], data, Barbe.html);
                    if (Barbe.templates[name].anchor !== undefined) {
                        Barbe.templates[name].anchor.innerHTML = html;
                    }
                    return html;
                };
            }
        },

        /**
         * Parse the html to collect templates defined by <script type="<Barbe.settings.template.type>" id="" [data-anchor=""]></script>
         */
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

    /**
     * Constructor
     * @param template       {string} template name
     * @param provider.data  {object} data that populates the template
     * @param provider.url   {string} url of the api
     * @param provider.*     {*}      parameters for the ajax function
     * @param [args.anchor]  {string} id of the anchor (overwrite the one defined on the template script tag)
     */
    Barbe.View = function (template, provider, args) {
        if (template === undefined || Barbe.templates[template] === undefined) {
            throw "[Barbe] template #" + template + " not found.";
        }
        this.template = Barbe.templates[template].render;
        this.anchor = Barbe.templates[template].anchor;
        this.options = {};

        var anchor;
        
        if (typeof args === "string") {
            anchor = args;
        } else if (typeof args !== "undefined") {
            anchor = args.anchor;
            delete args.anchor;
            this.options = args;
        }

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

    /**
     * Populate the template with the data. Create a dumb object {array: data} if data is an array
     * @param response {object} data that populates the template
     */
    Barbe.View.prototype.render = function (response) {
        // Mustache doesn't like array as data, so we have to create 
        // a dumb object named "array" that contained the array
        if (typeof response === "undefined") {
            response = this.provider.data;
        }
        if (this.provider.url === undefined && this.provider.success !== undefined) {
            response = this.provider.success(response);
        }

        if (Object.prototype.toString.call(response) === '[object Array]') {
            response = {
                array: response
            };
        }

        this.view = this.template(response);
        return this.view;
    };

    /**
     *  Render the template with the response and attach it to the anchor
     *  @params response {object}       api response or data for the template
     *  @params callback {castAnchor}   function called after
     */
    Barbe.View.prototype.castAnchor = function (response, callback) {
        // TODO move this to the render function
        this.loader && this.loader.remove();
        var rendered = this.render(response);
        callback && callback.call(this, rendered);
    };


    /**
     * Process the ajax call 
     * @param callback {function} function executed when the ajax call successed and the template has been populated
     */
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

    /**
     * Run Barbe to populate the template and attach it the anchor
     * @param callback {function} function executed when the ajax call successed and the template has been populated
     */
    Barbe.View.prototype.grow = function (callback) {
        if (this.provider.url !== undefined) {
            if (Barbe.settings.loader !== false) {
                this.loader = new Barbe.Loader(this.anchor);
            }
            this.ajax.call(this, callback);
        } else {
            this.castAnchor(this.provider.data, callback);
        }
    };


    /**
     * Constructor: 
     * @param anchor {Node} Element where the loader is added
     */
    Barbe.Loader = function (anchor) {
        this.anchor = anchor;
        this.div = document.createElement("div");
        this.div.className = Barbe.settings.loader.className;
        this.div.id = Barbe.settings.loader.id;
        // Clean up the anchor
        while (this.anchor.hasChildNodes()) {
            this.anchor.removeChild(this.anchor.lastChild);
        }
        this.anchor.appendChild(this.div);
    };

    /**
     * Remove the loader from the anchor
     */
    Barbe.Loader.prototype.remove = function () {
        this.anchor.removeChild(this.div);
    };

    window.Barbe = Barbe;

    document.addEventListener('DOMContentLoaded', function () {
        Barbe.grab();
    }, true);
    
})();
