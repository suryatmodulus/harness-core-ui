import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import COGatewayCumulativeAnalytics from '../COGatewayCumulativeAnalytics'

const mockCumulativeSavingsData = {
  response: {
    days: [
      '2021-04-13T00:00:00Z',
      '2021-04-14T00:00:00Z',
      '2021-04-15T00:00:00Z',
      '2021-04-16T00:00:00Z',
      '2021-04-17T00:00:00Z',
      '2021-04-18T00:00:00Z',
      '2021-04-19T00:00:00Z',
      '2021-04-20T00:00:00Z',
      '2021-04-21T00:00:00Z',
      '2021-04-22T00:00:00Z',
      '2021-04-23T00:00:00Z',
      '2021-04-24T00:00:00Z',
      '2021-04-25T00:00:00Z',
      '2021-04-26T00:00:00Z',
      '2021-04-27T00:00:00Z',
      '2021-04-28T00:00:00Z',
      '2021-04-29T00:00:00Z',
      '2021-04-30T00:00:00Z',
      '2021-05-01T00:00:00Z',
      '2021-05-02T00:00:00Z',
      '2021-05-03T00:00:00Z',
      '2021-05-04T00:00:00Z',
      '2021-05-05T00:00:00Z',
      '2021-05-06T00:00:00Z',
      '2021-05-07T00:00:00Z',
      '2021-05-08T00:00:00Z',
      '2021-05-09T00:00:00Z',
      '2021-05-10T00:00:00Z',
      '2021-05-11T00:00:00Z'
    ],
    potential_cost: [
      14.5824,
      14.5824,
      16.22434299498394,
      35.4144,
      35.4144,
      35.712,
      35.4144,
      34.5216,
      34.8192,
      35.4144,
      34.5216,
      35.4144,
      35.4144,
      34.5216,
      34.5216,
      35.4144,
      34.224,
      34.224,
      35.4144,
      35.4144,
      33.3312,
      34.8192,
      35.1168,
      34.224,
      33.6288,
      34.5216,
      33.0336,
      32.4384,
      34.5216
    ],
    actual_cost: [
      0,
      0,
      0.023380400652666666,
      0.07841142556810766,
      0.08158728755222222,
      0.07584373292655555,
      0.08336833906688888,
      0.08909492114777777,
      0.09651231058821877,
      0.07841956266166666,
      0.08452039283155555,
      0.08229421243055556,
      0.08441504986121877,
      0.08596203320988889,
      0.07642133084411111,
      0.07506942652399655,
      0.08543999612733333,
      0.0779175085201111,
      0.08528211439833333,
      0.07878672052711111,
      2.0460757471462574,
      9.315033830648794,
      8.411227712909362,
      8.560575635329501,
      5.628926296047623,
      8.604440107854126,
      7.161054920281872,
      4.205654888430115,
      8.276793559309345
    ],
    savings: [
      14.5824,
      14.5824,
      16.200962594331273,
      35.335988574431894,
      35.332812712447776,
      35.636156267073446,
      35.33103166093311,
      34.43250507885222,
      34.72268768941178,
      35.33598043733833,
      34.43707960716844,
      35.33210578756944,
      35.32998495013878,
      34.43563796679011,
      34.44517866915589,
      35.339330573476005,
      34.13856000387266,
      34.14608249147989,
      35.32911788560166,
      35.33561327947289,
      31.28512425285374,
      25.504166169351205,
      26.705572287090636,
      25.663424364670497,
      27.999873703952375,
      25.91715989214587,
      25.872545079718126,
      28.232745111569884,
      26.244806440690652
    ],
    total_potential: 946.819542994984,
    total_cost: 63.632509463395316,
    total_savings: 883.1870335315887,
    savings_percent: 93.27934135557526
  }
}

const mockNumberOfInstancesData = {
  response: {
    running: 1,
    stopped: 1
  }
}

const testpath = '/account/:accountId/ce/orgs/:orgIdentifier/projects/:projectIdentifier/autostopping-rules'
const testparams = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

jest.mock('services/lw', () => ({
  useCumulativeServiceSavings: jest.fn().mockImplementation(() => ({
    data: mockCumulativeSavingsData,
    loading: false
  })),
  useTotalInstanceCount: jest.fn().mockImplementation(() => ({
    data: mockNumberOfInstancesData,
    loading: false
  }))
}))

jest.mock('highcharts-react-official', () => () => <div />)

describe('Test COGatewayCumulativeAnalytics', () => {
  test('Renders without errors', () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayCumulativeAnalytics activeServicesCount={2} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
