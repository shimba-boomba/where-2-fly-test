const moment = require('moment')
const kue = require('kue')

const queue = kue.createQueue()

const FRIDAY = 5
const SATURDAY = 6
const SUNDAY = 7
const MONDAY = 1

const today = moment().startOf('day')
const friday = moment().isoWeekday(FRIDAY).startOf('day')
const saturday = moment().isoWeekday(SATURDAY).startOf('day')

let currentDay = null

if (friday.isAfter(today)) {
  currentDay = friday
} else if (saturday.isAfter(today)) {
  currentDay = saturday
} else {
  currentDay = moment().startOf('week').add(1, 'week').isoWeekday(FRIDAY).startOf('day')
}

const finalIndexingDate = moment().day(1).add(3, 'months').endOf('month').startOf('day')

const calendar = []

while (true) {
  if (currentDay.isoWeekday() === FRIDAY || currentDay.isoWeekday() === SATURDAY) {
    date   = currentDay.format('YYYY-MM-DD')
    week   = currentDay.format('W')

    calendar.push({
      'type': 'departure',
      'date': date,
      'week': week
    })

  } else if (currentDay.isoWeekday() === SUNDAY || currentDay.isoWeekday() === MONDAY) {
    date   = currentDay.format('YYYY-MM-DD')
    week   = currentDay.format('W')

    if (currentDay.isoWeekday() === MONDAY) {
      week--
    }

    calendar.push({
      'type': 'arrival',
      'date': date,
      'week': week
    })

  }

  if (currentDay.isSame(finalIndexingDate)) {
    break
  }

  currentDay = moment(currentDay).add(1, 'day')
}

const pairs = [
  { from: 'c213', to: 'c10430' }
]

calendar.forEach((flight) => {
  pairs.forEach((pair) => {
    let direction = null

    switch (flight.type) {
      case 'departure':
        direction = { 'fromId': pair.from, 'toId': pair.to }
      break

      case 'arrival':
        direction = { 'fromId': pair.to, 'toId': pair.from }
      break 
    }

    if (direction) {
      queue
        .create('flights', Object.assign(flight, direction))
        .attempts(3)
        .save()
    }
  })
})





