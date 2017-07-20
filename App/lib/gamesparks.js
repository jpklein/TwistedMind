/* global WebSocket */
import CryptoJS from 'crypto-js'

(function (factory) {
  module.exports = factory(CryptoJS, WebSocket)
}(function (CryptoJS, WebSocket) {
  var GameSparks = function () {}

  GameSparks.prototype = {

    init: function (options) {
      this.options = options
      this.socketUrl = options.url
      this.pendingRequests = {}
      this.requestCounter = 0
      this.connect()
    },

    initPreview: function (options) {
      options.url = 'wss://preview.gamesparks.net/ws/' + options.key
      this.init(options)
    },

    initLive: function (options) {
      options.url = 'wss://service.gamesparks.net/ws/' + options.key
      this.init(options)
    },

    reset: function () {
      this.initialised = false
      this.connected = false
      this.error = false
      this.disconnected = false
      if (this.webSocket != null) {
        this.webSocket.onclose = null
        this.webSocket.close()
      }
    },

    connect: function () {
      this.reset()
      try {
        this.webSocket = new WebSocket(this.socketUrl)
        this.webSocket.onopen = this.onWebSocketOpen.bind(this)
        this.webSocket.onclose = this.onWebSocketClose.bind(this)
        this.webSocket.onerror = this.onWebSocketError.bind(this)
        this.webSocket.onmessage = this.onWebSocketMessage.bind(this)
      } catch (e) {
        this.log(e.message)
      }
    },

    disconnect: function () {
      if (this.webSocket && this.connected) {
        this.disconnected = true
        this.webSocket.close()
      }
    },

    onWebSocketOpen: function (ev) {
      this.log('WebSocket onOpen')
      if (this.options.onOpen) {
        this.options.onOpen(ev)
      }
      this.connected = true
    },

    onWebSocketClose: function (ev) {
      this.log('WebSocket onClose')
      if (this.options.onClose) {
        this.options.onClose(ev)
      }
      this.connected = false
      // Attemp a re-connection if not in error state or deliberately disconnected.
      if (!this.error && !this.disconnected) {
        this.connect()
      }
    },

    onWebSocketError: function (ev) {
      this.log('WebSocket onError: Sorry, but there is some problem with your socket or the server is down')
      if (this.options.onError) {
        this.options.onError(ev)
      }
      // Reset the socketUrl to the original.
      this.socketUrl = this.options.url
      this.error = true
    },

    onWebSocketMessage: function (message) {
      this.log('WebSocket onMessage: ' + message.data)
      var result
      try {
        result = JSON.parse(message.data)
      } catch (e) {
        this.log('An error ocurred while parsing the JSON Data: ' + message + '; Error: ' + e)
        return
      }
      if (this.options.onMessage) {
        this.options.onMessage(result)
      }
      // Extract any auth token.
      if (result['authToken']) {
        this.authToken = result['authToken']
        delete result['authToken']
      }
      if (result['connectUrl']) {
        // Any time a connectUrl is in the response we should update and reconnect.
        this.socketUrl = result['connectUrl']
        this.connect()
      }
      var resultType = result['@class']
      if (resultType === '.AuthenticatedConnectResponse') {
        this.handshake(result)
      } else if (resultType.match(/Response$/)) {
        if (result['requestId']) {
          var requestId = result['requestId']
          delete result['requestId']
          if (this.pendingRequests[requestId]) {
            this.pendingRequests[requestId](result)
            this.pendingRequests[requestId] = null
          }
        }
      }
    },

    handshake: function (result) {
      if (result['nonce']) {
        var hmac
        if (this.options.onNonce) {
          hmac = this.options.onNonce(result['nonce'])
        } else {
          hmac = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(result['nonce'], this.options.secret))
        }
        var toSend = {
          '@class': '.AuthenticatedConnectRequest',
          hmac: hmac
        }
        if (this.authToken) {
          toSend.authToken = this.authToken
        }
        if (this.sessionId) {
          toSend.sessionId = this.sessionId
        }
        const browserData = this.getBrowserData()
        toSend.platform = browserData.browser
        toSend.os = browserData.operatingSystem
        this.webSocketSend(toSend)
      } else if (result['sessionId']) {
        this.sessionId = result['sessionId']
        this.initialised = true
        if (this.options.onInit) {
          this.options.onInit()
        }
        this.keepAliveInterval = window.setInterval(this.keepAlive.bind(this), 30000)
      }
    },

    keepAlive: function () {
      if (this.initialised && this.connected) {
        this.webSocket.send(' ')
      }
    },

    send: function (requestType, onResponse) {
      this.sendWithData(requestType, {}, onResponse)
    },

    sendWithData: function (requestType, json, onResponse) {
      if (!this.initialised) {
        onResponse({ error: 'NOT_INITIALISED' })
        return
      }
      // Ensure requestType starts with a dot.
      if (requestType.indexOf('.') !== 0) {
        requestType = '.' + requestType
      }
      json['@class'] = requestType
      json.requestId = (new Date()).getTime() + '_' + (++this.requestCounter)
      if (onResponse != null) {
        this.pendingRequests[json.requestId] = onResponse
        // Time out handler.
        setTimeout(function () {
          if (this.pendingRequests[json.requestId]) {
            this.pendingRequests[json.requestId]({ error: 'NO_RESPONSE' })
          }
        }.bind(this), 32000)
      }
      this.webSocketSend(json)
    },

    webSocketSend: function (data) {
      if (this.options.onSend) {
        this.options.onSend(data)
      }
      var requestString = JSON.stringify(data)
      this.log('WebSocket send: ' + requestString)
      this.webSocket.send(requestString)
    },

    getSocketUrl: function () {
      return this.socketUrl
    },

    getSessionId: function () {
      return this.sessionId
    },

    getAuthToken: function () {
      return this.authToken
    },

    setAuthToken: function (authToken) {
      this.authToken = authToken
    },

    isConnected: function () {
      return this.connected
    },

    log: function (message) {
      if (this.options.logger) {
        this.options.logger(message)
      }
    },

    getBrowserData: function () {
      var browsers = [
        {
          string: navigator.userAgent,
          subString: 'Chrome',
          identity: 'Chrome'
        }, {
          string: navigator.userAgent,
          subString: 'OmniWeb',
          versionSearch: 'OmniWeb/',
          identity: 'OmniWeb'
        }, {
          string: navigator.vendor,
          subString: 'Apple',
          identity: 'Safari',
          versionSearch: 'Version'
        }, {
          prop: window.opera,
          identity: 'Opera',
          versionSearch: 'Version'
        }, {
          string: navigator.vendor,
          subString: 'iCab',
          identity: 'iCab'
        }, {
          string: navigator.vendor,
          subString: 'KDE',
          identity: 'Konqueror'
        }, {
          string: navigator.userAgent,
          subString: 'Firefox',
          identity: 'Firefox'
        }, {
          string: navigator.vendor,
          subString: 'Camino',
          identity: 'Camino'
        }, {
          string: navigator.userAgent,
          subString: 'Netscape',
          identity: 'Netscape'
        }, {
          string: navigator.userAgent,
          subString: 'MSIE',
          identity: 'Explorer',
          versionSearch: 'MSIE'
        }, {
          string: navigator.userAgent,
          subString: 'Gecko',
          identity: 'Mozilla',
          versionSearch: 'rv'
        }, {
          string: navigator.userAgent,
          subString: 'Mozilla',
          identity: 'Netscape',
          versionSearch: 'Mozilla'
        }
      ]
      var operatingSystems = [
        {
          string: navigator.platform,
          subString: 'Win',
          identity: 'Windows'
        }, {
          string: navigator.platform,
          subString: 'Mac',
          identity: 'Mac'
        }, {
          string: navigator.userAgent,
          subString: 'iPhone',
          identity: 'iPhone/iPod'
        }, {
          string: navigator.platform,
          subString: 'Linux',
          identity: 'Linux'
        }
      ]
      function searchForIdentity (data) {
        for (var i = 0; i < data.length; i++) {
          var string = data[i].string
          var prop = data[i].prop
          if (string) {
            // Look for the sub string in the string.
            if (string.indexOf(data[i].subString) !== -1) {
              return data[i].identity
            }
          } else if (prop) {
            return data[i].identity
          }
        }
      }
      return {
        browser: searchForIdentity(browsers),
        operatingSystem: searchForIdentity(operatingSystems)
      }
    }
  }

  return GameSparks
}))
