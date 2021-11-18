import { RiskValues } from '@cv/utils/CommonUtils'

export const timePeriodsMockData = [
  { label: 'cv.monitoredServices.serviceHealth.last4Hrs', value: 'FOUR_HOURS' },
  { label: 'cv.monitoredServices.serviceHealth.last24Hrs', value: 'TWENTY_FOUR_HOURS' },
  { label: 'cv.monitoredServices.serviceHealth.last3Days', value: 'THREE_DAYS' },
  { label: 'cv.monitoredServices.serviceHealth.last7Days', value: 'SEVEN_DAYS' },
  { label: 'common.duration.month', value: 'THIRTY_DAYS' }
]

export const mockedHealthScoreData = {
  healthScores: [
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: null,
      riskStatus: RiskValues.NO_DATA
    },
    {
      healthScore: null,
      riskStatus: RiskValues.NO_DATA
    },
    {
      healthScore: null,
      riskStatus: RiskValues.NO_DATA
    },
    {
      healthScore: null,
      riskStatus: RiskValues.NO_DATA
    },
    {
      healthScore: null,
      riskStatus: RiskValues.NO_DATA
    },
    {
      healthScore: null,
      riskStatus: RiskValues.NO_DATA
    },
    {
      healthScore: null,
      riskStatus: RiskValues.NO_DATA
    },
    {
      healthScore: null,
      riskStatus: RiskValues.NO_DATA
    },
    {
      healthScore: null,
      riskStatus: RiskValues.NO_DATA
    },
    {
      healthScore: null,
      riskStatus: RiskValues.NO_DATA
    },
    {
      healthScore: null,
      riskStatus: RiskValues.NO_DATA
    },
    {
      healthScore: null,
      riskStatus: RiskValues.NO_DATA
    },
    {
      healthScore: null,
      riskStatus: RiskValues.NO_DATA
    },
    {
      healthScore: null,
      riskStatus: RiskValues.NO_DATA
    },
    {
      healthScore: null,
      riskStatus: RiskValues.NO_DATA
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    },
    {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY
    }
  ]
}

export const mockedTimestamps = [
  1630678334620, 1630690934620, 1630703534620, 1630716134620, 1630728734620, 1630741334620, 1630753934620,
  1630766534620, 1630779134620, 1630791734620, 1630804334620, 1630816934620, 1630829534620, 1630842134620,
  1630854734620, 1630867334620, 1630879934620, 1630892534620, 1630905134620, 1630917734620, 1630930334620,
  1630942934620, 1630955534620, 1630968134620, 1630980734620, 1630993334620, 1631005934620, 1631018534620,
  1631031134620, 1631043734620, 1631056334620, 1631068934620, 1631081534620, 1631094134620, 1631106734620,
  1631119334620, 1631131934620, 1631144534620, 1631157134620, 1631169734620, 1631182334620, 1631194934620,
  1631207534620, 1631220134620, 1631232734620, 1631245334620, 1631257934620, 1631270534620
]

export const expectedTimelineForGetTimestampsForPeriod = [
  1632958200000, 1632960000000, 1632960000000, 1632961800000, 1632961800000, 1632963600000, 1632963600000,
  1632965400000, 1632965400000, 1632967200000, 1632967200000, 1632969000000, 1632969000000, 1632970800000,
  1632970800000, 1632972600000, 1632972600000, 1632974400000, 1632974400000, 1632976200000, 1632976200000,
  1632978000000, 1632978000000, 1632979800000, 1632979800000, 1632981600000, 1632981600000, 1632983400000,
  1632983400000, 1632985200000, 1632985200000, 1632987000000, 1632987000000, 1632988800000, 1632988800000,
  1632990600000, 1632990600000, 1632992400000, 1632992400000, 1632994200000, 1632994200000, 1632996000000,
  1632996000000, 1632997800000, 1632997800000, 1632999600000, 1632999600000, 1633001400000, 1633001400000,
  1633003200000, 1633003200000, 1633005000000, 1633005000000, 1633006800000, 1633006800000, 1633008600000,
  1633008600000, 1633010400000, 1633010400000, 1633012200000, 1633012200000, 1633014000000, 1633014000000,
  1633015800000, 1633015800000, 1633017600000, 1633017600000, 1633019400000, 1633019400000, 1633021200000,
  1633021200000, 1633023000000, 1633023000000, 1633024800000, 1633024800000, 1633026600000, 1633026600000,
  1633028400000, 1633028400000, 1633030200000, 1633030200000, 1633032000000, 1633032000000, 1633033800000,
  1633033800000, 1633035600000, 1633035600000, 1633037400000, 1633037400000, 1633039200000, 1633039200000,
  1633041000000, 1633041000000, 1633042800000, 1633042800000, 1633044600000
]

