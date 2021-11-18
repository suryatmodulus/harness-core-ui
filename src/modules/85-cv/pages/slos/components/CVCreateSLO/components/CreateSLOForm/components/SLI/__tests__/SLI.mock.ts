export const mockedMonitoredServiceData = {
  status: 'SUCCESS',
  data: [
    {
      identifier: 'Service_101_QA',
      name: 'Service_101_QA',
      healthSources: [
        { name: 'Test AppD 102', identifier: 'Test_AppD' },
        { name: 'dasdasdas', identifier: 'dasdasdas' },
        { name: 'Promethus', identifier: 'dasdsadsa' }
      ]
    },
    {
      identifier: 'Service_102_QA',
      name: 'Service_102_QA',
      healthSources: [{ name: 'Test AppD', identifier: 'Test_AppD' }]
    }
  ],
  metaData: {},
  correlationId: '6ad5972a-c382-46dc-a0d4-263ba5806db8'
}

export const expectedMonitoredServiceOptions = [
  {
    label: 'Service_101_QA',
    value: 'Service_101_QA'
  },
  {
    label: 'Service_102_QA',
    value: 'Service_102_QA'
  }
]

export const expectedHealthSourcesOptions = [{ label: 'Test AppD', value: 'Test_AppD' }]
