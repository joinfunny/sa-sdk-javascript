import _ from "./utils/index.js";

var sd = {};

var _ = (sd._ = {});

sd.para_default = {
  preset_properties: {
    latest_utm: true,
    latest_traffic_source_type: true,
    latest_search_keyword: true,
    latest_referrer: true,
    latest_referrer_host: false,
    latest_landing_page: false,
    url: false
  },
  img_use_crossorigin: false,

  name: "sa",
  max_referrer_string_length: 200,
  max_string_length: 500,
  cross_subdomain: true,
  show_log: true,
  is_debug: false,
  debug_mode: false,
  debug_mode_upload: false,

  session_time: 0,

  use_client_time: false,
  source_channel: [],

  send_type: "image",

  vtrack_ignore: {},

  auto_init: true,

  is_track_single_page: false,

  is_single_page: false,

  batch_send: false,

  source_type: {},
  callback_timeout: 200,
  datasend_timeout: 3000,
  queue_timeout: 300,
  is_track_device_id: false,
  use_app_track: false,
  ignore_oom: true
};

sd.addReferrerHost = function(data) {
  var defaultHost = "取值异常";
  if (_.isObject(data.properties)) {
    if (data.properties.$first_referrer) {
      data.properties.$first_referrer_host = _.getHostname(
        data.properties.$first_referrer,
        defaultHost
      );
    }
    if (data.type === "track") {
      if ("$referrer" in data.properties) {
        data.properties.$referrer_host =
          data.properties.$referrer === ""
            ? ""
            : _.getHostname(data.properties.$referrer, defaultHost);
      }
      if (
        sd.para.preset_properties.latest_referrer &&
        sd.para.preset_properties.latest_referrer_host
      ) {
        data.properties.$latest_referrer_host =
          data.properties.$latest_referrer === ""
            ? ""
            : _.getHostname(data.properties.$latest_referrer, defaultHost);
      }
    }
  }
};

sd.addPropsHook = function(data) {
  if (
    sd.para.preset_properties &&
    sd.para.preset_properties.url &&
    data.type === "track" &&
    typeof data.properties.$url === "undefined"
  ) {
    data.properties.$url = window.location.href;
  }
};

