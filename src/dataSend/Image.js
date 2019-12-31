import DataSend from './DataSend'
class Image {
  callback = null;
  img = null;
  data = null;
  server_url = null;
  constructor(para) {
    this.callback = para.callback;
    this.img = document.createElement("img");
    this.img.width = 1;
    this.img.height = 1;
    if (sd.para.img_use_crossorigin) {
      this.img.crossOrigin = "anonymous";
    }
    this.data = para.data;
    this.server_url = this.getSendUrl(para.server_url, para.data);
  }
  start() {
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
  }
  lastClear() {
    this.img.src = "";
  }
}

export default Image;
