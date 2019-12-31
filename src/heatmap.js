
    var heatmap = sd.heatmap = {
      setNotice: function(web_url) {
        sd.is_heatmap_render_mode = true;

        if (!sd.para.heatmap) {
          sd.errorMsg = '您SDK没有配置开启点击图，可能没有数据！';
        }
        if (web_url && web_url[0] && web_url[1]) {
          if (web_url[1].slice(0, 5) === 'http:' && location.protocol === 'https') {
            sd.errorMsg = '您的当前页面是https的地址，神策分析环境也必须是https！';
          }
        }
        if (!sd.para.heatmap_url) {
          sd.para.heatmap_url = location.protocol + '//static.sensorsdata.cn/sdk/' + sd.lib_version + '/heatmap.min.js';
        }

      },
      getDomIndex: function(el) {
        if (!el.parentNode) return -1;
        var i = 0;
        var nodeName = el.tagName;
        var list = el.parentNode.children;
        for (var n = 0; n < list.length; n++) {
          if (list[n].tagName === nodeName) {
            if (el === list[n]) {
              return i;
            } else {
              i++;
            }
          }
        }
        return -1;
      },
      selector: function(el) {
        var i = el.parentNode && 9 == el.parentNode.nodeType ? -1 : this.getDomIndex(el);
        if (el.getAttribute && el.getAttribute('id') && (!sd.para.heatmap || (sd.para.heatmap && sd.para.heatmap.element_selector !== 'not_use_id'))) {
          return '#' + el.getAttribute('id');
        } else {
          return el.tagName.toLowerCase() + (~i ? ':nth-of-type(' + (i + 1) + ')' : '');
        }
      },
      getDomSelector: function(el, arr) {
        if (!el || !el.parentNode || !el.parentNode.children) {
          return false;
        }
        arr = arr && arr.join ? arr : [];
        var name = el.nodeName.toLowerCase();
        if (!el || name === 'body' || 1 != el.nodeType) {
          arr.unshift('body');
          return arr.join(' > ');
        }
        arr.unshift(this.selector(el));
        if (el.getAttribute && el.getAttribute('id') && (sd.para.heatmap && sd.para.heatmap.element_selector !== 'not_use_id')) return arr.join(' > ');
        return this.getDomSelector(el.parentNode, arr);
      },
      na: function() {
        var a = document.documentElement.scrollLeft || window.pageXOffset;
        return parseInt(isNaN(a) ? 0 : a, 10);
      },
      i: function() {
        var a = 0;
        try {
          a = o.documentElement && o.documentElement.scrollTop || m.pageYOffset,
            a = isNaN(a) ? 0 : a;
        } catch (b) {
          a = 0;
        }
        return parseInt(a, 10);
      },
      getBrowserWidth: function() {
        var a = window.innerWidth || document.body.clientWidth;
        return isNaN(a) ? 0 : parseInt(a, 10);
      },
      getBrowserHeight: function() {
        var a = window.innerHeight || document.body.clientHeight;
        return isNaN(a) ? 0 : parseInt(a, 10);
      },
      getScrollWidth: function() {
        var a = parseInt(document.body.scrollWidth, 10);
        return isNaN(a) ? 0 : a;
      },
      W: function(a) {
        var b = parseInt(+a.clientX + +this.na(), 10);
        var a = parseInt(+a.clientY + +this.i(), 10);
        return {
          x: isNaN(b) ? 0 : b,
          y: isNaN(a) ? 0 : a
        }
      },
      start: function(ev, target, tagName, customProps, callback) {
        var userCustomProps = _.isObject(customProps) ? customProps : {};
        var userCallback = _.isFunction(callback) ? callback : _.isFunction(customProps) ? customProps : undefined;
        if (sd.para.heatmap && sd.para.heatmap.collect_element && !sd.para.heatmap.collect_element(target)) {
          return false;
        }

        var selector = this.getDomSelector(target);
        var prop = _.getEleInfo({
          target: target
        });

        prop.$element_selector = selector ? selector : '';
        if (sd.para.heatmap && sd.para.heatmap.custom_property) {
          var customP = sd.para.heatmap.custom_property(target);
          if (_.isObject(customP)) {
            prop = _.extend(prop, customP);
          }
        }
        prop = _.extend(prop, userCustomProps);
        if (tagName === 'a' && sd.para.heatmap && sd.para.heatmap.isTrackLink === true) {
          _.trackLink({
            event: ev,
            target: target
          }, '$WebClick', prop);
        } else {
          sd.track('$WebClick', prop, userCallback);
        }

      },
      hasElement: function(e) {
        var path = e._getPath();
        if (_.isArray(path) && (path.length > 0)) {
          for (var i = 0; i < path.length; i++) {
            if (path[i] && path[i].tagName && (path[i].tagName.toLowerCase() === 'a')) {
              return path[i];
            }
          }
        }
        return false;
      },

      initScrollmap: function() {
        if (!_.isObject(sd.para.heatmap) || sd.para.heatmap.scroll_notice_map !== 'default') {
          return false;
        }

        if (sd.para.scrollmap && _.isFunction(sd.para.scrollmap.collect_url) && !sd.para.scrollmap.collect_url()) {
          return false;
        }

        var interDelay = function(param) {
          var interDelay = {};
          interDelay.timeout = param.timeout || 1000;
          interDelay.func = param.func;
          interDelay.hasInit = false;
          interDelay.inter = null;
          interDelay.main = function(para, isClose) {
            this.func(para, isClose);
            this.inter = null;
          };
          interDelay.go = function(isNoDelay) {
            var me = this;
            var para = {};
            if (!this.inter) {
              para.$viewport_position = document.documentElement && document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop || 0;
              para.$viewport_position = Math.round(para.$viewport_position) || 0;
              para.$viewport_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
              para.$viewport_width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;
              if (isNoDelay) {
                interDelay.main(para, true);
              } else {

                this.inter = setTimeout(function() {
                  interDelay.main(para);
                }, this.timeout);

              }
            }
          };
          return interDelay;
        };


        var delayTime = interDelay({
          timeout: 1000,
          func: function(para, isClose) {
            var offsetTop = document.documentElement && document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop || 0;
            var current_time = new Date();
            var delay_time = current_time - this.current_time;
            if ((delay_time > sd.para.heatmap.scroll_delay_time && offsetTop - para.$viewport_position !== 0) || isClose) {
              para.$url = location.href;
              para.$title = document.title;
              para.$url_path = location.pathname;
              para.event_duration = Math.min(sd.para.heatmap.scroll_event_duration, parseInt(delay_time) / 1000);
              sd.track('$WebStay', para);
            }
            this.current_time = current_time;
          }
        });

        delayTime.current_time = new Date();


        _.addEvent(window, 'scroll', function() {
          delayTime.go();
        });

        _.addEvent(window, 'unload', function() {
          delayTime.go('notime');
        });


      },
      initHeatmap: function() {
        var that = this;
        if (!_.isObject(sd.para.heatmap) || sd.para.heatmap.clickmap !== 'default') {
          return false;
        }

        if (_.isFunction(sd.para.heatmap.collect_url) && !sd.para.heatmap.collect_url()) {
          return false;
        }

        if (sd.para.heatmap.collect_elements === 'all') {
          sd.para.heatmap.collect_elements = 'all';
        } else {
          sd.para.heatmap.collect_elements = 'interact';
        }

        if (sd.para.heatmap.collect_elements === 'all') {
          _.addEvent(document, 'click', function(e) {
            var ev = e || window.event;
            if (!ev) {
              return false;
            }
            var target = ev.target || ev.srcElement;
            if (typeof target !== 'object') {
              return false;
            }
            if (typeof target.tagName !== 'string') {
              return false;
            }
            var tagName = target.tagName.toLowerCase();
            if (tagName === 'body' || tagName === 'html') {
              return false;
            }
            if (!target || !target.parentNode || !target.parentNode.children) {
              return false;
            }
            var parent_ele = target.parentNode.tagName.toLowerCase();
            if (parent_ele === 'a' || parent_ele === 'button') {
              that.start(ev, target.parentNode, parent_ele);
            } else {
              that.start(ev, target, tagName);
            }
          });

        } else {
          _.addEvent(document, 'click', function(e) {
            var ev = e || window.event;
            if (!ev) {
              return false;
            }
            var target = ev.target || ev.srcElement;
            if (typeof target !== 'object') {
              return false;
            }
            if (typeof target.tagName !== 'string') {
              return false;
            }
            var tagName = target.tagName.toLowerCase();
            if (tagName.toLowerCase() === 'body' || tagName.toLowerCase() === 'html') {
              return false;
            }
            if (!target || !target.parentNode || !target.parentNode.children) {
              return false;
            }

            var parent_ele = target.parentNode;

            if (tagName === 'a' || tagName === 'button' || tagName === 'input' || tagName === 'textarea') {
              that.start(ev, target, tagName);
            } else if (parent_ele.tagName.toLowerCase() === 'button' || parent_ele.tagName.toLowerCase() === 'a') {
              that.start(ev, parent_ele, target.parentNode.tagName.toLowerCase());
            } else if (tagName === 'area' && parent_ele.tagName.toLowerCase() === 'map' && _.ry(parent_ele).prev().tagName && _.ry(parent_ele).prev().tagName.toLowerCase() === 'img') {
              that.start(ev, _.ry(parent_ele).prev(), _.ry(parent_ele).prev().tagName.toLowerCase());
            } else {
              var hasA = that.hasElement(e);
              if (hasA) {
                that.start(ev, hasA, hasA.tagName.toLowerCase());
              }
            }
          });
        }

      },
      prepare: function(todo) {
        var match = location.search.match(/sa-request-id=([^&#]+)/);
        var type = location.search.match(/sa-request-type=([^&#]+)/);
        var web_url = location.search.match(/sa-request-url=([^&#]+)/);

        var me = this;

        function isReady(data, type, url) {
          if (sd.para.heatmap_url) {
            _.loadScript({
              success: function() {
                setTimeout(function() {
                  if (typeof sa_jssdk_heatmap_render !== 'undefined') {
                    sa_jssdk_heatmap_render(sd, data, type, url);
                    if (typeof console === 'object' && typeof console.log === 'function') {
                      if (!(sd.heatmap_version && (sd.heatmap_version === sd.lib_version))) {
                        console.log('heatmap.js与sensorsdata.js版本号不一致，可能存在风险!');
                      }
                    }
                  }
                }, 0);
              },
              error: function() {},
              type: 'js',
              url: sd.para.heatmap_url
            });
          } else {
            sd.log('没有指定heatmap_url的路径');
          }

        }
        if (match && match[0] && match[1]) {
          heatmap.setNotice(web_url);
          if (_.sessionStorage.isSupport()) {
            if (web_url && web_url[0] && web_url[1]) {
              sessionStorage.setItem('sensors_heatmap_url', decodeURIComponent(web_url[1]));
            }
            sessionStorage.setItem('sensors_heatmap_id', match[1]);

            if (type && type[0] && type[1]) {
              if (type[1] === '1' || type[1] === '2' || type[1] === '3') {
                type = type[1];
                sessionStorage.setItem('sensors_heatmap_type', type);
              } else {
                type = null;
              }
            } else {
              if (sessionStorage.getItem('sensors_heatmap_type') !== null) {
                type = sessionStorage.getItem('sensors_heatmap_type');
              } else {
                type = null;
              }
            }
          }
          isReady(match[1], type);
        } else if (_.sessionStorage.isSupport() && typeof sessionStorage.getItem('sensors_heatmap_id') === 'string') {
          heatmap.setNotice();
          isReady(sessionStorage.getItem('sensors_heatmap_id'), sessionStorage.getItem('sensors_heatmap_type'), location.href);
        } else {
          todo();
          if (_.isObject(sd.para.heatmap)) {
            this.initHeatmap();
            this.initScrollmap();
          }
        }



      }
    };