window.googleLT_ || (window.googleLT_ = (new Date).getTime()), window.google || (window.google = {}), window.google.loader || (window.google.loader = {}, google.loader.ServiceBase = "https://www.google.com/uds", google.loader.GoogleApisBase = "https://ajax.googleapis.com/ajax", google.loader.ApiKey = "notsupplied", google.loader.KeyVerified = !0, google.loader.LoadFailure = !1, google.loader.Secure = !0, google.loader.GoogleLocale = "www.google.com", google.loader.ClientLocation = null, google.loader.AdditionalParams = "", function() {
    var e = this,
        o = function(o, t, n) {
            o = o.split("."), n = n || e, o[0] in n || void 0 === n.execScript || n.execScript("var " + o[0]);
            for (var a; o.length && (a = o.shift());) o.length || void 0 === t ? n = n[a] && n[a] !== Object.prototype[a] ? n[a] : n[a] = {} : n[a] = t
        },
        t = function(e, o, t) {
            e[o] = t
        },
        n = function(e, o) {
            if (o) e = e.replace(a, "&").replace(l, "<").replace(r, ">").replace(s, "").replace(i, "'").replace(g, "ï¿½");
            else {
                if (!c.test(e)) return e; - 1 != e.indexOf("&") && (e = e.replace(a, "&")), -1 != e.indexOf("<") && (e = e.replace(l, "<")), -1 != e.indexOf(">") && (e = e.replace(r, ">")), -1 != e.indexOf('"') && (e = e.replace(s, "")), -1 != e.indexOf("'") && (e = e.replace(i, "'")), -1 != e.indexOf("\0") && (e = e.replace(g, "ï¿½"))
            }
            return e
        },
        a = /&/g,
        l = /</g,
        r = />/g,
        s = /"/g,
        i = /'/g,
        g = /\x00/g,
        c = /[\x00&<>"']/,
        d = /^[\w+\/_-]+[=]{0,2}$/;

    function p(e) {
        return e in h ? h[e] : h[e] = -1 != navigator.userAgent.toLowerCase().indexOf(e)
    }
    var h = {};

    function u(e, o) {
        var t = function() {};
        t.prototype = o.prototype, e.da = o.prototype, e.prototype = new t
    }

    function f(e, o, t) {
        var n = Array.prototype.slice.call(arguments, 2) || [];
        return function() {
            return e.apply(o, n.concat(Array.prototype.slice.call(arguments)))
        }
    }

    function m(e) {
        return (e = Error(e)).toString = function() {
            return this.message
        }, e
    }

    function w(e, o) {
        e = e.split(/\./);
        for (var t = window, n = 0; n < e.length - 1; n++) t[e[n]] || (t[e[n]] = {}), t = t[e[n]];
        t[e[e.length - 1]] = o
    }

    function v(e, o, t) {
        e[o] = t
    }
    window.Y || (window.Y = {}), o || (o = w), t || (t = v), google.loader.F = {}, o("google.loader.callbacks", google.loader.F);
    var y = {},
        b = {};

    function k(e, o, t) {
        if (e.addEventListener) e.addEventListener(o, t, !1);
        else if (e.attachEvent) e.attachEvent("on" + o, t);
        else {
            var n = e["on" + o];
            e["on" + o] = null != n ? function(e) {
                return function() {
                    for (var o = 0; o < e.length; o++) e[o]()
                }
            }([t, n]) : t
        }
    }
    google.loader.eval = {}, o("google.loader.eval", google.loader.eval), google.load = function(e, o, t) {
        function n(e) {
            var o = e.split(".");
            if (2 < o.length) throw m("Module: '" + e + "' not found!");
            void 0 !== o[1] && (a = o[0], t.packages = t.packages || [], t.packages.push(o[1]))
        }
        var a = e;
        if (t = t || {}, e instanceof Array || e && "object" == typeof e && "function" == typeof e.join && "function" == typeof e.reverse)
            for (var l = 0; l < e.length; l++) n(e[l]);
        else n(e);
        if (!(e = y[":" + a])) throw m("Module: '" + a + "' not found!");
        if (t && !t.language && t.locale && (t.language = t.locale), t && "string" == typeof t.callback && ((l = t.callback).match(/^[[\]A-Za-z0-9._]+$/) && (l = window.eval(l), t.callback = l)), (l = t && null != t.callback) && !e.D(o)) throw m("Module: '" + a + "' must be loaded before DOM onLoad!");
        l ? e.u(o, t) ? window.setTimeout(t.callback, 0) : e.load(o, t) : e.u(o, t) || e.load(o, t)
    }, o("google.load", google.load), google.ca = function(e, o) {
        o ? (0 == S.length && (k(window, "load", C), !p("msie") && !p("safari") && !p("konqueror") && p("mozilla") || window.opera ? window.addEventListener("DOMContentLoaded", C, !1) : p("msie") ? document.write("<script defer onreadystatechange='google.loader.domReady()' src=//:><\/script>") : (p("safari") || p("konqueror")) && window.setTimeout(x, 10)), S.push(e)) : k(window, "load", e)
    }, o("google.setOnLoadCallback", google.ca);
    var S = [];
    google.loader.W = function() {
        var e = window.event.srcElement;
        "complete" == e.readyState && (e.onreadystatechange = null, e.parentNode.removeChild(e), C())
    }, o("google.loader.domReady", google.loader.W);
    var j = {
        loaded: !0,
        complete: !0
    };

    function x() {
        j[document.readyState] ? C() : 0 < S.length && window.setTimeout(x, 10)
    }

    function C() {
        for (var e = 0; e < S.length; e++) S[e]();
        S.length = 0
    }

    function A(e) {
        this.b = e, this.B = [], this.A = {}, this.l = {}, this.g = {}, this.s = !0, this.c = -1
    }

    function L(e) {
        this.T = e, this.v = {}, this.C = 0
    }

    function T(e, o, t) {
        this.name = e, this.S = o, this.w = t, this.G = this.j = !1, this.m = [], google.loader.F[this.name] = f(this.o, this)
    }
    google.loader.f = function(o, t, a) {
        var l = e.document;
        if ((l = l.querySelector && l.querySelector("script[nonce]")) && (l = l.nonce || l.getAttribute("nonce")) && d.test(l) || (l = void 0), a) {
            if ("script" == o) {
                var r = document.createElement("script");
                r.type = "text/javascript", r.src = t, l && r.setAttribute("nonce", l)
            } else "css" == o && ((r = document.createElement("link")).type = "text/css", r.href = t, r.rel = "stylesheet");
            (o = document.getElementsByTagName("head")[0]) || (o = document.body.parentNode.appendChild(document.createElement("head"))), o.appendChild(r)
        } else "script" == o ? (r = '<script src="' + n(t) + '" type="text/javascript"', l && (r += ' nonce="' + n(l) + '"'), document.write(r + "><\/script>")) : "css" == o && (r = '<link href="' + n(t) + '" type="text/css" rel="stylesheet"', l && (r += ' nonce="' + n(l) + '"'), document.write(r + "></link>"))
    }, o("google.loader.writeLoadTag", google.loader.f), google.loader.$ = function(e) {
        b = e
    }, o("google.loader.rfm", google.loader.$), google.loader.ba = function(e) {
        for (var o in e) "string" == typeof o && o && ":" == o.charAt(0) && !y[o] && (y[o] = new _(o.substring(1), e[o]))
    }, o("google.loader.rpl", google.loader.ba), google.loader.aa = function(e) {
        if ((e = e.specs) && e.length)
            for (var o = 0; o < e.length; ++o) {
                var t = e[o];
                "string" == typeof t ? y[":" + t] = new A(t) : (t = new T(t.name, t.baseSpec, t.customSpecs), y[":" + t.name] = t)
            }
    }, o("google.loader.rm", google.loader.aa), google.loader.loaded = function(e) {
        y[":" + e.module].o(e)
    }, o("google.loader.loaded", google.loader.loaded), google.loader.V = function() {
        return "qid=" + ((new Date).getTime().toString(16) + Math.floor(1e7 * Math.random()).toString(16))
    }, o("google.loader.createGuidArg_", google.loader.V), w("google_exportSymbol", w), w("google_exportProperty", v), google.loader.a = {}, o("google.loader.themes", google.loader.a), google.loader.a.K = "//www.google.com/cse/static/style/look/bubblegum.css", t(google.loader.a, "BUBBLEGUM", google.loader.a.K), google.loader.a.M = "//www.google.com/cse/static/style/look/greensky.css", t(google.loader.a, "GREENSKY", google.loader.a.M), google.loader.a.L = "//www.google.com/cse/static/style/look/espresso.css", t(google.loader.a, "ESPRESSO", google.loader.a.L), google.loader.a.O = "//www.google.com/cse/static/style/look/shiny.css", t(google.loader.a, "SHINY", google.loader.a.O), google.loader.a.N = "//www.google.com/cse/static/style/look/minimalist.css", t(google.loader.a, "MINIMALIST", google.loader.a.N), google.loader.a.P = "//www.google.com/cse/static/style/look/v2/default.css", t(google.loader.a, "V2_DEFAULT", google.loader.a.P), A.prototype.i = function(e, o) {
        var t = "";
        if (null != o && (null != o.language && (t += "&hl=" + encodeURIComponent(o.language)), null != o.nocss && (t += "&output=" + encodeURIComponent("nocss=" + o.nocss)), null != o.nooldnames && (t += "&nooldnames=" + encodeURIComponent(o.nooldnames)), null != o.packages && (t += "&packages=" + encodeURIComponent(o.packages)), null != o.callback && (t += "&async=2"), null != o.style && (t += "&style=" + encodeURIComponent(o.style)), null != o.noexp && (t += "&noexp=true"), null != o.other_params && (t += "&" + o.other_params)), !this.s) {
            for (var n in google[this.b] && google[this.b].JSHash && (t += "&sig=" + encodeURIComponent(google[this.b].JSHash)), o = [], this.A) ":" == n.charAt(0) && o.push(n.substring(1));
            for (n in this.l) ":" == n.charAt(0) && this.l[n] && o.push(n.substring(1));
            t += "&have=" + encodeURIComponent(o.join(","))
        }
        return google.loader.ServiceBase + "/?file=" + this.b + "&v=" + e + google.loader.AdditionalParams + t
    }, A.prototype.H = function(e) {
        var o = null;
        e && (o = e.packages);
        var t = null;
        if (o)
            if ("string" == typeof o) t = [e.packages];
            else if (o.length)
            for (t = [], e = 0; e < o.length; e++) "string" == typeof o[e] && t.push(o[e].replace(/^\s*|\s*$/, "").toLowerCase());
        for (t || (t = ["default"]), o = [], e = 0; e < t.length; e++) this.A[":" + t[e]] || o.push(t[e]);
        return o
    }, A.prototype.load = function(e, o) {
        var t = this.H(o),
            n = o && null != o.callback;
        if (n) var a = new L(o.callback);
        for (var l = [], r = t.length - 1; 0 <= r; r--) {
            var s = t[r];
            n && a.R(s), this.l[":" + s] ? (t.splice(r, 1), n && this.g[":" + s].push(a)) : l.push(s)
        }
        if (t.length) {
            for (o && o.packages && (o.packages = t.sort().join(",")), r = 0; r < l.length; r++) s = l[r], this.g[":" + s] = [], n && this.g[":" + s].push(a);
            if (o || null == b[":" + this.b] || null == b[":" + this.b].versions[":" + e] || google.loader.AdditionalParams || !this.s) o && o.autoloaded || google.loader.f("script", this.i(e, o), n);
            else {
                for (var i in e = b[":" + this.b], google[this.b] = google[this.b] || {}, e.properties) i && ":" == i.charAt(0) && (google[this.b][i.substring(1)] = e.properties[i]);
                google.loader.f("script", google.loader.ServiceBase + e.path + e.js, n), e.css && google.loader.f("css", google.loader.ServiceBase + e.path + e.css, n)
            }
            for (this.s && (this.s = !1, this.c = (new Date).getTime(), 1 != this.c % 100 && (this.c = -1)), r = 0; r < l.length; r++) s = l[r], this.l[":" + s] = !0
        }
    }, A.prototype.o = function(e) {
        -1 != this.c && (D("al_" + this.b, "jl." + ((new Date).getTime() - this.c), !0), this.c = -1), this.B = this.B.concat(e.components), google.loader[this.b] || (google.loader[this.b] = {}), google.loader[this.b].packages = this.B.slice(0);
        for (var o = 0; o < e.components.length; o++) {
            this.A[":" + e.components[o]] = !0, this.l[":" + e.components[o]] = !1;
            var t = this.g[":" + e.components[o]];
            if (t) {
                for (var n = 0; n < t.length; n++) t[n].U(e.components[o]);
                delete this.g[":" + e.components[o]]
            }
        }
    }, A.prototype.u = function(e, o) {
        return 0 == this.H(o).length
    }, A.prototype.D = function() {
        return !0
    }, L.prototype.R = function(e) {
        this.C++, this.v[":" + e] = !0
    }, L.prototype.U = function(e) {
        this.v[":" + e] && (this.v[":" + e] = !1, this.C--, 0 == this.C && window.setTimeout(this.T, 0))
    }, u(T, A), T.prototype.load = function(e, o) {
        var t = o && null != o.callback;
        t ? (this.m.push(o.callback), o.callback = "google.loader.callbacks." + this.name) : this.j = !0, o && o.autoloaded || google.loader.f("script", this.i(e, o), t)
    }, T.prototype.u = function(e, o) {
        return o && null != o.callback ? this.G : this.j
    }, T.prototype.o = function() {
        this.G = !0;
        for (var e = 0; e < this.m.length; e++) window.setTimeout(this.m[e], 0);
        this.m = []
    };
    var I = function(e, o) {
        return e.string ? encodeURIComponent(e.string) + "=" + encodeURIComponent(o) : e.regex ? o.replace(/(^.*$)/, e.regex) : ""
    };

    function _(e, o) {
        this.b = e, this.h = o, this.j = !1
    }
    T.prototype.i = function(e, o) {
        return this.X(this.I(e), e, o)
    }, T.prototype.X = function(e, o, t) {
        var n = "";
        if (e.key && (n += "&" + I(e.key, google.loader.ApiKey)), e.version && (n += "&" + I(e.version, o)), o = google.loader.Secure && e.ssl ? e.ssl : e.uri, null != t)
            for (var a in t) e.params[a] ? n += "&" + I(e.params[a], t[a]) : "other_params" == a ? n += "&" + t[a] : "base_domain" == a && (o = "https://" + t[a] + e.uri.substring(e.uri.indexOf("/", 7)));
        return google[this.name] = {}, -1 == o.indexOf("?") && n && (n = "?" + n.substring(1)), o + n
    }, T.prototype.D = function(e) {
        return this.I(e).deferred
    }, T.prototype.I = function(e) {
        if (this.w)
            for (var o = 0; o < this.w.length; ++o) {
                var t = this.w[o];
                if (new RegExp(t.pattern).test(e)) return t
            }
        return this.S
    }, u(_, A), _.prototype.load = function(e, o) {
        this.j = !0, google.loader.f("script", this.i(e, o), !1)
    }, _.prototype.u = function() {
        return this.j
    }, _.prototype.o = function() {}, _.prototype.i = function(e, o) {
        if (!this.h.versions[":" + e]) {
            if (this.h.aliases) {
                var t = this.h.aliases[":" + e];
                t && (e = t)
            }
            if (!this.h.versions[":" + e]) throw m("Module: '" + this.b + "' with version '" + e + "' not found!")
        }
        return google.loader.GoogleApisBase + "/libs/" + this.b + "/" + e + "/" + this.h.versions[":" + e][o && o.uncompressed ? "uncompressed" : "compressed"]
    }, _.prototype.D = function() {
        return !1
    };
    var O = !1,
        R = [],
        E = (new Date).getTime(),
        U = function() {
            O || (k(window, "unload", M), O = !0)
        },
        B = function(e, o) {
            if (U(), !(google.loader.Secure || google.loader.Options && !1 !== google.loader.Options.csi)) {
                for (var t = 0; t < e.length; t++) e[t] = encodeURIComponent(e[t].toLowerCase().replace(/[^a-z0-9_.]+/g, "_"));
                for (t = 0; t < o.length; t++) o[t] = encodeURIComponent(o[t].toLowerCase().replace(/[^a-z0-9_.]+/g, "_"));
                window.setTimeout(f(G, null, "//gg.google.com/csi?s=uds&v=2&action=" + e.join(",") + "&it=" + o.join(",")), 1e4)
            }
        },
        D = function(e, o, t) {
            t ? B([e], [o]) : (U(), R.push("r" + R.length + "=" + encodeURIComponent(e + (o ? "|" + o : ""))), window.setTimeout(M, 5 < R.length ? 0 : 15e3))
        },
        M = function() {
            if (R.length) {
                var e = google.loader.ServiceBase;
                0 == e.indexOf("http:") && (e = e.replace(/^http:/, "https:")), G(e + "/stats?" + R.join("&") + "&nc=" + (new Date).getTime() + "_" + ((new Date).getTime() - E)), R.length = 0
            }
        },
        G = function(e) {
            var o = new Image,
                t = G.Z++;
            G.J[t] = o, o.onload = o.onerror = function() {
                delete G.J[t]
            }, o.src = e, o = null
        };
    G.J = {}, G.Z = 0, w("google.loader.recordCsiStat", B), w("google.loader.recordStat", D), w("google.loader.createImageForLogging", G)
}(), google.loader.rm({
    specs: ["visualization", "payments", {
        name: "annotations",
        baseSpec: {
            uri: "https://www.google.com/reviews/scripts/annotations_bootstrap.js",
            ssl: null,
            key: {
                string: "key"
            },
            version: {
                string: "v"
            },
            deferred: !0,
            params: {
                country: {
                    string: "gl"
                },
                callback: {
                    string: "callback"
                },
                language: {
                    string: "hl"
                }
            }
        }
    }, "language", "gdata", "wave", "spreadsheets", "search", "orkut", "feeds", "annotations_v2", "picker", "identitytoolkit", {
        name: "maps",
        baseSpec: {
            uri: "https://maps.google.com/maps?file=googleapi",
            ssl: "https://maps-api-ssl.google.com/maps?file=googleapi",
            key: {
                string: "key"
            },
            version: {
                string: "v"
            },
            deferred: !0,
            params: {
                callback: {
                    regex: "callback=$1&async=2"
                },
                language: {
                    string: "hl"
                }
            }
        },
        customSpecs: [{
            uri: "https://maps.googleapis.com/maps/api/js",
            ssl: "https://maps.googleapis.com/maps/api/js",
            version: {
                string: "v"
            },
            deferred: !0,
            params: {
                callback: {
                    string: "callback"
                },
                language: {
                    string: "hl"
                }
            },
            pattern: "^(3|3..*)$"
        }]
    }, {
        name: "friendconnect",
        baseSpec: {
            uri: "https://www.google.com/friendconnect/script/friendconnect.js",
            ssl: "https://www.google.com/friendconnect/script/friendconnect.js",
            key: {
                string: "key"
            },
            version: {
                string: "v"
            },
            deferred: !1,
            params: {}
        }
    }, {
        name: "sharing",
        baseSpec: {
            uri: "https://www.google.com/s2/sharing/js",
            ssl: null,
            key: {
                string: "key"
            },
            version: {
                string: "v"
            },
            deferred: !1,
            params: {
                language: {
                    string: "hl"
                }
            }
        }
    }, "ads", {
        name: "books",
        baseSpec: {
            uri: "https://books.google.com/books/api.js",
            ssl: "https://encrypted.google.com/books/api.js",
            key: {
                string: "key"
            },
            version: {
                string: "v"
            },
            deferred: !0,
            params: {
                callback: {
                    string: "callback"
                },
                language: {
                    string: "hl"
                }
            }
        }
    }, "elements", "earth", "ima"]
}));
