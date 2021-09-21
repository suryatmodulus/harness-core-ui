const nodeIDs = {
  LoginService: 'Login Service',
  Service4: 'Service 4',
  Service5: 'Service 5',
  Service8: 'Service 8',
  AuthService: 'Auth Service',
  K8Cluster6: 'K8 Cluster 6',
  App123AB: 'App 123AB',
  AppCD789: 'App CD789',
  DBMongo: 'DB Mongo',
  K8Cluster1: 'K8 Cluster 1',
  AppCDAB: 'App CDAB',
  AppABC1: 'App ABC1',
  App1B2C: 'App 1B2C',
  App120DB: 'App 120DB',
  Test1: 'Test 1',
  Test2: 'Test 2',
  Test3: 'Test 3'
}

const icons = {
  infrastructure: 'infrastructure'
}

const statuses = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  TBD: 'TBD'
}

export const graphData = [
  { from: nodeIDs.LoginService, to: nodeIDs.Service4 },
  { from: nodeIDs.LoginService, to: nodeIDs.Service5 },
  { from: nodeIDs.LoginService, to: nodeIDs.Service8 },
  { from: nodeIDs.LoginService, to: nodeIDs.AuthService },
  { from: nodeIDs.LoginService, to: nodeIDs.K8Cluster6 },
  { from: nodeIDs.AuthService, to: nodeIDs.App123AB },
  { from: nodeIDs.K8Cluster6, to: nodeIDs.AppCD789 },
  { from: nodeIDs.K8Cluster6, to: nodeIDs.DBMongo },
  { from: nodeIDs.Service8, to: nodeIDs.K8Cluster1 },
  { from: nodeIDs.K8Cluster1, to: nodeIDs.AppCDAB },
  { from: nodeIDs.Test3, to: nodeIDs.AppABC1 },
  { from: nodeIDs.AppABC1, to: nodeIDs.App1B2C },
  { from: nodeIDs.App1B2C, to: nodeIDs.App120DB },
  { from: nodeIDs.Test1, to: nodeIDs.Test2 },
  { from: nodeIDs.Test1, to: nodeIDs.Test3 }
]

export const nodes = [
  {
    id: nodeIDs.LoginService,
    icon: icons.infrastructure,
    status: 'HIGH'
  },
  {
    id: nodeIDs.Service4,
    icon: icons.infrastructure,
    status: statuses.LOW
  },
  {
    id: nodeIDs.Service5,
    icon: icons.infrastructure,
    status: statuses.MEDIUM
  },
  {
    id: nodeIDs.Service8,
    icon: icons.infrastructure,
    status: statuses.TBD
  },
  {
    id: nodeIDs.AuthService,
    icon: icons.infrastructure,
    status: statuses.HIGH
  },
  {
    id: nodeIDs.K8Cluster6,
    icon: icons.infrastructure,
    status: statuses.LOW
  },
  {
    id: nodeIDs.App123AB,
    icon: icons.infrastructure,
    status: statuses.MEDIUM
  },
  {
    id: nodeIDs.AppCD789,
    icon: icons.infrastructure,
    status: statuses.TBD
  },
  {
    id: nodeIDs.DBMongo,
    icon: icons.infrastructure,
    status: statuses.HIGH
  },
  {
    id: nodeIDs.K8Cluster1,
    icon: icons.infrastructure,
    status: statuses.LOW
  },
  {
    id: nodeIDs.AppCDAB,
    icon: icons.infrastructure,
    status: statuses.MEDIUM
  },
  {
    id: nodeIDs.AppABC1,
    icon: icons.infrastructure,
    status: statuses.TBD
  },
  {
    id: nodeIDs.App1B2C,
    icon: icons.infrastructure,
    status: statuses.HIGH
  },
  {
    id: nodeIDs.App120DB,
    icon: icons.infrastructure,
    status: statuses.LOW
  },
  {
    id: nodeIDs.Test1,
    icon: icons.infrastructure,
    status: statuses.MEDIUM
  },
  {
    id: nodeIDs.Test2,
    icon: icons.infrastructure,
    status: statuses.TBD
  },
  {
    id: nodeIDs.Test3,
    icon: icons.infrastructure,
    status: statuses.HIGH
  }
]

