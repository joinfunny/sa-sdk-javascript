var saNewUser = {
  checkIsAddSign: function(data) {
    if (data.type === "track") {
      if (_.cookie.getNewUser()) {
        data.properties.$is_first_day = true;
      } else {
        data.properties.$is_first_day = false;
      }
    }
  },
  is_first_visit_time: false,
  checkIsFirstTime: function(data) {
    if (data.type === "track" && data.event === "$pageview") {
      if (this.is_first_visit_time) {
        data.properties.$is_first_time = true;
        this.is_first_visit_time = false;
      } else {
        data.properties.$is_first_time = false;
      }
    }
  },
  setDeviceId: function(uuid) {
    var device_id = null;
    var ds = _.cookie.get("sensorsdata2015jssdkcross");
    var state = {};
    if (ds != null && _.isJSONString(ds)) {
      state = JSON.parse(ds);
      if (state.$device_id) {
        device_id = state.$device_id;
      }
    }

    device_id = device_id || uuid;

    if (sd.para.cross_subdomain === true) {
      store.set("$device_id", device_id);
    } else {
      state.$device_id = device_id;
      _.cookie.set(
        "sensorsdata2015jssdkcross",
        JSON.stringify(state),
        null,
        true
      );
    }

    if (sd.para.is_track_device_id) {
      _.info.currentProps.$device_id = device_id;
    }
  },
  storeInitCheck: function() {
    if (sd.is_first_visitor) {
      var date = new Date();
      var obj = {
        h: 23 - date.getHours(),
        m: 59 - date.getMinutes(),
        s: 59 - date.getSeconds()
      };
      _.cookie.set(
        _.cookie.getCookieName("new_user"),
        "1",
        obj.h * 3600 + obj.m * 60 + obj.s + "s"
      );
      this.is_first_visit_time = true;
    } else {
      if (!_.cookie.getNewUser()) {
        this.checkIsAddSign = function(data) {
          if (data.type === "track") {
            data.properties.$is_first_day = false;
          }
        };
      }
      this.checkIsFirstTime = function(data) {
        if (data.type === "track" && data.event === "$pageview") {
          data.properties.$is_first_time = false;
        }
      };
    }
  },
  checkIsFirstLatest: function() {
    var url_domain = _.info.pageProp.url_domain;

    var latest_utms = [
      "$utm_source",
      "$utm_medium",
      "$utm_campaign",
      "$utm_content",
      "$utm_term"
    ];
    var props = store.getProps();
    for (var i = 0; i < latest_utms.length; i++) {
      if (latest_utms[i] in props) {
        delete props[latest_utms[i]];
      }
    }
    store.setProps(props, true);

    var latestObj = {};

    if (url_domain === "") {
      url_domain = "url解析失败";
    }

    _.each(sd.para.preset_properties, function(value, key) {
      if (key.indexOf("latest_") === -1) {
        return false;
      }
      key = key.slice(7);
      if (value) {
        if (key !== "utm" && url_domain === "url解析失败") {
          latestObj["$latest_" + key] = "url的domain解析失败";
        } else if (_.isReferralTraffic(document.referrer)) {
          switch (key) {
            case "traffic_source_type":
              latestObj[
                "$latest_traffic_source_type"
              ] = _.getSourceFromReferrer();
              break;
            case "referrer":
              latestObj["$latest_referrer"] = _.info.pageProp.referrer;
              break;
            case "search_keyword":
              latestObj["$latest_search_keyword"] = _.getKeywordFromReferrer();
              break;
            case "landing_page":
              latestObj["$latest_landing_page"] = location.href;
              break;
          }
        }
      } else {
        if (key === "utm" && sd.store._state.props) {
          for (var key1 in sd.store._state.props) {
            if (
              key1.indexOf("$latest_utm") === 0 ||
              key1.indexOf("_latest_") === 0
            ) {
              delete sd.store._state.props[key1];
            }
          }
        } else if (
          sd.store._state.props &&
          "$latest_" + key in sd.store._state.props
        ) {
          delete sd.store._state.props["$latest_" + key];
        }
      }
    });

    sd.register(latestObj);

    if (sd.para.preset_properties.latest_utm) {
      var allUtms = _.info.campaignParamsStandard("$latest_", "_latest_");
      var $utms = allUtms.$utms;
      var otherUtms = allUtms.otherUtms;
      if (!_.isEmptyObject($utms)) {
        sd.register($utms);
      }
      if (!_.isEmptyObject(otherUtms)) {
        sd.register(otherUtms);
      }
    }
  }
};

export default saNewUser;