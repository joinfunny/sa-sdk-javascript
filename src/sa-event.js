 var saEvent = {};

    saEvent.checkOption = {
      regChecks: {
        regName: /^((?!^distinct_id$|^original_id$|^time$|^properties$|^id$|^first_id$|^second_id$|^users$|^events$|^event$|^user_id$|^date$|^datetime$)[a-zA-Z_$][a-zA-Z\d_$]{0,99})$/i
      },
      checkPropertiesKey: function(obj) {
        var me = this,
          flag = true;
        _.each(obj, function(content, key) {
          if (!me.regChecks.regName.test(key)) {
            flag = false;
          }
        });
        return flag;
      },
      check: function(a, b) {
        if (typeof this[a] === 'string') {
          return this[this[a]](b);
        } else {
          return this[a](b);
        }
      },
      str: function(s) {
        if (!_.isString(s)) {
          sd.log('请检查参数格式,必须是字符串');
          return true;
        } else {
          return true;
        }
      },
      properties: function(p) {
        _.strip_sa_properties(p);
        if (p) {
          if (_.isObject(p)) {
            if (this.checkPropertiesKey(p)) {
              return true;
            } else {
              sd.log('properties 里的自定义属性名需要是合法的变量名，不能以数字开头，且只包含：大小写字母、数字、下划线，自定义属性不能以 $ 开头');
              return true;
            }
          } else {
            sd.log('properties可以没有，但有的话必须是对象');
            return true;
          }
        } else {
          return true;
        }
      },
      propertiesMust: function(p) {
        _.strip_sa_properties(p);
        if (p === undefined || !_.isObject(p) || _.isEmptyObject(p)) {
          sd.log('properties必须是对象且有值');
          return true;
        } else {
          if (this.checkPropertiesKey(p)) {
            return true;
          } else {
            sd.log('properties 里的自定义属性名需要是合法的变量名，不能以数字开头，且只包含：大小写字母、数字、下划线，自定义属性不能以 $ 开头');
            return true;
          }
        }
      },
      event: function(s) {
        if (!_.isString(s) || !this['regChecks']['regName'].test(s)) {
          sd.log('请检查参数格式，eventName 必须是字符串，且需是合法的变量名，即不能以数字开头，且只包含：大小写字母、数字、下划线和 $,其中以 $ 开头的表明是系统的保留字段，自定义事件名请不要以 $ 开头');
          return true;
        } else {
          return true;
        }

      },
      test_id: 'str',
      group_id: 'str',
      distinct_id: function(id) {
        if (_.isString(id) && /^.{1,255}$/.test(id)) {
          return true;
        } else {
          sd.log('distinct_id必须是不能为空，且小于255位的字符串');
          return false;
        }
      }
    };

    saEvent.check = function(p) {
      var flag = true;
      for (var i in p) {
        if (!this.checkOption.check(i, p[i])) {
          return false;
        }
      }
      return flag;
    };

    saEvent.send = function(p, callback) {
      var data = {
        distinct_id: store.getDistinctId(),
        lib: {
          $lib: 'js',
          $lib_method: 'code',
          $lib_version: String(sd.lib_version)
        },
        properties: {}
      };

      if (_.isObject(p) && _.isObject(p.properties) && !_.isEmptyObject(p.properties) && p.properties.$lib_detail) {
        data.lib.$lib_detail = p.properties.$lib_detail;
        delete p.properties.$lib_detail;
      }
      _.extend(data, sd.store.getUnionId(), p);

      if (_.isObject(p.properties) && !_.isEmptyObject(p.properties)) {
        _.extend(data.properties, p.properties);
      }

      if (!p.type || p.type.slice(0, 7) !== 'profile') {

        data.properties = _.extend({}, _.info.properties(), store.getProps(), store.getSessionProps(), _.info.currentProps, data.properties);
        if (sd.para.preset_properties.latest_referrer && !_.isString(data.properties.$latest_referrer)) {
          data.properties.$latest_referrer = '取值异常';
        }
        if (sd.para.preset_properties.latest_search_keyword && !_.isString(data.properties.$latest_search_keyword)) {
          data.properties.$latest_search_keyword = '取值异常';
        }
        if (sd.para.preset_properties.latest_traffic_source_type && !_.isString(data.properties.$latest_traffic_source_type)) {
          data.properties.$latest_traffic_source_type = '取值异常';
        }
        if (sd.para.preset_properties.latest_landing_page && !_.isString(data.properties.$latest_landing_page)) {
          data.properties.$latest_landing_page = '取值异常';
        }
      }

      if (data.properties.$time && _.isDate(data.properties.$time)) {
        data.time = data.properties.$time * 1;
        delete data.properties.$time;
      } else {
        if (sd.para.use_client_time) {
          data.time = (new Date()) * 1;
        }
      }
      _.parseSuperProperties(data.properties);

      _.searchObjDate(data);
      _.searchObjString(data);
      _.searchZZAppStyle(data);

      var data_config = _.searchConfigData(data.properties);

      saNewUser.checkIsAddSign(data);
      saNewUser.checkIsFirstTime(data);

      sd.addReferrerHost(data);
      sd.addPropsHook(data);

      if (sd.para.debug_mode === true) {
        sd.log(data);
        this.debugPath(JSON.stringify(data), callback);
      } else {
        sd.sendState.getSendCall(data, data_config, callback);
      }

    };

    saEvent.debugPath = function(data, callback) {
      var _data = data;
      var url = '';
      if (sd.para.debug_mode_url.indexOf('?') !== -1) {
        url = sd.para.debug_mode_url + '&data=' + encodeURIComponent(_.base64Encode(data));
      } else {
        url = sd.para.debug_mode_url + '?data=' + encodeURIComponent(_.base64Encode(data));
      }

      _.ajax({
        url: url,
        type: 'GET',
        cors: true,
        header: {
          'Dry-Run': String(sd.para.debug_mode_upload)
        },
        success: function(data) {
          _.isEmptyObject(data) === true ? alert('debug数据发送成功' + _data) : alert('debug失败 错误原因' + JSON.stringify(data));
        }
      });

    };

