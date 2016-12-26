var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var HomeNodeBase = require('./../../src/home-node-base');
var dgram = require('dgram');

describe('HomeNodeBase', function() {
	
	describe('Constructor', function() {
		var homeNodeBase = new HomeNodeBase('testNode');
		
		it('should store the node name it has been supplied', function() {
			expect(homeNodeBase.Name).to.equal('testNode');
		});
		it('should set a default multicast address of 239.255.0.1', function() {
			expect(homeNodeBase.MulticastAddress).to.equal('239.255.0.1');
		});
		it('should set a defatul broadcast port of 49152', function() {
			expect(homeNodeBase.BroadcastPort).to.equal(49152);
		});
		it('should initially be not broadcasting', function() {
			expect(homeNodeBase.IsBroadcasting).to.equal(false);
		});
		it('should initially be not communicating', function() {
			expect(homeNodeBase.IsCommunicating).to.equal(false);
		});
	});
	
	describe('Options Manipulation', function() {
	
		describe('Multicast Address', function() {
			var homeNodeBase = new HomeNodeBase('testNode');
			
			it('should be able to set the multicast address when not broadcasting', function() {
				homeNodeBase.IsBroadcasting = false;
				expect(homeNodeBase.setMulticastAddress('224.0.0.1')).to.equal(true);
				expect(homeNodeBase.MulticastAddress).to.equal('224.0.0.1');
			});
			
			it('should fail to set the multicast address when broadcasting', function() {
				// Ensure we know what the port is and set to broadcasting
				homeNodeBase.setMulticastAddress('224.0.0.1');
				homeNodeBase.IsBroadcasting = true;
				// Attempt to change the port which should fail
				expect(homeNodeBase.setMulticastAddress('224.0.0.2')).to.equal(false);
				// Ensure the port remains unchanged
				expect(homeNodeBase.MulticastAddress).to.equal('224.0.0.1');
			});
			
		});
		
		describe('Broadcast Port', function() {
			var homeNodeBase = new HomeNodeBase('testNode');
			
			it('should be able to set the broadcast port when not broadcasting', function() {
				homeNodeBase.IsBroadcasting = false;
				expect(homeNodeBase.setBroadcastPort(1234)).to.equal(true);
				expect(homeNodeBase.BroadcastPort).to.equal(1234);
			});
			
			it('should fail to set the broadcast port when broadcasting', function() {
				// Ensure we know what the port is and set to broadcasting
				homeNodeBase.setBroadcastPort(1234);
				homeNodeBase.IsBroadcasting = true;
				// Attempt to change the port which should fail
				expect(homeNodeBase.setBroadcastPort(5678)).to.equal(false);
				// Ensure the port remains unchanged
				expect(homeNodeBase.BroadcastPort).to.equal(1234);
			});
			
		});
	});
	
	describe('Node Discovery', function() {
		var homeNodeBase = null;
		var mockDgram = null;
		var bindSpy = null;
		var onSpy = null;
		
		beforeEach('mock dgram API', function() {
			// Create a new object to test each time
			homeNodeBase = new HomeNodeBase('testNode');
			
			// Mock out the calls that we expect to make into the UDP library
			mockDgram = sinon.mock(dgram);
			bindSpy = sinon.spy();
			onSpy = sinon.spy();
			setBroadcastSpy = sinon.spy();
			addMembershipSpy = sinon.spy();
			
			mockDgram.expects("createSocket").once().withArgs({ type: 'udp4', reuseAddr: true }).returns({
				bind: bindSpy,
				on: onSpy,
				setBroadcast: setBroadcastSpy,
				addMembership: addMembershipSpy
			});
		});
		
		afterEach('release mock of dgram API', function() {
			mockDgram.restore();		
		});
		
		describe('startBroadcasting', function() {
			it('should create UDP Socket with address reuse enabled', function() {
				homeNodeBase.startBroadcasting();
	
				mockDgram.verify();
			});
			
			it('should bind the UDP Socket to the configured broadcast port', function() {
				homeNodeBase.BroadcastPort = 1234;
				homeNodeBase.startBroadcasting();
	
				expect(bindSpy.calledOnce).to.equal(true);
				expect(bindSpy.calledWith(1234)).to.equal(true);
			});	
			
			it('should bind the UDP Socket before registering for the listening event', function() {
				homeNodeBase.startBroadcasting();
	
				expect(bindSpy.calledOnce).to.equal(true);
				expect(bindSpy.calledBefore(onSpy)).to.equal(true);
			});	
			
			it('should register for the listening event', function() {
				homeNodeBase.startBroadcasting();
	
				expect(onSpy.calledOnce).to.equal(true);
				expect(onSpy.calledWith('listening', homeNodeBase.onBroadcastSocketListening)).to.equal(true);
			});	
			
			it('should register for the listening event after binding', function() {
				homeNodeBase.startBroadcasting();
	
				expect(onSpy.calledOnce).to.equal(true);
				expect(onSpy.calledAfter(bindSpy)).to.equal(true);
			});
		});
		
		describe('onBroadcastSocketListening', function() {
			
			it('should set the socket to allow broadcast', function() {
				homeNodeBase.startBroadcasting();
				homeNodeBase.onBroadcastSocketListening();
	
				expect(setBroadcastSpy.calledOnce).to.equal(true);
				expect(setBroadcastSpy.calledWith(true)).to.equal(true);
			});
			
			it('should add the socket to the Multicast group', function() {
				homeNodeBase.MulticastAddress = '224.0.0.1'; // Change from default to allow check
				homeNodeBase.startBroadcasting();
				homeNodeBase.onBroadcastSocketListening();
	
				expect(addMembershipSpy.calledOnce).to.equal(true);
				expect(addMembershipSpy.calledWith(homeNodeBase.MulticastAddress)).to.equal(true);
			});
			
			it('should end in the node being in the broadcasting state', function() {
				homeNodeBase.startBroadcasting();
				homeNodeBase.onBroadcastSocketListening();
	
				expect(homeNodeBase.IsBroadcasting).to.equal(true);
			});
		});
	});
	
	describe('Node Communications', function() {
		
	});
	
});