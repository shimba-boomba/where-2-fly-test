const suggest = require('./src/providers/flights')
const moment = require('moment')

const moscowId = 'c213'
const valenciaId = 'c10430'

suggest(moscowId, valenciaId, '2017-07-07').then((flights) => {
  flights
    .filter((flight) => {
      if (flight.transfers.length >= 2) {
        return false
      }

      if (flight.prices[0].price > 25000) {
        return false
      }

      const departureTime = flight.route[0].departure.time
      const arrivalTime = flight.route[0].arrival.time
      
      const departureWeekday = departureTime.isoWeekday()
      const departureHour = departureTime.hour()
      const arrivalHour = arrivalTime.hour()

      if (false) {
        return false
      } else if (departureWeekday === 5 && departureHour < 17) {
        return false
      } else if (departureWeekday === 6 && departureHour > 14) {
        return false
      } else if (departureWeekday === 7 && departureHour < 18) {
        return false
      } else if (departureWeekday === 1 && arrivalHour > 11) {
        return false
      }

      return true
    })
    
    .sort((a, b) => {
      return a.prices[0].price - b.prices[0].price
    })

    .forEach((flight) => {
    console.log('=== ' + flight.id + ' =====================')

    flight.route.forEach((route) => {
      console.log(
        moment(route.departure.time).format('DD.MM.YY HH:mm'),
        route.departure.airport.city + ' (' + route.departure.airport.code + ')',

        '->',

        moment(route.arrival.time).format('DD.MM.YY HH:mm'),
        route.arrival.airport.city + ' (' + route.arrival.airport.code + ')'
      )
    })

    console.log(flight.prices[0])
  })

}, (error) => console.log('ERR', error))




