// homebridge-freemote/lib/FreemoteApi.js
// (C) 2016, Michael Denoun
//
// Freebox v6 Api

"use strict";

const request = require('request-promise');
const Promise = require('promise');
const Crypto  = require('crypto');

module.exports = FreemoteApi;

function tryLogin(resolve, reject) {
  const self = this;

  return this.request('login')
    .then(function(data) {
      // Demande de login reussi
      if (data.success) {
        // On créer le password a partir du challenge
        const password = Crypto.createHmac('sha1', self.token).update(data.result.challenge).digest('hex');

        return self.request('login/session', {
          method: 'POST',
          body: JSON.stringify({
            app_id: self.appid,
            password: password
          })
        }).then(function(data) {
          data = JSON.parse(data);
          self.session_token = data.result.session_token;
          return true;
        });
      } else {
        return false;
      }
    })
    .catch(function() {
      return false;
    });
}

function FreemoteApi(log, url, appid, token, remote_code) {
  this.log = log;
  this.url = url + 'api/v3/';
  this.appid = appid;
  this.token = token;
  this.remoteurl = 'http://hd1.freebox.fr/pub/remote_control?code=' + remote_code;
  
  this.session_token = null;
}

FreemoteApi.prototype.request = function(service, params) {
  this.log('making request: ' + this.url + service);
  if (!params) {
    params = {};
    params.json = true;
  }
  params.uri = this.url + service;
  params.timeout = 5000;
  
  if (this.session_token) {
    params.headers = {
			'X-Fbx-App-Auth' : this.session_token
		};
  }
  return request(params);
}

FreemoteApi.prototype.remote = function(key, long) {
  let url = this.remoteurl + '&key=' + key;
  
  if (long) {
    url += '&long=true';
  }
  this.log('making request: ' + url);
  return request(url);
}

FreemoteApi.prototype.login = function() {
  if (this.session_token) {
    return Promise.resolve();  
  } else {
    return tryLogin.call(this);
  }
}

FreemoteApi.prototype.powerStatus = function() {
  var self = this;
  
  return this.login()
    .then(function() {
      return self
        .request('airmedia/receivers/Freebox%20Player/', {
          method: 'POST',
          body: JSON.stringify({
            action: "stop",
            media_type: "video"
          })
        })
        .then(function(data) {
          data = JSON.parse(data);
          return data.success;
        });
    })
    .catch(function() {
      self.session_token = null;
      return null;
    });
}

FreemoteApi.prototype.channel = function(chan) {
  for (let i = 0; i < chan.length; ++i) {
    this.remote(chan[i]);
  }
}

FreemoteApi.prototype.volume = function(vol) {
  let key = null;
  
  if ('up' === vol) {
    key = 'vol_inc';
  } else if ('down' === vol) {
    key = 'vol_dec';
  }
  
  if (key) {
    for (let i = 0; i < 20; ++i) {
      setTimeout(this.remote.bind(this, key), i * 100);
    }
  }
}

FreemoteApi.prototype.power = function(toggle) {
  const self = this;
  
  return this
    .powerStatus()
    .then(function(on) {
      if (null === on) {
        return false;
      }
      if (on && !toggle) {
        return self.remote('power');
      } else if (!on && toggle) {
        return self
          .remote('power')
          .then(function() {
            setTimeout(self.remote.bind(self, 'ok'), 5000);
          });
      }
      return false;
    });
}