sd.initPara = function(para) {
  sd.para = para || sd.para || {};
  var latestObj = {};
  if (_.isObject(sd.para.is_track_latest)) {
    for (var latestProp in sd.para.is_track_latest) {
      latestObj["latest_" + latestProp] = sd.para.is_track_latest[latestProp];
    }
  }

  sd.para.preset_properties = _.extend(
    {},
    sd.para_default.preset_properties,
    latestObj,
    sd.para.preset_properties || {}
  );

  var i;
  for (i in sd.para_default) {
    if (sd.para[i] === void 0) {
      sd.para[i] = sd.para_default[i];
    }
  }
  if (
    typeof sd.para.server_url === "string" &&
    sd.para.server_url.slice(0, 3) === "://"
  ) {
    sd.para.server_url = location.protocol + sd.para.server_url;
  }
  if (
    typeof sd.para.web_url === "string" &&
    sd.para.web_url.slice(0, 3) === "://"
  ) {
    sd.para.web_url = location.protocol + sd.para.web_url;
  }

  if (
    sd.para.send_type !== "image" &&
    sd.para.send_type !== "ajax" &&
    sd.para.send_type !== "beacon"
  ) {
    sd.para.send_type = "image";
  }

  var batch_send_default = {
    datasend_timeout: 6000,
    send_interval: 6000,
    one_send_max_length: 6
  };

  if (
    _.localStorage.isSupport() &&
    _.isSupportCors() &&
    typeof localStorage === "object"
  ) {
    if (sd.para.batch_send === true) {
      sd.para.batch_send = _.extend({}, batch_send_default);
      sd.para.use_client_time = true;
    } else if (typeof sd.para.batch_send === "object") {
      sd.para.use_client_time = true;
      sd.para.batch_send = _.extend({}, batch_send_default, sd.para.batch_send);
    }
  } else {
    sd.para.batch_send = false;
  }

  var utm_type = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term"
  ];
  var search_type = [
    "www.baidu.",
    "m.baidu.",
    "m.sm.cn",
    "so.com",
    "sogou.com",
    "youdao.com",
    "google.",
    "yahoo.com/",
    "bing.com/",
    "ask.com/"
  ];
  var social_type = [
    "weibo.com",
    "renren.com",
    "kaixin001.com",
    "douban.com",
    "qzone.qq.com",
    "zhihu.com",
    "tieba.baidu.com",
    "weixin.qq.com"
  ];
  var search_keyword = {
    baidu: ["wd", "word", "kw", "keyword"],
    google: "q",
    bing: "q",
    yahoo: "p",
    sogou: ["query", "keyword"],
    so: "q",
    sm: "q"
  };

  if (typeof sd.para.source_type === "object") {
    sd.para.source_type.utm = _.isArray(sd.para.source_type.utm)
      ? sd.para.source_type.utm.concat(utm_type)
      : utm_type;
    sd.para.source_type.search = _.isArray(sd.para.source_type.search)
      ? sd.para.source_type.search.concat(search_type)
      : search_type;
    sd.para.source_type.social = _.isArray(sd.para.source_type.social)
      ? sd.para.source_type.social.concat(social_type)
      : social_type;
    sd.para.source_type.keyword = _.isObject(sd.para.source_type.keyword)
      ? _.extend(search_keyword, sd.para.source_type.keyword)
      : search_keyword;
  }

  if (_.isObject(sd.para.heatmap)) {
    sd.para.heatmap.clickmap = sd.para.heatmap.clickmap || "default";
    sd.para.heatmap.scroll_notice_map =
      sd.para.heatmap.scroll_notice_map || "default";
    sd.para.heatmap.scroll_delay_time =
      sd.para.heatmap.scroll_delay_time || 4000;
    sd.para.heatmap.scroll_event_duration =
      sd.para.heatmap.scroll_event_duration || 18000;
    sd.para.heatmap.renderRefreshTime =
      sd.para.heatmap.renderRefreshTime || 1000;
    sd.para.heatmap.loadTimeout = sd.para.heatmap.loadTimeout || 1000;
  }
  if (typeof sd.para.server_url === "object" && sd.para.server_url.length) {
    for (i = 0; i < sd.para.server_url.length; i++) {
      if (!/sa\.gif[^\/]*$/.test(sd.para.server_url[i])) {
        sd.para.server_url[i] = sd.para.server_url[i]
          .replace(/\/sa$/, "/sa.gif")
          .replace(/(\/sa)(\?[^\/]+)$/, "/sa.gif$2");
      }
    }
  } else if (!/sa\.gif[^\/]*$/.test(sd.para.server_url)) {
    sd.para.server_url = sd.para.server_url
      .replace(/\/sa$/, "/sa.gif")
      .replace(/(\/sa)(\?[^\/]+)$/, "/sa.gif$2");
  }
  if (typeof sd.para.server_url === "string") {
    sd.para.debug_mode_url =
      sd.para.debug_mode_url || sd.para.server_url.replace("sa.gif", "debug");
  }
  if (sd.para.noCache === true) {
    sd.para.noCache = "?" + new Date().getTime();
  } else {
    sd.para.noCache = "";
  }

  if (sd.para.callback_timeout > sd.para.datasend_timeout) {
    sd.para.datasend_timeout = sd.para.callback_timeout;
  }
  if (sd.para.callback_timeout > sd.para.queue_timeout) {
    sd.para.queue_timeout = sd.para.callback_timeout;
  }
  if (sd.para.queue_timeout > sd.para.datasend_timeout) {
    sd.para.datasend_timeout = sd.para.queue_timeout;
  }
};

sd.readyState = {
  state: 0,
  historyState: [],
  stateType: {
    "1": "1-init未开始",
    "2": "2-init开始",
    "3": "3-store完成"
  },
  getState: function() {
    return this.historyState.join("\n");
  },
  setState: function(n) {
    if (String(n) in this.stateType) {
      this.state = n;
    }
    this.historyState.push(this.stateType[n]);
  }
};

sd.setPreConfig = function(sa) {
  sd.para = sa.para;
  sd._q = sa._q;
};

sd.setInitVar = function() {
  sd._t = sd._t || 1 * new Date();
  sd.lib_version = "1.14.18";
  sd.is_first_visitor = false;
  sd.source_channel_standard =
    "utm_source utm_medium utm_campaign utm_content utm_term";
};

