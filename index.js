// homebridge-freemote/index.js
// (C) 2016, Michael Denoun
//
// Homebridge plug-in for Freebox v6 remote.

"use strict";

const request = require("request");
const inherits = require('util').inherits;
const FreemoteApi = require("./lib/FreemoteApi");

let Service, Characteristic, VolumeCharacteristic, ChannelCharacteristic, KeyCharacteristic;

module.exports = function(homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	
	homebridge.registerAccessory("homebridge-freemote", "Freemote", FreemoteAccessory);
};

//
// Freemote Accessory
//

function FreemoteAccessory(log, config) {
	this.log = log;
	this.config = config;
	this.name = config["name"];
	
	this.remote_code = config["remote_code"];
	this.freebox_ip = config["freebox_ip"];
	this.send_delay = config["send_delay"] || 1;
	this.appid = config["appid"];
	this.token = config["token"];

	if (!this.remote_code) throw new Error("You must provide a config value for 'remote_code'.");
	if (!this.freebox_ip) throw new Error("You must provide a config value for 'freebox_ip'.");

	this.Api = new FreemoteApi(this.log, this.freebox_ip, this.appid, this.token, this.remote_code);

	this.channel = 1;

	this.service = new Service.Lightbulb(this.name);

	this.service
		.getCharacteristic(Characteristic.On)
		.on('get', this._getOn.bind(this))
		.on('set', this._setOn.bind(this));

	this.service
		.addCharacteristic(new Characteristic.Brightness())
		.on('get', this._getChannel.bind(this))
		.on('set', this._setChannel.bind(this));
}

FreemoteAccessory.prototype.getInformationService = function() {
	var informationService = new Service.AccessoryInformation();
	informationService
		.setCharacteristic(Characteristic.Name, this.name)
		.setCharacteristic(Characteristic.Manufacturer, 'Freebox Remote')
		.setCharacteristic(Characteristic.Model, '1.0.0')
		.setCharacteristic(Characteristic.SerialNumber, this.remote_code);
	return informationService;
};

FreemoteAccessory.prototype.getServices = function() {
	return [this.service, this.getInformationService()];
};

FreemoteAccessory.prototype._getOn = function(callback) {
	var self = this;
	this.log('get power state...');
	this.Api
		.powerStatus()
		.then(function(status) {
			self.log('power state: ' + status);
			callback(null, status);
		});
};

FreemoteAccessory.prototype._setOn = function(on, callback) {
	var self = this;
	this.log('trying to set TV: ' + on);
	this.Api.power(on)
		.then(function(toggle) {
			self.log('done setting TV: ' + toggle);
			callback(null);
		});
};

FreemoteAccessory.prototype._getChannel = function(callback) {
	callback(null, this.channel);
};

function changeChannel(callback) {
	this.Api.channel(this.channel);
	callback(null, this.channel);
}

FreemoteAccessory.prototype._setChannel = function(channel, callback) {
	this.log('Changing channel to %s.', JSON.stringify(channel));
	this.channel = '' + channel;
	this._chTmo = setTimeout(changeChannel.bind(this, callback), 2000);
};
