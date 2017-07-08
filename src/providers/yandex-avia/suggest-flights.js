const request = require('../../utils/request.js')

const ADULTS_COUNT = 1

function searchOld(fromId, toId, date) {
	return request('https://avia.yandex.ru/search')
    .get({ 'fromId': fromId, 'toId': toId, 'when': date })

    .then(() => {
      return update(fromId, toId, date, 0, new Date().getTime())
    })
}

function search(fromId, toId, date) {
  return new Promise((resolve, reject) => {
    return request('https://avia.yandex.ru/search')
      .get({ 'fromId': fromId, 'toId': toId, 'when': date })

      .then(res => resolve(
        update(fromId, toId, date, 0, new Date().getTime())
      ))
  })
}

function update(fromId, toId, date, attemptNum, searchStartTime) {
  const now = new Date()
  now.setHours(now.getHours() + 3)

  const currentDt = now.toISOString().slice(0, 19)
  const currentTs = now.getTime()

  const path = [
      '111111-222222-333.ticket.plane',
      [fromId, toId, date, 'None', 'economy', ADULTS_COUNT, '0', '0', 'ru'].join('_'),
      'ru'
    ].join('.')

  return request('https://avia.yandex.ru', { delay: 3000 })
    .get('/v2/tickets/update/' + path, {
      'time': currentDt,
      'cont': attemptNum,
      'deltaTime': currentTs - searchStartTime,
      '_': currentTs
    })
    
    .then(
      resp => {
        if (resp.progress.all > resp.progress.current) {
          return update(fromId, toId, date, attemptNum + 1, searchStartTime)
        }

        return resp
      },

      error => {
        console.log(error)
      }
    )
}

module.exports = search