sd.log = function() {
  if (
    (_.sessionStorage.isSupport() &&
      sessionStorage.getItem("sensorsdata_jssdk_debug") === "true") ||
    sd.para.show_log
  ) {
    if (
      sd.para.show_log === true ||
      sd.para.show_log === "string" ||
      sd.para.show_log === false
    ) {
      arguments[0] = _.formatJsonString(arguments[0]);
    }

    if (typeof console === "object" && console.log) {
      try {
        return console.log.apply(console, arguments);
      } catch (e) {
        console.log(arguments[0]);
      }
    }
  }
};

sd.enableLocalLog = function() {
  if (_.sessionStorage.isSupport()) {
    try {
      sessionStorage.setItem("sensorsdata_jssdk_debug", "true");
    } catch (e) {
      sd.log("enableLocalLog error: " + e.message);
    }
  }
};

sd.disableLocalLog = function() {
  if (_.sessionStorage.isSupport()) {
    sessionStorage.removeItem("sensorsdata_jssdk_debug");
  }
};

sd.debug = {
  distinct_id: function() {},
  jssdkDebug: function() {},
  _sendDebug: function(debugString) {
    sd.track("_sensorsdata2019_debug", {
      _jssdk_debug_info: debugString
    });
  },
  apph5: function(obj) {
    var name = "app_h5打通失败-";
    var relation = {
      "1": name + "use_app_track为false",
      "2": name + "Android或者iOS，没有暴露相应方法",
      "3.1": name + "Android校验server_url失败",
      "3.2": name + "iOS校验server_url失败"
    };
    var output = obj.output;
    var step = obj.step;
    var data = obj.data;
    if (output === "all" || output === "console") {
      sd.log(relation[step]);
    }
    if (
      (output === "all" || output === "code") &&
      _.isObject(sd.para.is_debug) &&
      sd.para.is_debug.apph5
    ) {
      if (!data.type || data.type.slice(0, 7) !== "profile") {
        data.properties._jssdk_debug_info = "apph5-" + String(step);
      }
    }
  }
};

