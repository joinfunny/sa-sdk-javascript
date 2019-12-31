 import utils from './utils'
 var store = sd.store = {
      requests: [],
      _sessionState: {},
      _state: {
        distinct_id: '',
        first_id: '',
        props: {}
      },
      getProps: function() {
        return this._state.props || {};
      },
      getSessionProps: function() {
        return this._sessionState;
      },
      getDistinctId: function() {
        return this._state.distinct_id;
      },
      getUnionId: function() {
        var obj = {};
        var firstId = this._state.first_id,
          distinct_id = this._state.distinct_id;
        if (firstId && distinct_id) {
          obj.login_id = distinct_id;
          obj.anonymous_id = firstId;
        } else {
          obj.anonymous_id = distinct_id;
        }
        return obj;
      },
      getFirstId: function() {
        return this._state.first_id;
      },
      toState: function(ds) {
        var state = null;
        if (ds != null && utils.isJSONString(ds)) {
          state = JSON.parse(ds);
          this._state = utils.extend(state);
          if (state.distinct_id) {
            if (typeof(state.props) === 'object') {
              for (var key in state.props) {
                if (typeof state.props[key] === 'string') {
                  state.props[key] = state.props[key].slice(0, sd.para.max_referrer_string_length);
                }
              }
              this.save();
            }

          } else {
            this.set('distinct_id', utils.UUID());
            sd.debug.distinct_id('1', ds);
          }
        } else {
          this.set('distinct_id', utils.UUID());
          sd.debug.distinct_id('2', ds);
        }
      },
      initSessionState: function() {
        var ds = utils.cookie.get('sensorsdata2015session');
        var state = null;
        if (ds !== null && (typeof(state = JSON.parse(ds)) === 'object')) {
          this._sessionState = state || {};
        }
      },

      setOnce: function(a, b) {
        if (!(a in this._state)) {
          this.set(a, b);
        }
      },
      set: function(name, value) {
        this._state = this._state || {};
        this._state[name] = value;
        this.save();
      },
      change: function(name, value) {
        this._state[name] = value;
      },
      setSessionProps: function(newp) {
        var props = this._sessionState;
        utils.extend(props, newp);
        this.sessionSave(props);
      },
      setSessionPropsOnce: function(newp) {
        var props = this._sessionState;
        utils.coverExtend(props, newp);
        this.sessionSave(props);
      },
      setProps: function(newp, isCover) {
        var props = {};
        if (!isCover) {
          props = utils.extend((this._state.props || {}), newp);
        } else {
          props = newp;
        }
        for (var key in props) {
          if (typeof props[key] === 'string') {
            props[key] = props[key].slice(0, sd.para.max_referrer_string_length);
          }
        }
        this.set('props', props);
      },
      setPropsOnce: function(newp) {
        var props = this._state.props || {};
        utils.coverExtend(props, newp);
        this.set('props', props);
      },
      clearAllProps: function(arr) {
        this._sessionState = {};
        if (_.isArray(arr) && arr.length > 0) {
          for (var i = 0; i < arr.length; i++) {
            if (_.isString(arr[i]) && arr[i].indexOf('latest_') === -1 && arr[i] in this._state.props) {
              delete this._state.props[arr[i]];
            }
          }
        } else {
          for (var i in this._state.props) {
            if (i.indexOf('latest_') !== 1) {
              delete this._state.props[i];
            }
          }
        }
        this.sessionSave({});
        this.save();
      },
      sessionSave: function(props) {
        this._sessionState = props;
        utils.cookie.set('sensorsdata2015session', JSON.stringify(this._sessionState), 0);
      },
      save: function() {
        utils.cookie.set(this.getCookieName(), JSON.stringify(this._state), 73000, sd.para.cross_subdomain);
      },
      getCookieName: function() {
        var sub = '';
        if (sd.para.cross_subdomain === false) {
          try {
            sub = utils.URL(location.href).hostname;
          } catch (e) {}
          if (typeof sub === 'string' && sub !== '') {
            sub = 'sa_jssdk_2015_' + sub.replace(/\./g, '_');
          } else {
            sub = 'sa_jssdk_2015_root';
          }
        } else {
          sub = 'sensorsdata2015jssdkcross';
        }
        return sub;
      },
      init: function() {

        this.initSessionState();
        var uuid = utils.UUID();
        var cross = utils.cookie.get(this.getCookieName());
        if (cross === null) {
          sd.is_first_visitor = true;

          this.set('distinct_id', uuid);
        } else {

          if (!_.isJSONString(cross) || !(JSON.parse(cross)).distinct_id) {
            sd.is_first_visitor = true;
          }

          this.toState(cross);
        }


        saNewUser.setDeviceId(uuid);

        saNewUser.storeInitCheck();
        saNewUser.checkIsFirstLatest();

      }
    };