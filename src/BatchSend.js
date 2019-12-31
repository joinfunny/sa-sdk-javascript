import utils from "./utils";

class BatchSend {
  constructor() {
    this.sendingData = 0;
  }
  add(data) {
    if (utils.isObject(data)) {
      this.writeStore(data);
      if (data.type === "track_signup" || data.event === "$pageview") {
        this.sendStrategy();
      }
    }
  }
  remove(keys) {
    var me = this;
    if (this.sendingData > 0) {
      --this.sendingData;
    }
    if (utils.isArray(keys) && keys.length > 0) {
      utils.each(keys, function(key) {
        utils.localStorage.remove(key);
      });
    }
  }
  send(data) {
    var me = this;
    var server_url = utils.isArray(sd.para.server_url)
      ? sd.para.server_url[0]
      : sd.para.server_url;
    utils.ajax({
      url: server_url,
      type: "POST",
      data:
        "data_list=" +
        encodeURIComponent(utils.base64Encode(JSON.stringify(data.vals))),
      credentials: false,
      timeout: sd.para.batch_send.datasend_timeout,
      cors: true,
      success: function() {
        me.remove(data.keys);
      },
      error: function() {
        if (me.sendingData > 0) {
          --me.sendingData;
        }
      }
    });
  }
  sendPrepare(data) {
    var arr = data.vals;
    var maxLen = sd.para.batch_send.one_send_max_length;
    var arrLen = arr.length;
    if (arrLen > 0) {
      if (arrLen <= maxLen) {
        this.send({
          keys: data.keys,
          vals: arr
        });
      } else {
        for (var i = 0; i * maxLen < arrLen; i++) {
          this.send({
            keys: data.keys.splice(0, maxLen),
            vals: arr.splice(0, maxLen)
          });
        }
      }
    }
  }
  sendStrategy() {
    var data = this.readStore();
    if (data.keys.length > 0 && this.sendingData === 0) {
      this.sendingData = Math.ceil(
        data.vals.length / sd.para.batch_send.one_send_max_length
      );
      this.sendPrepare(data);
    }
  }
  batchInterval() {
    setInterval(() => {
      this.sendStrategy();
    }, sd.para.batch_send.send_interval);
  }
  readStore() {
    var keys = [];
    var vals = [];
    var obj = {};
    var val = null;
    var now = new Date().getTime();
    var len = localStorage.length;
    for (var i = 0; i < len; i++) {
      var key = localStorage.key(i);
      if (key.indexOf("sawebjssdk-") === 0 && /^sawebjssdk\-\d+$/.test(key)) {
        val = localStorage.getItem(key);
        if (val) {
          val = utils.safeJSONParse(val);
          if (val && utils.isObject(val)) {
            val._flush_time = now;
            keys.push(key);
            vals.push(val);
          } else {
            localStorage.removeItem(key);
            sd.log("localStorage-数据parse异常" + val);
          }
        } else {
          localStorage.removeItem(key);
          sd.log("localStorage-数据取值异常" + val);
        }
      }
    }
    return {
      keys: keys,
      vals: vals
    };
  }
  writeStore(data) {
    var uuid =
      String(Math.random()).slice(2, 5) +
      String(Math.random()).slice(2, 5) +
      String(new Date().getTime()).slice(3);
    localStorage.setItem("sawebjssdk-" + uuid, JSON.stringify(data));
  }
}