var commonWays = {
  setOnlineState: function(state) {
    if (
      state === true &&
      _.isObject(sd.para.jsapp) &&
      typeof sd.para.jsapp.getData === "function"
    ) {
      sd.para.jsapp.isOnline = true;
      var arr = sd.para.jsapp.getData();
      if (_.isArray(arr) && arr.length > 0) {
        _.each(arr, function(str) {
          if (_.isJSONString(str)) {
            sd.sendState.pushSend(JSON.parse(str));
          }
        });
      }
    } else {
      sd.para.jsapp.isOnline = false;
    }
  },
  autoTrackIsUsed: false,
  isReady: function(callback) {
    callback();
  },
  getUtm: function() {
    return _.info.campaignParams();
  },
  getStayTime: function() {
    return (new Date() - sd._t) / 1000;
  },
  setProfileLocal: function(obj) {
    if (!_.localStorage.isSupport()) {
      sd.setProfile(obj);
      return false;
    }
    if (!_.isObject(obj) || _.isEmptyObject(obj)) {
      return false;
    }
    var saveData = _.localStorage.parse("sensorsdata_2015_jssdk_profile");
    var isNeedSend = false;
    if (_.isObject(saveData) && !_.isEmptyObject(saveData)) {
      for (var i in obj) {
        if ((i in saveData && saveData[i] !== obj[i]) || !(i in saveData)) {
          saveData[i] = obj[i];
          isNeedSend = true;
        }
      }
      if (isNeedSend) {
        _.localStorage.set(
          "sensorsdata_2015_jssdk_profile",
          JSON.stringify(saveData)
        );
        sd.setProfile(obj);
      }
    } else {
      _.localStorage.set("sensorsdata_2015_jssdk_profile", JSON.stringify(obj));
      sd.setProfile(obj);
    }
  },
  setInitReferrer: function() {
    var _referrer = _.getReferrer();
    sd.setOnceProfile({
      _init_referrer: _referrer,
      _init_referrer_host: _.info.pageProp.referrer_host
    });
  },
  setSessionReferrer: function() {
    var _referrer = _.getReferrer();
    store.setSessionPropsOnce({
      _session_referrer: _referrer,
      _session_referrer_host: _.info.pageProp.referrer_host
    });
  },
  setDefaultAttr: function() {
    _.info.register({
      _current_url: location.href,
      _referrer: _.getReferrer(),
      _referring_host: _.info.pageProp.referrer_host
    });
  },
  trackHeatMap: function(target, props, callback) {
    if (typeof target === "object" && target.tagName) {
      var tagName = target.tagName.toLowerCase();
      var parent_ele = target.parentNode.tagName.toLowerCase();
      if (
        tagName !== "button" &&
        tagName !== "a" &&
        parent_ele !== "a" &&
        parent_ele !== "button" &&
        tagName !== "input" &&
        tagName !== "textarea"
      ) {
        heatmap.start(null, target, tagName, props, callback);
      }
    }
  },
  trackAllHeatMap: function(target, props, callback) {
    if (typeof target === "object" && target.tagName) {
      var tagName = target.tagName.toLowerCase();
      heatmap.start(null, target, tagName, props, callback);
    }
  },
  autoTrackSinglePage: function(para, callback) {
    if (this.autoTrackIsUsed) {
      var url = _.info.pageProp.url;
    } else {
      var url = _.info.pageProp.referrer;
    }
    para = _.isObject(para) ? para : {};

    para = _.isObject(para) ? para : {};

    function getUtm() {
      var utms = _.info.campaignParams();
      var $utms = {};
      for (var i in utms) {
        if (
          (" " + sd.source_channel_standard + " ").indexOf(" " + i + " ") !== -1
        ) {
          $utms["$" + i] = utms[i];
        } else {
          $utms[i] = utms[i];
        }
      }
      return $utms;
    }

    if (sd.is_first_visitor && !para.not_set_profile) {
      sd.setOnceProfile(
        _.extend(
          {
            $first_visit_time: new Date(),
            $first_referrer: _.getReferrer(),
            $first_browser_language: navigator.language || "取值异常",
            $first_browser_charset:
              typeof document.charset === "string"
                ? document.charset.toUpperCase()
                : "取值异常",
            $first_traffic_source_type: _.getSourceFromReferrer(),
            $first_search_keyword: _.getKeywordFromReferrer()
          },
          getUtm()
        )
      );
      sd.is_first_visitor = false;
    }
    if (para.not_set_profile) {
      delete para.not_set_profile;
    }

    function closure(p, c) {
      sd.track(
        "$pageview",
        _.extend(
          {
            $referrer: url,
            $url: location.href,
            $url_path: location.pathname,
            $title: document.title
          },
          p,
          getUtm()
        ),
        c
      );
      url = location.href;
    }
    closure(para, callback);
    this.autoTrackSinglePage = closure;
  },
  autoTrackWithoutProfile: function(para, callback) {
    para = _.isObject(para) ? para : {};
    this.autoTrack(
      _.extend(para, {
        not_set_profile: true
      }),
      callback
    );
  },
  autoTrack: function(para, callback) {
    para = _.isObject(para) ? para : {};

    var utms = _.info.campaignParams();
    var $utms = {};
    for (var i in utms) {
      if (
        (" " + sd.source_channel_standard + " ").indexOf(" " + i + " ") !== -1
      ) {
        $utms["$" + i] = utms[i];
      } else {
        $utms[i] = utms[i];
      }
    }
    if (sd.is_first_visitor && !para.not_set_profile) {
      sd.setOnceProfile(
        _.extend(
          {
            $first_visit_time: new Date(),
            $first_referrer: _.getReferrer(),
            $first_browser_language: navigator.language || "取值异常",
            $first_browser_charset:
              typeof document.charset === "string"
                ? document.charset.toUpperCase()
                : "取值异常",
            $first_traffic_source_type: _.getSourceFromReferrer(),
            $first_search_keyword: _.getKeywordFromReferrer()
          },
          $utms
        )
      );
      sd.is_first_visitor = false;
    }
    if (para.not_set_profile) {
      delete para.not_set_profile;
    }

    var current_page_url = location.href;

    if (sd.para.is_single_page) {
      _.addHashEvent(function() {
        var referrer = _.getReferrer(current_page_url);
        sd.track(
          "$pageview",
          _.extend(
            {
              $referrer: referrer,
              $url: location.href,
              $url_path: location.pathname,
              $title: document.title
            },
            $utms,
            para
          ),
          callback
        );
        current_page_url = location.href;
      });
    }

    sd.track(
      "$pageview",
      _.extend(
        {
          $referrer: _.getReferrer(),
          $url: location.href,
          $url_path: location.pathname,
          $title: document.title
        },
        $utms,
        para
      ),
      callback
    );
    this.autoTrackIsUsed = true;
  },
  getAnonymousID: function() {
    if (_.isEmptyObject(sd.store._state)) {
      return "请先初始化SDK";
    } else {
      return sd.store._state.first_id
        ? sd.store._state.first_id
        : sd.store._state.distinct_id;
    }
  }
};

