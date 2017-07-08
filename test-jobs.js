const flights = require('./src/providers/flights')

const cluster = require('cluster')
const kue = require('kue')
const os = require('os')

const clusterSize = os.cpus().length

if (cluster.isMaster) {
  for (let i = 0; i < clusterSize; i++) {
    cluster.fork()
  }
} else {
  const queue = kue.createQueue()

  queue.process('flights', (task, done) => {
    console.log(cluster.worker.id, task.data)
    done()
  })
}
