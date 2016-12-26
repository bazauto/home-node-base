var dgram = require('dgram');

function HomeNodeBase(nodeName) {
	this.Name = nodeName;
	this.MulticastAddress = '239.255.0.1';	// Default multicast address
	this.BroadcastPort = 49152;				// Default port
	this.IsBroadcasting = false;			// Initially we are not broadcasting
	this.IsCommunicating = false;			// Initially we are not communicating
}

HomeNodeBase.prototype.setMulticastAddress = function(newAddress) {
	if (this.IsBroadcasting)
		return false;
	
	this.MulticastAddress = newAddress;
	return true;
};

HomeNodeBase.prototype.setBroadcastPort = function(newPort) {
	if (this.IsBroadcasting)
		return false;
	
	this.BroadcastPort = newPort;
	return true;
};

HomeNodeBase.prototype.startBroadcasting = function() {
	this.server = dgram.createSocket({ type: 'udp4', reuseAddr: true });
	this.server.bind(this.BroadcastPort);
	
	this.server.on('listening', this.onBroadcastSocketListening);
};

HomeNodeBase.prototype.onBroadcastSocketListening = function() {
	this.server.setBroadcast(true);
	this.server.addMembership(this.MulticastAddress);
	this.IsBroadcasting = true;
};

HomeNodeBase.prototype.startCommunications = function() {
	
};

module.exports = HomeNodeBase;