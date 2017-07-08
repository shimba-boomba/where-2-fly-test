const request = require('../../utils/request.js')

module.exports = function(city) {

  return request('https://suggests.avia.yandex.ru')
    .get('/avia', { 'query': city, 'lang': 'ru' })

}



