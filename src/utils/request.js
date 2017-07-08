const rlib = require('request')
const ulib = require('url')

const proxyServers = require('./proxy-servers')

const defaultOptions = {
  delay: 0,
  timeout: 1000,
  connectionTimeout: 1000
}

class Request {
  constructor(host, options = {}) {
    this.url = new ulib.URL(host)
    this.options = Object.assign(defaultOptions, options)
  }

  get(path, params = {}) {
    const self = this

    if (typeof path === 'object') {
      params = path
      path = this.url.pathname
    }

    this.url.pathname = path

    return new Promise((resolve, reject) => {
      for (let param in params) {
        this.url.searchParams.append(param, params[param])
      }

      const options = {
        'url': this.url.toString(),
        'timeout': this.options.timeout,
        'connectionTimeout': this.options.connectionTimeout
      }

      if (this.options.proxy) {
        if (typeof this.options.proxy === 'string') {
          options.proxy = 'http://' + this.options.proxy
        } else {
          options.proxy = 'http://' + proxyServers[Math.floor(Math.random() * proxyServers.length)]
        }
      }

      setTimeout(() => {
        self.doRequest(options).then(
          response => resolve(response),
          error => reject(error)
        )
      }, self.options.delay)
    })
  }

  doRequest(options = {}) {
    return new Promise((resolve, reject) => {
      let isRunning = true

      const r = rlib(options, (err, resp, body) => {
        isRunning = false

        if (err) {
          return reject(err)
        }

        const headers = Object.assign({ 'content-type': 'text/html' }, resp.headers)
        const [contentType, charset] = headers['content-type'].split('; ')

        switch (contentType) {
          case 'application/json':
            return resolve(JSON.parse(body))
          break

          default:
            return resolve(body)
          break
        }
      })

      setTimeout(() => {
        if (isRunning) {
          r.abort()
          return reject({ code: 'ESOCKETTIMEDOUT' })
        }
      }, options.connectionTimeout)
    })
  }
}

function request(url, params = {}) {
  return new Request(url, params)
}

module.exports = request
