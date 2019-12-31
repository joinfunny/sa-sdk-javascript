import utils from "./utils";

class DataSend {
  getSendUrl(url, data) {
    var base64Data = utils.base64Encode(data);
    var crc = "crc=" + utils.hashCode(base64Data);
    if (url.indexOf("?") !== -1) {
      return (
        url +
        "&data=" +
        encodeURIComponent(base64Data) +
        "&ext=" +
        encodeURIComponent(crc)
      );
    } else {
      return (
        url +
        "?data=" +
        encodeURIComponent(base64Data) +
        "&ext=" +
        encodeURIComponent(crc)
      );
    }
  }
  getSendData(data) {
    var base64Data = utils.base64Encode(data);
    var crc = "crc=" + utils.hashCode(base64Data);
    return (
      "data=" +
      encodeURIComponent(base64Data) +
      "&ext=" +
      encodeURIComponent(crc)
    );
  }
  static getInstance(data) {
    var sendType = this.getSendType(data);
    var obj = new this[sendType](data);
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
  }
  getSendType(data) {
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
  }
}
export default DataSend;
