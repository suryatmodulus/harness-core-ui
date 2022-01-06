const mysql = require('mysql')
const convertMapDataToRows = mapData => {
  const rowsData = []
  mapData.forEach((value, key) => {
    rowsData.push([
      key,
      value['url'],
      value['Performance'],
      value['Accessibility'],
      value['Best Practices'],
      value['SEO'],
      value['Time To Interactive'],
      value['First ContentFul Paint'],
      value['First Meaningful Paint']
    ])
  })
  return rowsData
}
const insertDataintoDB = mapData => {
  //   const mapData = new Map()
  //   mapData.set('home', {
  //     url: 'https://app.harness.io/ng/#/account/X5Nli8YkQ7exfGftTn26yw/home/projects',
  //     Performance: '17.00',
  //     Accessibility: '75.00',
  //     'Best Practices': '93.00',
  //     SEO: '75.00',
  //     'Time To Interactive': '33.00 s',
  //     'First ContentFul Paint': '2.80 s',
  //     'First Meaningful Paint': '13.50 s'
  //   })
  //   mapData.set('getstarted', {
  //     url: 'https://app.harness.io/ng/#/account/X5Nli8YkQ7exfGftTn26yw/home/get-started',
  //     Performance: '33.00',
  //     Accessibility: '97.00',
  //     'Best Practices': '93.00',
  //     SEO: '83.00',
  //     'Time To Interactive': '10.10 s',
  //     'First ContentFul Paint': '1.10 s',
  //     'First Meaningful Paint': '1.70 s'
  //   })
  var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Harness@2020',
    database: 'test1',
    multipleStatements: true
  })
  mysqlConnection.connect(err => {
    if (!err) {
      console.log('connected')
      const dbQuery = `create database if not exists qa_lighthouse`
      mysqlConnection.query(dbQuery, (error, result) => {
        if (!error) {
          console.log('database created', result)
          var tableQry =
            'CREATE TABLE if not exists qa_lighthouse.lighthouseData (id INT AUTO_INCREMENT PRIMARY KEY, pagename VARCHAR(255), url VARCHAR(255),performance VARCHAR(255),accessibility VARCHAR(255),bestpractises VARCHAR(255),seo VARCHAR(255),timetointeractive VARCHAR(255),firstcontentfulpaint VARCHAR(255),firstmeaningfulpaint VARCHAR(255))'
          mysqlConnection.query(tableQry, (tableError, tableResult) => {
            if (!tableError) {
              console.log('table created', tableResult)
              const rowData = convertMapDataToRows(mapData)
              console.log(rowData)
              const qry = `INSERT INTO qa_lighthouse.lighthouseData (pagename,url,performance,accessibility,bestpractises,seo,timetointeractive,firstcontentfulpaint,firstmeaningfulpaint) VALUES ?`
              mysqlConnection.query(qry, [rowData], (err1, rows) => {
                if (!err1) {
                  console.log('inserted rows', { rows })
                  process.exit(1)
                } else {
                  console.log('error in getting rows', { err1 })
                }
              })
            }
          })
        } else {
          console.log('error in creating database rows', error)
        }
      })
    } else {
      console.log('not connected', { err })
    }
  })
}
module.exports.insertDataintoDB = insertDataintoDB
//insertDataintoDB()
