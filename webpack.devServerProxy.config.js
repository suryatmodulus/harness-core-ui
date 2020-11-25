const baseUrl = 'https://qb.harness.io'
const targetLocalHost = true // set to false to target baseUrl environment instead of localhost

module.exports = {
  '/ng/api': {
    pathRewrite: { '^/ng/api': '' },
    target: targetLocalHost ? 'http://localhost:7457' : `${baseUrl}/ng/api`
  },
  '/notifications/api': {
    pathRewrite: { '^/notifications/api': '/api' },
    target: targetLocalHost ? 'http://localhost:9005' : `${baseUrl}/notifications/api`
  },
  '/api': {
    target: targetLocalHost ? 'https://localhost:9090' : baseUrl
  },
  '/cv/api': {
    target: targetLocalHost ? 'https://localhost:6060' : `${baseUrl}`
  },
  '/cf': {
    target: 'http://localhost:3000/api/1.0',
    pathRewrite: { '^/cf': '' }
  }
}