sd.quick = function() {
  var arg = Array.prototype.slice.call(arguments);
  var arg0 = arg[0];
  var arg1 = arg.slice(1);
  if (typeof arg0 === "string" && commonWays[arg0]) {
    return commonWays[arg0].apply(commonWays, arg1);
  } else if (typeof arg0 === "function") {
    arg0.apply(sd, arg1);
  } else {
    sd.log("quick方法中没有这个功能" + arg[0]);
  }
};

sd.track = function(e, p, c) {
  if (
    saEvent.check({
      event: e,
      properties: p
    })
  ) {
    saEvent.send(
      {
        type: "track",
        event: e,
        properties: p
      },
      c
    );
  }
};

sd.trackLink = function(link, event_name, event_prop) {
  if (typeof link === "object" && link.tagName) {
    _.trackLink(
      {
        ele: link
      },
      event_name,
      event_prop
    );
  } else if (typeof link === "object" && link.target && link.event) {
    _.trackLink(link, event_name, event_prop);
  }
};
sd.trackLinks = function(link, event_name, event_prop) {
  var ele = link;
  event_prop = event_prop || {};
  if (!link || typeof link !== "object") {
    return false;
  }
  if (!link.href || /^javascript/.test(link.href) || link.target) {
    return false;
  }
  _.addEvent(link, "click", function(e) {
    e.preventDefault();
    var hasCalled = false;
    setTimeout(track_a_click, 1000);

    function track_a_click() {
      if (!hasCalled) {
        hasCalled = true;
        location.href = link.href;
      }
    }
    sd.track(event_name, event_prop, track_a_click);
  });
};

sd.setProfile = function(p, c) {
  if (
    saEvent.check({
      propertiesMust: p
    })
  ) {
    saEvent.send(
      {
        type: "profile_set",
        properties: p
      },
      c
    );
  }
};

sd.setOnceProfile = function(p, c) {
  if (
    saEvent.check({
      propertiesMust: p
    })
  ) {
    saEvent.send(
      {
        type: "profile_set_once",
        properties: p
      },
      c
    );
  }
};

sd.appendProfile = function(p, c) {
  if (
    saEvent.check({
      propertiesMust: p
    })
  ) {
    _.each(p, function(value, key) {
      if (_.isString(value)) {
        p[key] = [value];
      } else if (_.isArray(value)) {
      } else {
        delete p[key];
        sd.log("appendProfile属性的值必须是字符串或者数组");
      }
    });
    if (!_.isEmptyObject(p)) {
      saEvent.send(
        {
          type: "profile_append",
          properties: p
        },
        c
      );
    }
  }
};

sd.incrementProfile = function(p, c) {
  var str = p;
  if (_.isString(p)) {
    p = {};
    p[str] = 1;
  }

  function isChecked(p) {
    for (var i in p) {
      if (!/-*\d+/.test(String(p[i]))) {
        return false;
      }
    }
    return true;
  }

  if (
    saEvent.check({
      propertiesMust: p
    })
  ) {
    if (isChecked(p)) {
      saEvent.send(
        {
          type: "profile_increment",
          properties: p
        },
        c
      );
    } else {
      sd.log("profile_increment的值只能是数字");
    }
  }
};

sd.deleteProfile = function(c) {
  saEvent.send(
    {
      type: "profile_delete"
    },
    c
  );
  store.set("distinct_id", _.UUID());
  store.set("first_id", "");
};

sd.unsetProfile = function(p, c) {
  var str = p;
  var temp = {};
  if (_.isString(p)) {
    p = [];
    p.push(str);
  }
  if (_.isArray(p)) {
    _.each(p, function(v) {
      if (_.isString(v)) {
        temp[v] = true;
      } else {
        sd.log("profile_unset给的数组里面的值必须时string,已经过滤掉", v);
      }
    });
    saEvent.send(
      {
        type: "profile_unset",
        properties: temp
      },
      c
    );
  } else {
    sd.log("profile_unset的参数是数组");
  }
};

