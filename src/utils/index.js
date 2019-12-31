var ArrayProto = Array.prototype;
var FuncProto = Function.prototype;
var ObjProto = Object.prototype;
var slice = ArrayProto.slice;
var toString = ObjProto.toString;
var hasOwnProperty = ObjProto.hasOwnProperty;
var nativeBind = FuncProto.bind;
var nativeForEach = ArrayProto.forEach;
var nativeIndexOf = ArrayProto.indexOf;
var nativeIsArray = Array.isArray;
var breaker = {};
var _ = {};
var each = (_.each = function(obj, iterator, context) {
  if (obj == null) {
    return false;
  }
  if (nativeForEach && obj.forEach === nativeForEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, l = obj.length; i < l; i++) {
      if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) {
        return false;
      }
    }
  } else {
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) {
        if (iterator.call(context, obj[key], key, obj) === breaker) {
          return false;
        }
      }
    }
  }
});

_.extend = function(obj) {
  each(slice.call(arguments, 1), function(source) {
    for (var prop in source) {
      if (source[prop] !== void 0) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
};
_.extend2Lev = function(obj) {
  each(slice.call(arguments, 1), function(source) {
    for (var prop in source) {
      if (source[prop] !== void 0) {
        if (_.isObject(source[prop]) && _.isObject(obj[prop])) {
          _.extend(obj[prop], source[prop]);
        } else {
          obj[prop] = source[prop];
        }
      }
    }
  });
  return obj;
};
_.coverExtend = function(obj) {
  each(slice.call(arguments, 1), function(source) {
    for (var prop in source) {
      if (source[prop] !== void 0 && obj[prop] === void 0) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
};

_.isArray =
  nativeIsArray ||
  function(obj) {
    return toString.call(obj) === "[object Array]";
  };

_.isFunction = function(f) {
  if (!f) {
    return false;
  }
  try {
    return /^\s*\bfunction\b/.test(f);
  } catch (x) {
    return false;
  }
};

_.isArguments = function(obj) {
  return !!(obj && hasOwnProperty.call(obj, "callee"));
};

_.toArray = function(iterable) {
  if (!iterable) {
    return [];
  }
  if (iterable.toArray) {
    return iterable.toArray();
  }
  if (_.isArray(iterable)) {
    return slice.call(iterable);
  }
  if (_.isArguments(iterable)) {
    return slice.call(iterable);
  }
  return _.values(iterable);
};

_.values = function(obj) {
  var results = [];
  if (obj == null) {
    return results;
  }
  each(obj, function(value) {
    results[results.length] = value;
  });
  return results;
};

_.indexOf = function(arr, target) {
  var indexof = arr.indexOf;
  if (indexof) {
    return indexof.call(arr, target);
  } else {
    for (var i = 0; i < arr.length; i++) {
      if (target === arr[i]) {
        return i;
      }
    }
    return -1;
  }
};

_.filter = function(arr, fn, self) {
  var hasOwn = Object.prototype.hasOwnProperty;
  if (arr.filter) {
    return arr.filter(fn);
  }
  var ret = [];
  for (var i = 0; i < arr.length; i++) {
    if (!hasOwn.call(arr, i)) {
      continue;
    }
    var val = arr[i];
    if (fn.call(self, val, i, arr)) {
      ret.push(val);
    }
  }
  return ret;
};

_.inherit = function(subclass, superclass) {
  subclass.prototype = new superclass();
  subclass.prototype.constructor = subclass;
  subclass.superclass = superclass.prototype;
  return subclass;
};

_.trim = function(str) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
};

_.isObject = function(obj) {
  if (obj == null) {
    return false;
  } else {
    return toString.call(obj) == "[object Object]";
  }
};

_.isEmptyObject = function(obj) {
  if (_.isObject(obj)) {
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
  }
  return false;
};

_.isUndefined = function(obj) {
  return obj === void 0;
};

_.isString = function(obj) {
  return toString.call(obj) == "[object String]";
};

_.isDate = function(obj) {
  return toString.call(obj) == "[object Date]";
};

_.isBoolean = function(obj) {
  return toString.call(obj) == "[object Boolean]";
};

_.isNumber = function(obj) {
  return toString.call(obj) == "[object Number]" && /[\d\.]+/.test(String(obj));
};

_.isElement = function(obj) {
  return !!(obj && obj.nodeType === 1);
};

_.isJSONString = function(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};
_.safeJSONParse = function(str) {
  var val = null;
  try {
    val = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return val;
};
_.decodeURIComponent = function(val) {
  var result = val;
  try {
    result = decodeURIComponent(val);
  } catch (e) {
    result = val;
  }
  return result;
};

_.encodeDates = function(obj) {
  _.each(obj, function(v, k) {
    if (_.isDate(v)) {
      obj[k] = _.formatDate(v);
    } else if (_.isObject(v)) {
      obj[k] = _.encodeDates(v);
    }
  });
  return obj;
};

_.mediaQueriesSupported = function() {
  return (
    typeof window.matchMedia != "undefined" ||
    typeof window.msMatchMedia != "undefined"
  );
};

_.getScreenOrientation = function() {
  var screenOrientationAPI =
    screen.msOrientation ||
    screen.mozOrientation ||
    (screen.orientation || {}).type;
  var screenOrientation = "未取到值";
  if (screenOrientationAPI) {
    screenOrientation =
      screenOrientationAPI.indexOf("landscape") > -1 ? "landscape" : "portrait";
  } else if (_.mediaQueriesSupported()) {
    var matchMediaFunc = window.matchMedia || window.msMatchMedia;
    if (matchMediaFunc("(orientation: landscape)").matches) {
      screenOrientation = "landscape";
    } else if (matchMediaFunc("(orientation: portrait)").matches) {
      screenOrientation = "portrait";
    }
  }
  return screenOrientation;
};

_.now =
  Date.now ||
  function() {
    return new Date().getTime();
  };

_.throttle = function(func, wait, options) {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};
  var later = function() {
    previous = options.leading === false ? 0 : _.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function() {
    var now = _.now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

_.hashCode = function(str) {
  if (typeof str !== "string") {
    return 0;
  }
  var hash = 0;
  var char = null;
  if (str.length == 0) {
    return hash;
  }
  for (var i = 0; i < str.length; i++) {
    char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
};

_.formatDate = function(d) {
  function pad(n) {
    return n < 10 ? "0" + n : n;
  }

  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    " " +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes()) +
    ":" +
    pad(d.getSeconds()) +
    "." +
    pad(d.getMilliseconds())
  );
};

_.searchObjDate = function(o) {
  if (_.isObject(o)) {
    _.each(o, function(a, b) {
      if (_.isObject(a)) {
        _.searchObjDate(o[b]);
      } else {
        if (_.isDate(a)) {
          o[b] = _.formatDate(a);
        }
      }
    });
  }
};

_.searchZZAppStyle = function(data) {
  if (typeof data.properties.$project !== "undefined") {
    data.project = data.properties.$project;
    delete data.properties.$project;
  }
  if (typeof data.properties.$token !== "undefined") {
    data.token = data.properties.$token;
    delete data.properties.$token;
  }
};

_.formatJsonString = function(obj) {
  try {
    return JSON.stringify(obj, null, "  ");
  } catch (e) {
    return JSON.stringify(obj);
  }
};

_.formatString = function(str) {
  if (str.length > sd.para.max_string_length) {
    sd.log("字符串长度超过限制，已经做截取--" + str);
    return str.slice(0, sd.para.max_string_length);
  } else {
    return str;
  }
};

_.searchObjString = function(o) {
  if (_.isObject(o)) {
    _.each(o, function(a, b) {
      if (_.isObject(a)) {
        _.searchObjString(o[b]);
      } else {
        if (_.isString(a)) {
          o[b] = _.formatString(a);
        }
      }
    });
  }
};

_.parseSuperProperties = function(obj) {
  if (_.isObject(obj)) {
    _.each(obj, function(value, key) {
      if (_.isFunction(value)) {
        try {
          obj[key] = value();
          if (_.isFunction(obj[key])) {
            sd.log("您的属性- " + key + " 格式不满足要求，我们已经将其删除");
            delete obj[key];
          }
        } catch (e) {
          delete obj[key];
          sd.log("您的属性- " + key + " 抛出了异常，我们已经将其删除");
        }
      }
    });
    _.strip_sa_properties(obj);
  }
};

_.searchConfigData = function(data) {
  if (typeof data === "object" && data.$option) {
    var data_config = data.$option;
    delete data.$option;
    return data_config;
  } else {
    return {};
  }
};

_.unique = function(ar) {
  var temp,
    n = [],
    o = {};
  for (var i = 0; i < ar.length; i++) {
    temp = ar[i];
    if (!(temp in o)) {
      o[temp] = true;
      n.push(temp);
    }
  }
  return n;
};

_.strip_sa_properties = function(p) {
  if (!_.isObject(p)) {
    return p;
  }
  _.each(p, function(v, k) {
    if (_.isArray(v)) {
      var temp = [];
      _.each(v, function(arrv) {
        if (_.isString(arrv)) {
          temp.push(arrv);
        } else {
          sd.log("您的数据-", k, v, "的数组里的值必须是字符串,已经将其删除");
        }
      });
      if (temp.length !== 0) {
        p[k] = temp;
      } else {
        delete p[k];
        sd.log("已经删除空的数组");
      }
    }
    if (
      !(
        _.isString(v) ||
        _.isNumber(v) ||
        _.isDate(v) ||
        _.isBoolean(v) ||
        _.isArray(v) ||
        _.isFunction(v) ||
        k === "$option"
      )
    ) {
      sd.log("您的数据-", k, v, "-格式不满足要求，我们已经将其删除");
      delete p[k];
    }
  });
  return p;
};

_.strip_empty_properties = function(p) {
  var ret = {};
  _.each(p, function(v, k) {
    if (v != null) {
      ret[k] = v;
    }
  });
  return ret;
};

_.utf8Encode = function(string) {
  string = (string + "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  var utftext = "",
    start,
    end;
  var stringl = 0,
    n;

  start = end = 0;
  stringl = string.length;

  for (n = 0; n < stringl; n++) {
    var c1 = string.charCodeAt(n);
    var enc = null;

    if (c1 < 128) {
      end++;
    } else if (c1 > 127 && c1 < 2048) {
      enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128);
    } else {
      enc = String.fromCharCode(
        (c1 >> 12) | 224,
        ((c1 >> 6) & 63) | 128,
        (c1 & 63) | 128
      );
    }
    if (enc !== null) {
      if (end > start) {
        utftext += string.substring(start, end);
      }
      utftext += enc;
      start = end = n + 1;
    }
  }

  if (end > start) {
    utftext += string.substring(start, string.length);
  }

  return utftext;
};

_.base64Encode = function(data) {
  if (typeof btoa === "function") {
    return btoa(
      encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode("0x" + p1);
      })
    );
  }
  data = String(data);
  var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var o1,
    o2,
    o3,
    h1,
    h2,
    h3,
    h4,
    bits,
    i = 0,
    ac = 0,
    enc = "",
    tmp_arr = [];
  if (!data) {
    return data;
  }
  data = _.utf8Encode(data);
  do {
    o1 = data.charCodeAt(i++);
    o2 = data.charCodeAt(i++);
    o3 = data.charCodeAt(i++);

    bits = (o1 << 16) | (o2 << 8) | o3;

    h1 = (bits >> 18) & 0x3f;
    h2 = (bits >> 12) & 0x3f;
    h3 = (bits >> 6) & 0x3f;
    h4 = bits & 0x3f;
    tmp_arr[ac++] =
      b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
  } while (i < data.length);

  enc = tmp_arr.join("");

  switch (data.length % 3) {
    case 1:
      enc = enc.slice(0, -2) + "==";
      break;
    case 2:
      enc = enc.slice(0, -1) + "=";
      break;
  }

  return enc;
};

_.UUID = (function() {
  var T = function() {
    var d = 1 * new Date(),
      i = 0;
    while (d == 1 * new Date()) {
      i++;
    }
    return d.toString(16) + i.toString(16);
  };
  var R = function() {
    return Math.random()
      .toString(16)
      .replace(".", "");
  };
  var UA = function(n) {
    var ua = navigator.userAgent,
      i,
      ch,
      buffer = [],
      ret = 0;

    function xor(result, byte_array) {
      var j,
        tmp = 0;
      for (j = 0; j < byte_array.length; j++) {
        tmp |= buffer[j] << (j * 8);
      }
      return result ^ tmp;
    }

    for (i = 0; i < ua.length; i++) {
      ch = ua.charCodeAt(i);
      buffer.unshift(ch & 0xff);
      if (buffer.length >= 4) {
        ret = xor(ret, buffer);
        buffer = [];
      }
    }

    if (buffer.length > 0) {
      ret = xor(ret, buffer);
    }

    return ret.toString(16);
  };

  return function() {
    var se = String(screen.height * screen.width);
    if (se && /\d{5,}/.test(se)) {
      se = se.toString(16);
    } else {
      se = String(Math.random() * 31242)
        .replace(".", "")
        .slice(0, 8);
    }
    var val = T() + "-" + R() + "-" + UA() + "-" + se + "-" + T();
    if (val) {
      return val;
    } else {
      return (
        String(Math.random()) +
        String(Math.random()) +
        String(Math.random())
      ).slice(2, 15);
    }
  };
})();

_.getQueryParam = function(url, param) {
  param = param.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  url = _.decodeURIComponent(url);
  var regexS = "[\\?&]" + param + "=([^&#]*)",
    regex = new RegExp(regexS),
    results = regex.exec(url);
  if (
    results === null ||
    (results && typeof results[1] !== "string" && results[1].length)
  ) {
    return "";
  } else {
    return _.decodeURIComponent(results[1]);
  }
};

_.urlParse = function(para) {
  var URLParser = function(a) {
    this._fields = {
      Username: 4,
      Password: 5,
      Port: 7,
      Protocol: 2,
      Host: 6,
      Path: 8,
      URL: 0,
      QueryString: 9,
      Fragment: 10
    };
    this._values = {};
    this._regex = null;
    this._regex = /^((\w+):\/\/)?((\w+):?(\w+)?@)?([^\/\?:]+):?(\d+)?(\/?[^\?#]+)?\??([^#]+)?#?(\w*)/;

    if (typeof a != "undefined") {
      this._parse(a);
    }
  };
  URLParser.prototype.setUrl = function(a) {
    this._parse(a);
  };
  URLParser.prototype._initValues = function() {
    for (var a in this._fields) {
      this._values[a] = "";
    }
  };
  URLParser.prototype.addQueryString = function(queryObj) {
    if (typeof queryObj !== "object") {
      return false;
    }
    var query = this._values.QueryString || "";
    for (var i in queryObj) {
      if (new RegExp(i + "[^&]+").test(query)) {
        query = query.replace(new RegExp(i + "[^&]+"), i + "=" + queryObj[i]);
      } else {
        if (query.slice(-1) === "&") {
          query = query + i + "=" + queryObj[i];
        } else {
          if (query === "") {
            query = i + "=" + queryObj[i];
          } else {
            query = query + "&" + i + "=" + queryObj[i];
          }
        }
      }
    }
    this._values.QueryString = query;
  };
  URLParser.prototype.getUrl = function() {
    var url = "";
    url += this._values.Origin;
    url += this._values.Port ? ":" + this._values.Port : "";
    url += this._values.Path;
    url += this._values.QueryString ? "?" + this._values.QueryString : "";
    url += this._values.Fragment ? "#" + this._values.Fragment : "";
    return url;
  };

  URLParser.prototype.getUrl = function() {
    var url = "";
    url += this._values.Origin;
    url += this._values.Port ? ":" + this._values.Port : "";
    url += this._values.Path;
    url += this._values.QueryString ? "?" + this._values.QueryString : "";
    return url;
  };
  URLParser.prototype._parse = function(a) {
    this._initValues();
    var b = this._regex.exec(a);
    if (!b) {
      throw "DPURLParser::_parse -> Invalid URL";
    }
    for (var c in this._fields) {
      if (typeof b[this._fields[c]] != "undefined") {
        this._values[c] = b[this._fields[c]];
      }
    }
    this._values["Hostname"] = this._values["Host"].replace(/:\d+$/, "");
    this._values["Origin"] =
      this._values["Protocol"] + "://" + this._values["Hostname"];
  };
  return new URLParser(para);
};

_.addEvent = function() {
  function fixEvent(event) {
    if (event) {
      event.preventDefault = fixEvent.preventDefault;
      event.stopPropagation = fixEvent.stopPropagation;
      event._getPath = fixEvent._getPath;
    }
    return event;
  }
  fixEvent._getPath = function() {
    var ev = this;
    var polyfill = function() {
      try {
        var element = ev.target;
        var pathArr = [element];
        if (element === null || element.parentElement === null) {
          return [];
        }
        while (element.parentElement !== null) {
          element = element.parentElement;
          pathArr.unshift(element);
        }
        return pathArr;
      } catch (err) {
        return [];
      }
    };
    return (
      this.path || (this.composedPath && this.composedPath()) || polyfill()
    );
  };
  fixEvent.preventDefault = function() {
    this.returnValue = false;
  };
  fixEvent.stopPropagation = function() {
    this.cancelBubble = true;
  };

  var register_event = function(element, type, handler) {
    var useCapture =
      _.isObject(sd.para.heatmap) && sd.para.heatmap.useCapture ? true : false;
    if (element && element.addEventListener) {
      element.addEventListener(
        type,
        function(e) {
          e._getPath = fixEvent._getPath;
          handler.call(this, e);
        },
        useCapture
      );
    } else {
      var ontype = "on" + type;
      var old_handler = element[ontype];
      element[ontype] = makeHandler(element, handler, old_handler);
    }
  };

  function makeHandler(element, new_handler, old_handlers) {
    var handler = function(event) {
      event = event || fixEvent(window.event);
      if (!event) {
        return undefined;
      }
      event.target = event.srcElement;

      var ret = true;
      var old_result, new_result;
      if (typeof old_handlers === "function") {
        old_result = old_handlers(event);
      }
      new_result = new_handler.call(element, event);
      if (false === old_result || false === new_result) {
        ret = false;
      }
      return ret;
    };
    return handler;
  }

  register_event.apply(null, arguments);
};

_.addHashEvent = function(callback) {
  var hashEvent = "pushState" in window.history ? "popstate" : "hashchange";
  _.addEvent(window, hashEvent, callback);
};

_.addSinglePageEvent = function(callback) {
  var current_url = location.href;
  var historyPushState = window.history.pushState;
  var historyReplaceState = window.history.replaceState;

  window.history.pushState = function() {
    historyPushState.apply(window.history, arguments);
    callback(current_url);
    current_url = location.href;
  };
  window.history.replaceState = function() {
    historyReplaceState.apply(window.history, arguments);
    callback(current_url);
    current_url = location.href;
  };

  var singlePageEvent = historyPushState ? "popstate" : "hashchange";
  _.addEvent(window, singlePageEvent, function() {
    callback(current_url);
    current_url = location.href;
  });
};

_.cookie = {
  get: function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) == 0) {
        return _.decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  },
  set: function(name, value, days, cross_subdomain, is_secure) {
    cross_subdomain =
      typeof cross_subdomain === "undefined"
        ? sd.para.cross_subdomain
        : cross_subdomain;
    var cdomain = "",
      expires = "",
      secure = "";
    days = days == null ? 73000 : days;

    if (cross_subdomain) {
      var domain = _.getCurrentDomain(location.href);
      if (domain === "url解析失败") {
        domain = "";
      }
      cdomain = domain ? "; domain=" + domain : "";
    }

    if (days !== 0) {
      var date = new Date();
      if (String(days).slice(-1) === "s") {
        date.setTime(date.getTime() + Number(String(days).slice(0, -1)) * 1000);
      } else {
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      }

      expires = "; expires=" + date.toGMTString();
    }

    if (is_secure) {
      secure = "; secure";
    }

    document.cookie =
      name +
      "=" +
      encodeURIComponent(value) +
      expires +
      "; path=/" +
      cdomain +
      secure;
  },

  remove: function(name, cross_subdomain) {
    cross_subdomain =
      typeof cross_subdomain === "undefined"
        ? sd.para.cross_subdomain
        : cross_subdomain;
    _.cookie.set(name, "", -1, cross_subdomain);
  },

  getCookieName: function(name_prefix, url) {
    var sub = "";
    url = url || location.href;
    if (sd.para.cross_subdomain === false) {
      try {
        sub = _.URL(url).hostname;
      } catch (e) {}
      if (typeof sub === "string" && sub !== "") {
        sub = "sajssdk_2015_" + name_prefix + "_" + sub.replace(/\./g, "_");
      } else {
        sub = "sajssdk_2015_root_" + name_prefix;
      }
    } else {
      sub = "sajssdk_2015_cross_" + name_prefix;
    }
    return sub;
  },
  getNewUser: function() {
    var prefix = "new_user";
    if (
      this.get("sensorsdata_is_new_user") !== null ||
      this.get(this.getCookieName(prefix)) !== null
    ) {
      return true;
    } else {
      return false;
    }
  }
};

//-----

_.getEleInfo = function(obj) {
  if (!obj.target) {
    return false;
  }

  var target = obj.target;
  var tagName = target.tagName.toLowerCase();

  var props = {};

  props.$element_type = tagName;
  props.$element_name = target.getAttribute("name");
  props.$element_id = target.getAttribute("id");
  props.$element_class_name =
    typeof target.className === "string" ? target.className : null;
  props.$element_target_url = target.getAttribute("href");

  var textContent = "";
  if (target.textContent) {
    textContent = _.trim(target.textContent);
  } else if (target.innerText) {
    textContent = _.trim(target.innerText);
  }
  if (textContent) {
    textContent = textContent
      .replace(/[\r\n]/g, " ")
      .replace(/[ ]+/g, " ")
      .substring(0, 255);
  }
  props.$element_content = textContent || "";

  if (tagName === "input") {
    if (target.type === "button" || target.type === "submit") {
      props.$element_content = target.value || "";
    } else if (
      sd.para.heatmap &&
      typeof sd.para.heatmap.collect_input === "function" &&
      sd.para.heatmap.collect_input(target)
    ) {
      props.$element_content = target.value || "";
    }
  }

  props = _.strip_empty_properties(props);

  props.$url = location.href;
  props.$url_path = location.pathname;
  props.$title = document.title;
  props.$viewport_width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth ||
    0;

  return props;
};

_.localStorage = {
  get: function(name) {
    return window.localStorage.getItem(name);
  },

  parse: function(name) {
    var storedValue;
    try {
      storedValue = JSON.parse(_.localStorage.get(name)) || null;
    } catch (err) {}
    return storedValue;
  },

  set: function(name, value) {
    window.localStorage.setItem(name, value);
  },

  remove: function(name) {
    window.localStorage.removeItem(name);
  },

  isSupport: function() {
    var supported = true;
    try {
      var key = "__sensorsdatasupport__";
      var val = "testIsSupportStorage";
      _.localStorage.set(key, val);
      if (_.localStorage.get(key) !== val) {
        supported = false;
      }
      _.localStorage.remove(key);
    } catch (err) {
      supported = false;
    }
    return supported;
  }
};

_.sessionStorage = {
  isSupport: function() {
    var supported = true;

    var key = "__sensorsdatasupport__";
    var val = "testIsSupportStorage";
    try {
      if (sessionStorage && sessionStorage.setItem) {
        sessionStorage.setItem(key, val);
        sessionStorage.removeItem(key, val);
        supported = true;
      } else {
        supported = false;
      }
    } catch (e) {
      supported = false;
    }
    return supported;
  }
};

_.isSupportCors = function() {
  if (typeof window.XMLHttpRequest === "undefined") {
    return false;
  }
  if ("withCredentials" in new XMLHttpRequest()) {
    return true;
  } else if (typeof XDomainRequest !== "undefined") {
    return true;
  } else {
    return false;
  }
};

_.xhr = function(cors) {
  if (cors) {
    if (
      typeof window.XMLHttpRequest !== "undefined" &&
      "withCredentials" in new XMLHttpRequest()
    ) {
      return new XMLHttpRequest();
    } else if (typeof XDomainRequest !== "undefined") {
      return new XDomainRequest();
    } else {
      return null;
    }
  } else {
    if (typeof window.XMLHttpRequest !== "undefined") {
      return new XMLHttpRequest();
    }
    if (window.ActiveXObject) {
      try {
        return new ActiveXObject("Msxml2.XMLHTTP");
      } catch (d) {
        try {
          return new ActiveXObject("Microsoft.XMLHTTP");
        } catch (d) {}
      }
    }
  }
};

_.ajax = function(para) {
  para.timeout = para.timeout || 20000;

  para.credentials =
    typeof para.credentials === "undefined" ? true : para.credentials;

  function getJSON(data) {
    if (!data) {
      return "";
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  }

  var g = _.xhr(para.cors);

  if (!g) {
    return false;
  }

  if (!para.type) {
    para.type = para.data ? "POST" : "GET";
  }
  para = _.extend(
    {
      success: function() {},
      error: function() {}
    },
    para
  );

  try {
    if (typeof g === "object" && "timeout" in g) {
      g.timeout = para.timeout;
    } else {
      setTimeout(function() {
        g.abort();
      }, para.timeout + 500);
    }
  } catch (e) {
    try {
      setTimeout(function() {
        g.abort();
      }, para.timeout + 500);
    } catch (e2) {}
  }

  g.onreadystatechange = function() {
    try {
      if (g.readyState == 4) {
        if ((g.status >= 200 && g.status < 300) || g.status == 304) {
          para.success(getJSON(g.responseText));
        } else {
          para.error(getJSON(g.responseText), g.status);
        }
        g.onreadystatechange = null;
        g.onload = null;
      }
    } catch (e) {
      g.onreadystatechange = null;
      g.onload = null;
    }
  };

  g.open(para.type, para.url, true);

  try {
    if (para.credentials) {
      g.withCredentials = true;
    }
    if (_.isObject(para.header)) {
      for (var i in para.header) {
        g.setRequestHeader(i, para.header[i]);
      }
    }

    if (para.data) {
      if (!para.cors) {
        g.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      }
      if (para.contentType === "application/json") {
        g.setRequestHeader("Content-type", "application/json; charset=UTF-8");
      } else {
        g.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      }
    }
  } catch (e) {}

  g.send(para.data || null);
};

_.loadScript = function(para) {
  para = _.extend(
    {
      success: function() {},
      error: function() {},
      appendCall: function(g) {
        document.getElementsByTagName("head")[0].appendChild(g);
      }
    },
    para
  );

  var g = null;
  if (para.type === "css") {
    g = document.createElement("link");
    g.rel = "stylesheet";
    g.href = para.url;
  }
  if (para.type === "js") {
    g = document.createElement("script");
    g.async = "async";
    g.setAttribute("charset", "UTF-8");
    g.src = para.url;
    g.type = "text/javascript";
  }
  g.onload = g.onreadystatechange = function() {
    if (
      !this.readyState ||
      this.readyState === "loaded" ||
      this.readyState === "complete"
    ) {
      para.success();
      g.onload = g.onreadystatechange = null;
    }
  };
  g.onerror = function() {
    para.error();
    g.onerror = null;
  };
  para.appendCall(g);
};

_.getHostname = function(url, defaultValue) {
  if (!defaultValue || typeof defaultValue !== "string") {
    defaultValue = "hostname解析异常";
  }
  var hostname = null;
  try {
    hostname = _.URL(url).hostname;
  } catch (e) {}
  return hostname || defaultValue;
};

_.getQueryParamsFromUrl = function(url) {
  var result = {};
  var arr = url.split("?");
  var queryString = arr[1] || "";
  if (queryString) {
    result = _.getURLSearchParams("?" + queryString);
  }
  return result;
};

_.getURLSearchParams = function(queryString) {
  queryString = queryString || "";
  var decodeParam = function(str) {
    return decodeURIComponent(str);
  };
  var args = {};
  var query = queryString.substring(1);
  var pairs = query.split("&");
  for (var i = 0; i < pairs.length; i++) {
    var pos = pairs[i].indexOf("=");
    if (pos === -1) continue;
    var name = pairs[i].substring(0, pos);
    var value = pairs[i].substring(pos + 1);
    name = decodeParam(name);
    value = decodeParam(value);
    args[name] = value;
  }
  return args;
};

_.URL = function(url) {
  var result = {};
  var basicProps = [
    "hash",
    "host",
    "hostname",
    "href",
    "origin",
    "password",
    "pathname",
    "port",
    "protocol",
    "search",
    "username"
  ];
  var isURLAPIWorking = function() {
    var url;
    try {
      url = new URL("http://modernizr.com/");
      return url.href === "http://modernizr.com/";
    } catch (e) {
      return false;
    }
  };
  if (typeof window.URL === "function" && isURLAPIWorking()) {
    result = new URL(url);
  } else {
    var _regex = /^https?:\/\/.+/;
    if (_regex.test(url) === false) {
      throw "Invalid URL";
    }
    var link = document.createElement("a");
    link.href = url;
    for (var i = basicProps.length - 1; i >= 0; i--) {
      var prop = basicProps[i];
      result[prop] = link[prop];
    }
    if (
      result.hostname &&
      typeof result.pathname === "string" &&
      result.pathname.indexOf("/") !== 0
    ) {
      result.pathname = "/" + result.pathname;
    }
    result.searchParams = (function() {
      var params = _.getURLSearchParams(result.search);
      return {
        get: function(searchParam) {
          return params[searchParam];
        }
      };
    })();
  }
  return result;
};

_.getCurrentDomain = function(url) {
  var sdDomain = sd.para.current_domain;
  switch (typeof sdDomain) {
    case "function":
      var resultDomain = sdDomain();
      if (resultDomain === "" || _.trim(resultDomain) === "") {
        return "url解析失败";
      } else if (resultDomain.indexOf(".") !== -1) {
        return resultDomain;
      } else {
        return "url解析失败";
      }
    case "string":
      if (sdDomain === "" || _.trim(sdDomain) === "") {
        return "url解析失败";
      } else if (sdDomain.indexOf(".") !== -1) {
        return sdDomain;
      } else {
        return "url解析失败";
      }
    default:
      var cookieTopLevelDomain = _.getCookieTopLevelDomain();
      if (url === "") {
        return "url解析失败";
      } else if (cookieTopLevelDomain === "") {
        return "url解析失败";
      } else {
        return cookieTopLevelDomain;
      }
  }
};

_.getCookieTopLevelDomain = function(hostname) {
  hostname = hostname || window.location.hostname;
  var splitResult = hostname.split(".");
  if (
    _.isArray(splitResult) &&
    splitResult.length >= 2 &&
    !/^(\d+\.)+\d+$/.test(hostname)
  ) {
    var domainStr = "." + splitResult.splice(splitResult.length - 1, 1);
    while (splitResult.length > 0) {
      domainStr =
        "." + splitResult.splice(splitResult.length - 1, 1) + domainStr;
      document.cookie =
        "sensorsdata_domain_test=true; path=/; domain=" + domainStr;
      if (document.cookie.indexOf("sensorsdata_domain_test=true") !== -1) {
        var now = new Date();
        now.setTime(now.getTime() - 1000);
        document.cookie =
          "sensorsdata_domain_test=true; expires=" +
          now.toGMTString() +
          "; path=/; domain=" +
          domainStr;
        return domainStr;
      }
    }
  }
  return "";
};

_.isReferralTraffic = function(refererstring) {
  refererstring = refererstring || document.referrer;
  if (refererstring === "") {
    return true;
  }

  return (
    _.getCookieTopLevelDomain(_.getHostname(refererstring)) !==
    _.getCookieTopLevelDomain()
  );
};

_.ry = function(dom) {
  return new _.ry.init(dom);
};
_.ry.init = function(dom) {
  this.ele = dom;
};
_.ry.init.prototype = {
  addClass: function(para) {
    var classes = " " + this.ele.className + " ";
    if (classes.indexOf(" " + para + " ") === -1) {
      this.ele.className =
        this.ele.className + (this.ele.className === "" ? "" : " ") + para;
    }
    return this;
  },
  removeClass: function(para) {
    var classes = " " + this.ele.className + " ";
    if (classes.indexOf(" " + para + " ") !== -1) {
      this.ele.className = classes.replace(" " + para + " ", " ").slice(1, -1);
    }
    return this;
  },
  hasClass: function(para) {
    var classes = " " + this.ele.className + " ";
    if (classes.indexOf(" " + para + " ") !== -1) {
      return true;
    } else {
      return false;
    }
  },
  attr: function(key, value) {
    if (typeof key === "string" && _.isUndefined(value)) {
      return this.ele.getAttribute(key);
    }
    if (typeof key === "string") {
      value = String(value);
      this.ele.setAttribute(key, value);
    }
    return this;
  },
  offset: function() {
    var rect = this.ele.getBoundingClientRect();
    if (rect.width || rect.height) {
      var doc = this.ele.ownerDocument;
      var docElem = doc.documentElement;

      return {
        top: rect.top + window.pageYOffset - docElem.clientTop,
        left: rect.left + window.pageXOffset - docElem.clientLeft
      };
    } else {
      return {
        top: 0,
        left: 0
      };
    }
  },
  getSize: function() {
    if (!window.getComputedStyle) {
      return {
        width: this.ele.offsetWidth,
        height: this.ele.offsetHeight
      };
    }
    try {
      var bounds = this.ele.getBoundingClientRect();
      return {
        width: bounds.width,
        height: bounds.height
      };
    } catch (e) {
      return {
        width: 0,
        height: 0
      };
    }
  },
  getStyle: function(value) {
    if (this.ele.currentStyle) {
      return this.ele.currentStyle[value];
    } else {
      return this.ele.ownerDocument.defaultView
        .getComputedStyle(this.ele, null)
        .getPropertyValue(value);
    }
  },
  wrap: function(elementTagName) {
    var ele = document.createElement(elementTagName);
    this.ele.parentNode.insertBefore(ele, this.ele);
    ele.appendChild(this.ele);
    return _.ry(ele);
  },
  getCssStyle: function(prop) {
    var result = this.ele.style.getPropertyValue(prop);
    if (result) {
      return result;
    }
    var rules = null;
    if (typeof window.getMatchedCSSRules === "function") {
      rules = getMatchedCSSRules(this.ele);
    }
    if (!rules || !_.isArray(rules)) {
      return null;
    }
    for (var i = rules.length - 1; i >= 0; i--) {
      var r = rules[i];
      result = r.style.getPropertyValue(prop);
      if (result) {
        return result;
      }
    }
  },
  sibling: function(cur, dir) {
    while ((cur = cur[dir]) && cur.nodeType !== 1) {}
    return cur;
  },
  next: function() {
    return this.sibling(this.ele, "nextSibling");
  },
  prev: function(elem) {
    return this.sibling(this.ele, "previousSibling");
  },
  siblings: function(elem) {
    return this.siblings((this.ele.parentNode || {}).firstChild, this.ele);
  },
  children: function(elem) {
    return this.siblings(this.ele.firstChild);
  },
  parent: function() {
    var parent = this.ele.parentNode;
    parent = parent && parent.nodeType !== 11 ? parent : null;
    return _.ry(parent);
  }
};

_.strToUnicode = function(str) {
  if (typeof str !== "string") {
    sd.log("转换unicode错误", str);
    return str;
  }
  var nstr = "";
  for (var i = 0; i < str.length; i++) {
    nstr += "\\" + str.charCodeAt(i).toString(16);
  }
  return nstr;
};

_.getReferrer = function(referrer) {
  var referrer = referrer || document.referrer;
  if (typeof referrer !== "string") {
    return "取值异常_referrer异常_" + String(referrer);
  }
  if (referrer.indexOf("https://www.baidu.com/") === 0) {
    referrer = referrer.split("?")[0];
  }
  referrer = referrer.slice(0, sd.para.max_referrer_string_length);
  return typeof referrer === "string" ? referrer : "";
};

_.getKeywordFromReferrer = function(referrerUrl) {
  referrerUrl = referrerUrl || document.referrer;
  var search_keyword = sd.para.source_type.keyword;
  if (document && typeof referrerUrl === "string") {
    if (referrerUrl.indexOf("http") === 0) {
      var searchEngine = _.getReferSearchEngine(referrerUrl);
      var query = _.getQueryParamsFromUrl(referrerUrl);
      if (_.isEmptyObject(query)) {
        return "未取到值";
      }
      var temp = null;
      for (var i in search_keyword) {
        if (searchEngine === i) {
          if (typeof query === "object") {
            temp = search_keyword[i];
            if (_.isArray(temp)) {
              for (var i = 0; i < temp.length; i++) {
                var _value = query[temp[i]];
                if (_value) {
                  return _value;
                }
              }
            } else if (query[temp]) {
              return query[temp];
            }
          }
        }
      }
      return "未取到值";
    } else {
      if (referrerUrl === "") {
        return "未取到值_直接打开";
      } else {
        return "未取到值_非http的url";
      }
    }
  } else {
    return "取值异常_referrer异常_" + String(referrerUrl);
  }
};

_.getReferSearchEngine = function(referrerUrl) {
  var hostname = _.getHostname(referrerUrl);
  if (!hostname || hostname === "hostname解析异常") {
    return "";
  }
  var search_keyword = sd.para.source_type.keyword;
  var searchEngineUrls = {
    baidu: [/^.*\.baidu\.com$/],
    bing: [/^.*\.bing\.com$/],
    google: [
      /^www\.google\.com$/,
      /^www\.google\.com\.[a-z]{2}$/,
      /^www\.google\.[a-z]{2}$/
    ],
    sm: [/^m\.sm\.cn$/],
    so: [/^.+\.so\.com$/],
    sogou: [/^.*\.sogou\.com$/],
    yahoo: [/^.*\.yahoo\.com$/]
  };
  for (var prop in searchEngineUrls) {
    var urls = searchEngineUrls[prop];
    for (var i = 0, len = urls.length; i < len; i++) {
      if (urls[i].test(hostname)) {
        return prop;
      }
    }
  }
  return "未知搜索引擎";
};

_.getSourceFromReferrer = function() {
  function getMatchStrFromArr(arr, str) {
    for (var i = 0; i < arr.length; i++) {
      if (str.split("?")[0].indexOf(arr[i]) !== -1) {
        return true;
      }
    }
  }

  var utm_reg = "(" + sd.para.source_type.utm.join("|") + ")\\=[^&]+";
  var search_engine = sd.para.source_type.search;
  var social_engine = sd.para.source_type.social;

  var referrer = document.referrer || "";
  var url = _.info.pageProp.url;
  if (url) {
    var utm_match = url.match(new RegExp(utm_reg));
    if (utm_match && utm_match[0]) {
      return "付费广告流量";
    } else if (getMatchStrFromArr(search_engine, referrer)) {
      return "自然搜索流量";
    } else if (getMatchStrFromArr(social_engine, referrer)) {
      return "社交网站流量";
    } else if (referrer === "") {
      return "直接流量";
    } else {
      return "引荐流量";
    }
  } else {
    return "获取url异常";
  }
};

_.info = {
  initPage: function() {
    var referrer = _.getReferrer();
    var url = location.href;
    var url_domain = _.getCurrentDomain(url);
    if (!url_domain) {
      sd.debug.jssdkDebug("url_domain异常_" + url + "_" + url_domain);
    }

    this.pageProp = {
      referrer: referrer,
      referrer_host: referrer ? _.getHostname(referrer) : "",
      url: url,
      url_host: _.getHostname(url, "url_host取值异常"),
      url_domain: url_domain
    };
  },
  pageProp: {},

  campaignParams: function() {
    var campaign_keywords = sd.source_channel_standard.split(" "),
      kw = "",
      params = {};
    if (
      _.isArray(sd.para.source_channel) &&
      sd.para.source_channel.length > 0
    ) {
      campaign_keywords = campaign_keywords.concat(sd.para.source_channel);
      campaign_keywords = _.unique(campaign_keywords);
    }
    _.each(campaign_keywords, function(kwkey) {
      kw = _.getQueryParam(location.href, kwkey);
      if (kw.length) {
        params[kwkey] = kw;
      }
    });

    return params;
  },
  campaignParamsStandard: function(prefix, prefix_add) {
    prefix = prefix || "";
    prefix_add = prefix_add || "";
    var utms = _.info.campaignParams();
    var $utms = {},
      otherUtms = {};
    for (var i in utms) {
      if (
        (" " + sd.source_channel_standard + " ").indexOf(" " + i + " ") !== -1
      ) {
        $utms[prefix + i] = utms[i];
      } else {
        otherUtms[prefix_add + i] = utms[i];
      }
    }
    return {
      $utms: $utms,
      otherUtms: otherUtms
    };
  },
  properties: function() {
    return {
      $screen_height: Number(screen.height) || 0,
      $screen_width: Number(screen.width) || 0,
      $lib: "js",
      $lib_version: String(sd.lib_version)
    };
  },
  currentProps: {},
  register: function(obj) {
    _.extend(_.info.currentProps, obj);
  }
};

_.autoExeQueue = function() {
  var queue = {
    items: [],
    enqueue: function(val) {
      this.items.push(val);
      this.start();
    },
    dequeue: function() {
      return this.items.shift();
    },
    getCurrentItem: function() {
      return this.items[0];
    },
    isRun: false,
    start: function() {
      if (this.items.length > 0 && !this.isRun) {
        this.isRun = true;
        this.getCurrentItem().start();
      }
    },
    close: function() {
      this.dequeue();
      this.isRun = false;
      this.start();
    }
  };
  return queue;
};

_.trackLink = function(obj, event_name, event_prop) {
  obj = obj || {};
  var link = null;
  if (obj.ele) {
    link = obj.ele;
  }
  if (obj.event) {
    if (obj.target) {
      link = obj.target;
    } else {
      link = obj.event.target;
    }
  }

  event_prop = event_prop || {};
  if (!link || typeof link !== "object") {
    return false;
  }
  if (
    !link.href ||
    /^javascript/.test(link.href) ||
    link.target ||
    link.download ||
    link.onclick
  ) {
    sd.track(event_name, event_prop);
    return false;
  }

  function linkFunc(e) {
    e.stopPropagation();
    e.preventDefault();
    var hasCalled = false;

    function track_a_click() {
      if (!hasCalled) {
        hasCalled = true;
        location.href = link.href;
      }
    }
    setTimeout(track_a_click, 1000);
    sd.track(event_name, event_prop, track_a_click);
  }
  if (obj.event) {
    linkFunc(obj.event);
  }
  if (obj.ele) {
    _.addEvent(obj.ele, "click", function(e) {
      linkFunc(e);
    });
  }
};

export default _;