const uriEncodedSymbol =
  'url(data:image/svg+xml;utf8,%3Csvg%20width%3D%2260%22%20height%3D%2269%22%20viewBox%3D%220%200%2060%2069%22%20fill%3' +
  'D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20filter%3D%22url' +
  '(%23filter0_dd)%22%3E%3Cpath%20d%3D%22M29%202.57735C29.6188%202.22009%2030.3812%202.22008%2031%202.57735L56.7128%2017.4' +
  '226C57.3316%2017.7799%2057.7128%2018.4402%0A%20%20%20%20%20%20%20%20%20%2057.7128%2019.1547V48.8453C57.7128%2049.5598%2057.3' +
  '316%2050.2201%2056.7128%2050.5774L31%2065.4226C30.3812%2065.7799%2029.6188%2065.7799%0A%20%20%20%20%20%20%20%20%20%2029%2065.422' +
  '6L3.28719%2050.5774C2.66839%2050.2201%202.28719%2049.5598%202.28719%2048.8453L2.28719%2019.1547C2.28719%2018.4402%202.66839%2017.7799' +
  '%203.28719%2017.4226L29%202.57735Z%22%20fill%3D%22%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M29.25%203.01036C29.7141%202.74241%2030.2859%202.742' +
  '41%2030.75%203.01036L56.4628%2017.8557C56.9269%2018.1236%2057.2128%2018.6188%0A%20%20%20%20%20%20%20%20%20%2057.2128%2019.1547V48.8453C57.2128%2' +
  '049.3812%2056.9269%2049.8764%2056.4628%2050.1443L30.75%2064.9896C30.2859%2065.2576%2029.7141%2065.2576%0A%20%20%20%20%2' +
  '0%20%20%20%20%2029.25%2064.9896L3.53719%2050.1443C3.07309%2049.8764%202.78719%2049.3812%202.78719%2048.8453L2.78719%2019.' +
  '1547C2.78719%2018.6188%203.07309%2018.1236%203.53719%2017.8557L29.25%203.01036Z%22%20stroke%3D%22%22%3E%3C%2Fpath%3E%3Csvg' +
  '%20width%3D%2250%25%22%20height%3D%2250%25%22%20x%3D%2225%25%22%20y%3D%2225%25%22%20viewBox%3D%220%200%2023%2024%22%20fill%3' +
  'D%22%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Csvg%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%22%20xml' +
  'ns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20opacity%3D%220.01%22%20d%3D%22M4%204h16v16H4z%22%3E%3C%2Fpath%3E%3' +
  'Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M12.487%208.343a.2.2%200%2000.08.17l6.287%204.692a1%201%2' +
  '00%2001.006%201.598l-6.257%204.74a1%201%200%2001-1.207.002l-6.325-4.773a1%201%200%2001-.026-1.577l.664-.536a.2.2%200%2001.248-.002l' +
  '.207.161a.3.3%200%2001-.006.479l-.593.436a.2.2%200%2000-.002.32l5.618%204.253a.2.2%200%2000.321-.159v-2.515L5.066%2010.8a1%201%200%20' +
  '010-1.6l6.344-4.758a1%201%200%20011.187-.01l6.408%204.646a1%201%200%2001-.036%201.645l-.905.597-.482-.471a.2.2%200%2001.037-.315l.747-.' +
  '449a.2.2%200%2000.011-.335l-5.471-3.825a.2.2%200%2000-.315.155l-.104%202.263zm-.767-2.476a.2.2%200%2000-.32-.16L5.972%209.775a.2.2%200%200' +
  '00%20.32l5.753%204.346a.5.5%200%2000.567.025l2.642-1.65a.2.2%200%2001.233.014l.452.37a.2.2%200%2001-.02.324l-3.217%202.02a.2.2%200%2000-.09' +
  '3.17v2.468a.2.2%200%2000.322.158l5.42-4.18a.2.2%200%2000-.001-.318l-5.853-4.469a.2.2%200%2000-.245.002l-2.438%201.92a.2.2%200%2001-.258-.008' +
  'l-.382-.346a.2.2%200%2001.011-.305l2.78-2.186a.2.2%200%2000.075-.158V5.867z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E%3C%2Fsvg%3E%3C%2Fg%3E%3Cdefs%3E%3' +
  'Cfilter%20id%3D%22filter0_dd%22%20x%3D%220.287109%22%20y%3D%220.809448%22%20width%3D%2259.4256%22%20height%3D%2267.3812%22%20filterUnits%3D%2' +
  '2userSpaceOnUse%22%20color-interpolation-filters%3D%22sRGB%22%3E%3CfeFlood%20flood-opacity%3D%220%22%20result%3D%22BackgroundImageFix%22%3E%3C' +
  '%2FfeFlood%3E%3CfeColorMatrix%20in%3D%22SourceAlpha%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%200%200%200%200%200%200%200%200%200' +
  '%200%200%200%200%20127%200%22%20result%3D%22hardAlpha%22%3E%3C%2FfeColorMatrix%3E%3CfeOffset%20dy%3D%220.5%22%3E%3C%2FfeOffset%3E%3CfeGaussianBlu' +
  'r%20stdDeviation%3D%221%22%3E%3C%2FfeGaussianBlur%3E%3CfeColorMatrix%20type%3D%22matrix%22%20values%3D%220%200%200%200%200.376471%200%200%200%200' +
  '%200.380392%200%200%200%200%200.439216%200%200%200%200.16%200%22%3E%3C%2FfeColorMatrix%3E%3CfeBlend%20mode%3D%22normal%22%20in2%3D%22BackgroundIma' +
  'geFix%22%20result%3D%22effect1_dropShadow%22%3E%3C%2FfeBlend%3E%3CfeColorMatrix%20in%3D%22SourceAlpha%22%20type%3D%22matrix%22%20values%3D%220%200%' +
  '200%200%200%200%200%200%200%200%200%200%200%200%200%200%200%200%20127%200%22%20result%3D%22hardAlpha%22%3E%3C%2FfeColorMatrix%3E%3CfeOffset%3E%3C%2Ff' +
  'eOffset%3E%3CfeGaussianBlur%20stdDeviation%3D%220.5%22%3E%3C%2FfeGaussianBlur%3E%3CfeColorMatrix%20type%3D%22matrix%22%20values%3D%220%200%200%200' +
  '%200.156863%200%200%200%200%200.160784%200%200%200%200%200.239216%200%200%200%200.08%200%22%3E%3C%2FfeColorMatrix%3E%3CfeBlend%20mode%3D%22normal' +
  '%22%20in2%3D%22effect1_dropShadow%22%20result%3D%22effect2_dropShadow%22%3E%3C%2FfeBlend%3E%3CfeBlend%20mode%3D%22normal%22%20in%3D%22SourceGraphi' +
  'c%22%20in2%3D%22effect2_dropShadow%22%20result%3D%22shape%22%3E%3C%2FfeBlend%3E%3C%2Ffilter%3E%3C%2Fdefs%3E%3C%2Fsvg%3E)'

