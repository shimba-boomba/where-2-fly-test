const flights = require('./yandex-avia/suggest-flights')
const currencies = require('../utils/currencies')

const moment = require('moment')

class Search {

  find(fromId, toId, date) {
    return new Promise((resolve, reject) => {
      return flights(fromId, toId, date)
        .then(this.prepareResponse.bind(this))  
    })
  }

  prepareResponse(response) {
    const variants = response.variants.fares
      
    this.flights     = response.reference.flights
    this.airports    = response.reference.stations
    this.settlements = response.reference.settlements  

    return variants.map(this.prepareVariant.bind(this))
  }

  prepareVariant(variant) {
    const data = {
      route: [],
      transfers: [],
      prices: []
    }

    data.id = variant.fareId

    variant.route[0].forEach((flightCode) => {
      const flight = this.flights[flightCode]

      const departureAirport = this.airports[flight.from]
      const arrivalAirport = this.airports[flight.to]

      data.route.push({
        'departure': {
          time: moment(flight.departure.local),
          airport: {
            code: departureAirport.code,
            title: departureAirport.title,
            city: this.settlements[departureAirport.settlement].title
          }
        },

        'arrival': {
          time: moment(flight.arrival.local),
          airport: {
            code: arrivalAirport.code,
            title: arrivalAirport.title,
            city: this.settlements[arrivalAirport.settlement].title
          }
        }
      })
    })

    for (let i = 0; i < data.route.length; i++) {
      const prevFlight = data.route[i - 1]
      const thisFlight = data.route[i]

      if (prevFlight) {
        const waitTime = moment(thisFlight.departure.time)
          .diff(prevFlight.arrival.time, 'minutes', true)

        data.transfers.push({
          'waiting': moment.duration(waitTime, 'minutes'),
          'airport': prevFlight.arrival.airport
        })
      }
    }

    variant.prices.forEach((partner) => {
      const price = partner.tariff.value * currencies[partner.tariff.currency]
      
      data.prices.push({ 'price': price, 'partner': partner.partnerCode })
    })

    data.prices.sort((a, b) => {
      return a.price - b.price
    })

    return data
  }

}

function search(fromId, toId, date) {
  return new Search().find(fromId, toId, date)
}

module.exports = search