import Ajax from "./Ajax";
import Image from "./Image";
import beacon from "./Beacon";
import dataSend from "./DataSend";

const dataSend = {};
dataSend.getInstance = function(data) {
  var supportedSendModels = {
    image: Image,
    ajax: Ajax,
    beacon: Beacon
  };
  var sendType = this.getSendType(data);
  var obj = new supportedSendModels[sendType](data);
  var start = obj.start;
  obj.start = function() {
    if (
      utils.isObject(sd.para.is_debug) &&
      sd.para.is_debug.storage &&
      sd.store.requests
    ) {
      sd.store.requests.push({
        name: this.server_url,
        initiatorType: this.img ? "img" : "xmlhttprequest",
        entryType: "resource",
        requestData: this.data
      });
    }
    var me = this;
    start.apply(this, arguments);
    setTimeout(function() {
      me.isEnd(true);
    }, sd.para.callback_timeout);
  };
  obj.end = function() {
    this.callback && this.callback();
    var self = this;
    setTimeout(function() {
      self.lastClear && self.lastClear();
    }, sd.para.datasend_timeout - sd.para.callback_timeout);
  };
  obj.isEnd = function(isDelay) {
    if (!this.received) {
      this.received = true;
      this.end();
      var self = this;
      if (isDelay) {
        if (sd.para.queue_timeout - sd.para.callback_timeout <= 0) {
          self.close();
        } else {
          setTimeout(function() {
            self.close();
          }, sd.para.queue_timeout - sd.para.callback_timeout);
        }
      } else {
        self.close();
      }
    }
  };

  return obj;
};
dataSend.getSendType = function(data) {
  var supportedSendTypes = ["image", "ajax", "beacon"];
  var sendType = supportedSendTypes[0];
  if (
    data.config &&
    utils.indexOf(supportedSendTypes, data.config.send_type) > -1
  ) {
    sendType = data.config.send_type;
  } else {
    sendType = sd.para.send_type;
  }

  if (sendType === "beacon" && typeof navigator.sendBeacon !== "function") {
    sendType = "image";
  }

  if (sendType === "ajax" && utils.isSupportCors() === false) {
    sendType = "image";
  }

  return sendType;
};

export default dataSend;
