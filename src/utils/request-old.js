const http  = require('http')
const https = require('https')

const zlib = require('zlib')
const ulib = require('url')
const qstring = require('querystring')

const defaultOptions = {
  delay: 0,
  sleep: 0,
  timeout: 5
}

class Request {
  constructor(host, options = {}) {
    this.url = new ulib.URL(host)
    this.options = Object.assign(defaultOptions, options)
  }

  get(path, params = {}) {
    if (typeof path === 'object') {
      params = path
      path = this.url.pathname
    }

    return new Promise((resolve, reject) => {
      for (let param in params) {
        this.url.searchParams.append(param, params[param])
      }

      let req = {
        'path': path + this.url.search,

        'hostname': this.url.hostname,
        'protocol': this.url.protocol,

        'headers': {}
      }

      setTimeout(() => {
        if (this.options.proxy) {
          const proxy = ulib.parse(this.options.proxy, false)

          req.path = req.protocol + '//' + req.hostname + req.path
          req.headers['Host'] = req.hostname

          req.protocol = proxy.protocol
          req.host = proxy.hostname
          req.hostname = proxy.hostname
          req.port = proxy.port
        }

        console.log(req)

        const r = this.getModule(req.protocol).request(req, (resp) => {
          const headers = Object.assign({ 'content-type': 'text/html' }, resp.headers)
          const [contentType, charset] = headers['content-type'].split('; ')

          let buffer = ''

          switch (contentType) {
            case 'application/json':
              resp.on('data', (data) => {
                buffer += data.toString()
              })

              resp.on('end', () => {
                setTimeout(() => {
                  resolve(JSON.parse(buffer))
                
                }, this.options.sleep)
              })

            break

            case 'gzip':
              let gunzip = zlib.createGunzip()
              resp.pipe(gunzip)

              gunzip.on('data', (data) => {
                buffer += data.toString()
              })

              gunzip.on('end', () => {
                resolve(buffer)
              })

            break

            default:
              resp.on('data', (data) => {
                buffer += data.toString()
              })

              resp.on('end', () => {
                setTimeout(() => {
                  resolve(buffer)
                
                }, this.options.sleep)
              })  

          }
        })

        r.end()

        /*
        if (options.payload) {
          request.write(options.payload)
          request.end()
        }
        */

      }, this.options.delay)
    })  
  }

  getModule(protocol) {
    return (protocol === 'http:') ? http : https
  }
}

function request(url, params = {}) {
  return new Request(url, params)
}

module.exports = request