export const formattedNodes = [
  {
    id: nodeIDs.LoginService,
    className: 'PointData LoginService Status_HIGH',
    marker: {
      symbol: uriEncodedSymbol
    }
  },
  {
    id: nodeIDs.Service4,
    className: 'PointData Service4 Status_LOW',
    marker: {
      symbol: uriEncodedSymbol
    }
  },
  {
    id: nodeIDs.Service5,
    className: 'PointData Service5 Status_MEDIUM',
    marker: {
      symbol: uriEncodedSymbol
    }
  },
  {
    id: nodeIDs.Service8,
    className: 'PointData Service8 Status_TBD',
    marker: {
      symbol: uriEncodedSymbol
    }
  },
  {
    id: nodeIDs.AuthService,
    className: 'PointData AuthService Status_HIGH',
    marker: {
      symbol: uriEncodedSymbol
    }
  },
  {
    id: nodeIDs.K8Cluster6,
    className: 'PointData K8Cluster 6 Status_LOW',
    marker: {
      symbol: uriEncodedSymbol
    }
  },
  {
    id: nodeIDs.App123AB,
    className: 'PointData App123AB Status_MEDIUM',
    marker: {
      symbol: uriEncodedSymbol
    }
  },
  {
    id: nodeIDs.AppCD789,
    className: 'PointData AppCD789 Status_TBD',
    marker: {
      symbol: uriEncodedSymbol
    }
  },
  {
    id: nodeIDs.DBMongo,
    className: 'PointData DBMongo Status_HIGH',
    marker: {
      symbol: uriEncodedSymbol
    }
  },
  {
    id: nodeIDs.K8Cluster1,
    className: 'PointData K8Cluster 1 Status_LOW',
    marker: {
      symbol: uriEncodedSymbol
    }
  },
  {
    id: nodeIDs.AppCDAB,
    className: 'PointData AppCDAB Status_MEDIUM',
    marker: {
      symbol: uriEncodedSymbol
    }
  },
  {
    id: nodeIDs.AppABC1,
    className: 'PointData AppABC1 Status_TBD',
    marker: {
      symbol: uriEncodedSymbol
    }
  },
  {
    id: nodeIDs.App1B2C,
    className: 'PointData App1B2C Status_HIGH',
    marker: {
      symbol: uriEncodedSymbol
    }
  },
  {
    id: nodeIDs.App120DB,
    className: 'PointData App120DB Status_LOW',
    marker: {
      symbol: uriEncodedSymbol
    }
  },
  {
    id: nodeIDs.Test1,
    className: 'PointData Test1 Status_MEDIUM',
    marker: {
      symbol: uriEncodedSymbol
    }
  },
  {
    id: nodeIDs.Test2,
    className: 'PointData Test2 Status_TBD',
    marker: {
      symbol: uriEncodedSymbol
    }
  },
  {
    id: nodeIDs.Test3,
    className: 'PointData Test3 Status_HIGH',
    marker: {
      symbol: uriEncodedSymbol
    }
  }
]

export const defaultOptions = {
  chart: {
    type: 'networkgraph',
    events: {
      click: jest.fn()
    }
  },
  title: {
    text: ''
  },
  plotOptions: {
    networkgraph: {
      cursor: 'pointer',
      states: {
        inactive: {
          enabled: false
        },
        hover: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: true,
        linkFormat: '',
        useHTML: true,
        allowOverlap: false,
        y: 50,
        formatter: jest.fn()
      }
    }
  },
  tooltip: {
    enabled: false
  },
  series: [
    {
      id: 'lang-tree',
      marker: {
        enabled: true,
        radius: 50
      },
      type: 'networkgraph',
      data: graphData,
      nodes: formattedNodes,
      point: {
        events: {
          click: jest.fn()
        }
      }
    }
  ]
}