sd.identify = function(id, isSave) {
  if (typeof id === "number") {
    id = String(id);
  }
  var firstId = store.getFirstId();
  if (typeof id === "undefined") {
    if (firstId) {
      store.set("first_id", _.UUID());
    } else {
      store.set("distinct_id", _.UUID());
    }
  } else if (
    saEvent.check({
      distinct_id: id
    })
  ) {
    if (isSave === true) {
      if (firstId) {
        store.set("first_id", id);
      } else {
        store.set("distinct_id", id);
      }
    } else {
      if (firstId) {
        store.change("first_id", id);
      } else {
        store.change("distinct_id", id);
      }
    }
  } else {
    sd.log("identify的参数必须是字符串");
  }
};

sd.trackSignup = function(id, e, p, c) {
  if (
    saEvent.check({
      distinct_id: id,
      event: e,
      properties: p
    })
  ) {
    var original_id = store.getFirstId() || store.getDistinctId();
    store.set("distinct_id", id);
    saEvent.send(
      {
        original_id: original_id,
        distinct_id: id,
        type: "track_signup",
        event: e,
        properties: p
      },
      c
    );
  }
};

sd.trackAbtest = function(t, g) {};

sd.registerPage = function(obj) {
  if (
    saEvent.check({
      properties: obj
    })
  ) {
    _.extend(_.info.currentProps, obj);
  } else {
    sd.log("register输入的参数有误");
  }
};

sd.clearAllRegister = function(arr) {
  store.clearAllProps(arr);
};

sd.register = function(props) {
  if (
    saEvent.check({
      properties: props
    })
  ) {
    store.setProps(props);
  } else {
    sd.log("register输入的参数有误");
  }
};

sd.registerOnce = function(props) {
  if (
    saEvent.check({
      properties: props
    })
  ) {
    store.setPropsOnce(props);
  } else {
    sd.log("registerOnce输入的参数有误");
  }
};

sd.registerSession = function(props) {
  if (
    saEvent.check({
      properties: props
    })
  ) {
    store.setSessionProps(props);
  } else {
    sd.log("registerSession输入的参数有误");
  }
};

sd.registerSessionOnce = function(props) {
  if (
    saEvent.check({
      properties: props
    })
  ) {
    store.setSessionPropsOnce(props);
  } else {
    sd.log("registerSessionOnce输入的参数有误");
  }
};

sd.login = function(id, callback) {
  if (typeof id === "number") {
    id = String(id);
  }
  if (
    saEvent.check({
      distinct_id: id
    })
  ) {
    var firstId = store.getFirstId();
    var distinctId = store.getDistinctId();
    if (id !== distinctId) {
      if (!firstId) {
        store.set("first_id", distinctId);
      }
      sd.trackSignup(id, "$SignUp", {}, callback);
    } else {
      callback && callback();
    }
  } else {
    sd.log("login的参数必须是字符串");
    callback && callback();
  }
};

sd.logout = function(isChangeId) {
  var firstId = store.getFirstId();
  if (firstId) {
    store.set("first_id", "");
    if (isChangeId === true) {
      store.set("distinct_id", _.UUID());
    } else {
      store.set("distinct_id", firstId);
    }
  } else {
    sd.log("没有first_id，logout失败");
  }
};

sd.getPresetProperties = function() {
  function getUtm() {
    var utms = _.info.campaignParams();
    var $utms = {};
    for (var i in utms) {
      if (
        (" " + sd.source_channel_standard + " ").indexOf(" " + i + " ") !== -1
      ) {
        $utms["$" + i] = utms[i];
      } else {
        $utms[i] = utms[i];
      }
    }
    return $utms;
  }

  var obj = {
    $referrer: _.info.pageProp.referrer || "",
    $referrer_host: _.info.pageProp.referrer
      ? _.getHostname(_.info.pageProp.referrer)
      : "",
    $url: location.href,
    $url_path: location.pathname,
    $title: document.title || "",
    _distinct_id: store.getDistinctId()
  };
  var result = _.extend(
    {},
    _.info.properties(),
    sd.store.getProps(),
    getUtm(),
    obj
  );
  if (
    sd.para.preset_properties.latest_referrer &&
    sd.para.preset_properties.latest_referrer_host
  ) {
    result.$latest_referrer_host =
      result.$latest_referrer === ""
        ? ""
        : _.getHostname(result.$latest_referrer);
  }
  return result;
};

export default sd;