export const mockRiskValue = [
  { healthScore: 100, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1632958200, endTime: 1632960000 } },
  { healthScore: 96, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1632960000, endTime: 1632961800 } },
  { healthScore: 87, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1632961800, endTime: 1632963600 } },
  { healthScore: 87, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1632963600, endTime: 1632965400 } },
  { healthScore: 81, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1632965400, endTime: 1632967200 } },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1632967200, endTime: 1632969000 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1632969000, endTime: 1632970800 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1632970800, endTime: 1632972600 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1632972600, endTime: 1632974400 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1632974400, endTime: 1632976200 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1632976200, endTime: 1632978000 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1632978000, endTime: 1632979800 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1632979800, endTime: 1632981600 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1632981600, endTime: 1632983400 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1632983400, endTime: 1632985200 }
  },
  { healthScore: 100, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1632985200, endTime: 1632987000 } },
  { healthScore: 86, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1632987000, endTime: 1632988800 } },
  { healthScore: 79, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1632988800, endTime: 1632990600 } },
  { healthScore: 86, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1632990600, endTime: 1632992400 } },
  { healthScore: 92, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1632992400, endTime: 1632994200 } },
  { healthScore: 93, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1632994200, endTime: 1632996000 } },
  { healthScore: 92, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1632996000, endTime: 1632997800 } },
  { healthScore: 81, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1632997800, endTime: 1632999600 } },
  { healthScore: 88, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1632999600, endTime: 1633001400 } },
  { healthScore: 71, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1633001400, endTime: 1633003200 } },
  { healthScore: 85, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1633003200, endTime: 1633005000 } },
  { healthScore: 90, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1633005000, endTime: 1633006800 } },
  { healthScore: 84, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1633006800, endTime: 1633008600 } },
  { healthScore: 87, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1633008600, endTime: 1633010400 } },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1633010400, endTime: 1633012200 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1633012200, endTime: 1633014000 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1633014000, endTime: 1633015800 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1633015800, endTime: 1633017600 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1633017600, endTime: 1633019400 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1633019400, endTime: 1633021200 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1633021200, endTime: 1633023000 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1633023000, endTime: 1633024800 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1633024800, endTime: 1633026600 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1633026600, endTime: 1633028400 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1633028400, endTime: 1633030200 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1633030200, endTime: 1633032000 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1633032000, endTime: 1633033800 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1633033800, endTime: 1633035600 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1633035600, endTime: 1633037400 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1633037400, endTime: 1633039200 }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: { startTime: 1633039200, endTime: 1633041000 }
  },
  { healthScore: 100, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1633041000, endTime: 1633042800 } },
  { healthScore: 84, riskStatus: RiskValues.HEALTHY, timeRangeParams: { startTime: 1633042800, endTime: 1633044600 } }
]

export const mockedHealthScoreDataForLowestHealthScore = [
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1630666800,
      endTime: 1630679400
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1630679400,
      endTime: 1630692000
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1630692000,
      endTime: 1630704600
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1630704600,
      endTime: 1630717200
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1630717200,
      endTime: 1630729800
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1630729800,
      endTime: 1630742400
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1630742400,
      endTime: 1630755000
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1630755000,
      endTime: 1630767600
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1630767600,
      endTime: 1630780200
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1630780200,
      endTime: 1630792800
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1630792800,
      endTime: 1630805400
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1630805400,
      endTime: 1630818000
    }
  },
  {
    healthScore: 96,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1630818000,
      endTime: 1630830600
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1630830600,
      endTime: 1630843200
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1630843200,
      endTime: 1630855800
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1630855800,
      endTime: 1630868400
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1630868400,
      endTime: 1630881000
    }
  },
  {
    healthScore: 0,
    riskStatus: RiskValues.UNHEALTHY,
    timeRangeParams: {
      startTime: 1630881000,
      endTime: 1630893600
    }
  },
  {
    healthScore: 17,
    riskStatus: RiskValues.UNHEALTHY,
    timeRangeParams: {
      startTime: 1630893600,
      endTime: 1630906200
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1630906200,
      endTime: 1630918800
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1630918800,
      endTime: 1630931400
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1630931400,
      endTime: 1630944000
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1630944000,
      endTime: 1630956600
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1630956600,
      endTime: 1630969200
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1630969200,
      endTime: 1630981800
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1630981800,
      endTime: 1630994400
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1630994400,
      endTime: 1631007000
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1631007000,
      endTime: 1631019600
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1631019600,
      endTime: 1631032200
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1631032200,
      endTime: 1631044800
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1631044800,
      endTime: 1631057400
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1631057400,
      endTime: 1631070000
    }
  },
  {
    healthScore: 0,
    riskStatus: RiskValues.UNHEALTHY,
    timeRangeParams: {
      startTime: 1631070000,
      endTime: 1631082600
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1631082600,
      endTime: 1631095200
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1631095200,
      endTime: 1631107800
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1631107800,
      endTime: 1631120400
    }
  },
  {
    healthScore: 0,
    riskStatus: RiskValues.UNHEALTHY,
    timeRangeParams: {
      startTime: 1631120400,
      endTime: 1631133000
    }
  },
  {
    healthScore: 10,
    riskStatus: RiskValues.UNHEALTHY,
    timeRangeParams: {
      startTime: 1631133000,
      endTime: 1631145600
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1631145600,
      endTime: 1631158200
    }
  },
  {
    healthScore: 3,
    riskStatus: RiskValues.UNHEALTHY,
    timeRangeParams: {
      startTime: 1631158200,
      endTime: 1631170800
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1631170800,
      endTime: 1631183400
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1631183400,
      endTime: 1631196000
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1631196000,
      endTime: 1631208600
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1631208600,
      endTime: 1631221200
    }
  },
  {
    healthScore: null,
    riskStatus: RiskValues.NO_DATA,
    timeRangeParams: {
      startTime: 1631221200,
      endTime: 1631233800
    }
  },
  {
    healthScore: 5,
    riskStatus: RiskValues.UNHEALTHY,
    timeRangeParams: {
      startTime: 1631233800,
      endTime: 1631246400
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1631246400,
      endTime: 1631259000
    }
  },
  {
    healthScore: 100,
    riskStatus: RiskValues.HEALTHY,
    timeRangeParams: {
      startTime: 1631259000,
      endTime: 1631271600
    }
  }
]
