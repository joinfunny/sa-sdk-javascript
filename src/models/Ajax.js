import utils from "../utils";
import DataSend from './DataSend'
class Ajax extends DataSend{
  callback = null
  server_url = null
  data = null
  constructor(para) {
    this.callback = para.callback;
    this.server_url = para.server_url;
    this.data = this.getSendData(para.data);
  }
  start() {
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
  }
}

export default Ajax;
