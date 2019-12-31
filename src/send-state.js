import utils from "./utils";
var sendState = {};
sendState.queue = utils.autoExeQueue();

sendState.requestData = null;

sendState.getSendCall = function(data, config, callback) {
  if (sd.is_heatmap_render_mode) {
    return false;
  }

  if (sd.readyState.state < 3) {
    sd.log("初始化没有完成");
    return false;
  }

  data._track_id = Number(
    String(Math.random()).slice(2, 5) +
      String(Math.random()).slice(2, 4) +
      String(new Date().getTime()).slice(-4)
  );
  if (sd.para.use_client_time) {
    data._flush_time = new Date().getTime();
  }

  var originData = data;

  data = JSON.stringify(data);

  this.requestData = {
    data: originData,
    config: config,
    callback: callback
  };

  if (
    !sd.para.use_app_track &&
    sd.para.batch_send &&
    localStorage.length < 200
  ) {
    sd.log(originData);
    sd.batchSend.add(this.requestData.data);
    return false;
  }

  if (sd.para.use_app_track === true || sd.para.use_app_track === "only") {
    if (
      typeof SensorsData_APP_JS_Bridge === "object" &&
      (SensorsData_APP_JS_Bridge.sensorsdata_verify ||
        SensorsData_APP_JS_Bridge.sensorsdata_track)
    ) {
      if (SensorsData_APP_JS_Bridge.sensorsdata_verify) {
        if (
          !SensorsData_APP_JS_Bridge.sensorsdata_verify(
            JSON.stringify(
              utils.extend(
                {
                  server_url: sd.para.server_url
                },
                originData
              )
            )
          )
        ) {
          sd.debug.apph5({
            data: originData,
            step: "3.1",
            output: "all"
          });
          this.prepareServerUrl();
        } else {
          typeof callback === "function" && callback();
        }
      } else {
        SensorsData_APP_JS_Bridge.sensorsdata_track(
          JSON.stringify(
            utils.extend(
              {
                server_url: sd.para.server_url
              },
              originData
            )
          )
        );
        typeof callback === "function" && callback();
      }
    } else if (
      (/sensors-verify/.test(navigator.userAgent) ||
        /sa-sdk-ios/.test(navigator.userAgent)) &&
      !window.MSStream
    ) {
      var iframe = null;
      if (/sensors-verify/.test(navigator.userAgent)) {
        var match = navigator.userAgent.match(/sensors-verify\/([^\s]+)/);
        if (
          match &&
          match[0] &&
          typeof match[1] === "string" &&
          match[1].split("?").length === 2
        ) {
          match = match[1].split("?");
          var hostname = null;
          var project = null;
          try {
            hostname = utils.URL(sd.para.server_url).hostname;
            project =
              utils.URL(sd.para.server_url).searchParams.get("project") ||
              "default";
          } catch (e) {}
          if (
            hostname &&
            hostname === match[0] &&
            project &&
            project === match[1]
          ) {
            iframe = document.createElement("iframe");
            iframe.setAttribute(
              "src",
              "sensorsanalytics://trackEvent?event=" +
                encodeURIComponent(
                  JSON.stringify(
                    utils.extend(
                      {
                        server_url: sd.para.server_url
                      },
                      originData
                    )
                  )
                )
            );
            document.documentElement.appendChild(iframe);
            iframe.parentNode.removeChild(iframe);
            iframe = null;
            typeof callback === "function" && callback();
          } else {
            sd.debug.apph5({
              data: originData,
              step: "3.2",
              output: "all"
            });
            this.prepareServerUrl();
          }
        }
      } else {
        iframe = document.createElement("iframe");
        iframe.setAttribute(
          "src",
          "sensorsanalytics://trackEvent?event=" +
            encodeURIComponent(
              JSON.stringify(
                utils.extend(
                  {
                    server_url: sd.para.server_url
                  },
                  originData
                )
              )
            )
        );
        document.documentElement.appendChild(iframe);
        iframe.parentNode.removeChild(iframe);
        iframe = null;
        typeof callback === "function" && callback();
      }
    } else {
      if (sd.para.use_app_track === true) {
        sd.debug.apph5({
          data: originData,
          step: "2",
          output: "all"
        });
        this.prepareServerUrl();
      }
    }
  } else if (sd.para.use_app_track === "mui") {
    if (
      utils.isObject(window.plus) &&
      window.plus.SDAnalytics &&
      window.plus.SDAnalytics.trackH5Event
    ) {
      window.plus.SDAnalytics.trackH5Event(data);
    }
  } else {
    sd.debug.apph5({
      data: originData,
      step: "1",
      output: "code"
    });
    this.prepareServerUrl();
  }
  sd.log(originData);
};

sendState.prepareServerUrl = function() {
  if (
    typeof this.requestData.config === "object" &&
    this.requestData.config.server_url
  ) {
    this.sendCall(
      this.requestData.config.server_url,
      this.requestData.callback
    );
  } else if (utils.isArray(sd.para.server_url)) {
    for (var i = 0; i < sd.para.server_url.length; i++) {
      this.sendCall(sd.para.server_url[i]);
    }
  } else {
    this.sendCall(sd.para.server_url, this.requestData.callback);
  }
};

sendState.sendCall = function(server_url, callback) {
  var data = {
    server_url: server_url,
    data: JSON.stringify(this.requestData.data),
    callback: callback,
    config: this.requestData.config
  };
  if (
    utils.isObject(sd.para.jsapp) &&
    !sd.para.jsapp.isOnline &&
    typeof sd.para.jsapp.setData === "function"
  ) {
    delete data.callback;
    data = JSON.stringify(data);
    sd.para.jsapp.setData(data);
  } else {
    this.pushSend(data);
  }
};

sendState.pushSend = function(data) {
  var instance = dataSend.getInstance(data);
  var me = this;
  instance.close = function() {
    me.queue.close();
  };
  this.queue.enqueue(instance);
};

export default sendState;
