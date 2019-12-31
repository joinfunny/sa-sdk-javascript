import utils from "./utils";
import DataSend from "./DataSend";
class Beacon extends DataSend {
  constructor(para) {
    this.callback = para.callback;
    this.server_url = para.server_url;
    this.data = dataSend.getSendData(para.data);
  }
  start() {
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
}
export default Beacon;
