import utils from "./utils";

var dataSend = {};

dataSend.getSendUrl = function(url, data) {
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
};

dataSend.getSendData = function(data) {
  var base64Data = utils.base64Encode(data);
  var crc = "crc=" + utils.hashCode(base64Data);
  return (
    "data=" + encodeURIComponent(base64Data) + "&ext=" + encodeURIComponent(crc)
  );
};

dataSend.getInstance = function(data) {
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

dataSend.image = function(para) {
  this.callback = para.callback;
  this.img = document.createElement("img");
  this.img.width = 1;
  this.img.height = 1;
  if (sd.para.img_use_crossorigin) {
    this.img.crossOrigin = "anonymous";
  }
  this.data = para.data;
  this.server_url = dataSend.getSendUrl(para.server_url, para.data);
};
dataSend.image.prototype.start = function() {
  var me = this;
  if (sd.para.ignore_oom) {
    this.img.onload = function() {
      this.onload = null;
      this.onerror = null;
      this.onabort = null;
      me.isEnd();
    };
    this.img.onerror = function() {
      this.onload = null;
      this.onerror = null;
      this.onabort = null;
      me.isEnd();
    };
    this.img.onabort = function() {
      this.onload = null;
      this.onerror = null;
      this.onabort = null;
      me.isEnd();
    };
  }
  this.img.src = this.server_url;
};

dataSend.image.prototype.lastClear = function() {
  this.img.src = "";
};

dataSend.ajax = function(para) {
  this.callback = para.callback;
  this.server_url = para.server_url;
  this.data = dataSend.getSendData(para.data);
};
dataSend.ajax.prototype.start = function() {
  var me = this;
  utils.ajax({
    url: this.server_url,
    type: "POST",
    data: this.data,
    credentials: false,
    timeout: sd.para.datasend_timeout,
    cors: true,
    success: function() {
      me.isEnd();
    },
    error: function() {
      me.isEnd();
    }
  });
};

dataSend.beacon = function(para) {
  this.callback = para.callback;
  this.server_url = para.server_url;
  this.data = dataSend.getSendData(para.data);
};

dataSend.beacon.prototype.start = function() {
  if (
    typeof navigator === "object" &&
    typeof navigator.sendBeacon === "function"
  ) {
    navigator.sendBeacon(this.server_url, this.data);
  }
  setTimeout(() => {
    this.isEnd();
  }, 40);
};

export default dataSend;
