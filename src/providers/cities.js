const cities = require('./yandex-avia/suggest-cities')

module.exports = function(city) {
  return cities(city).then((response) => {
    const [q, variants] = response

    const results = variants
      .map(([type, name, data]) => {
      
        return {
          'id': data.id,
          'code': data.code,
          'type': type,
          'name': name,
          'country': data.country
        }
      
      }).filter(item => item.type === 'city')

      return results
  })
}