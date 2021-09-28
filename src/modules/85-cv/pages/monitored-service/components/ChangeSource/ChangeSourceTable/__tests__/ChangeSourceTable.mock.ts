export const ChangeSourceOptions = [
  {
    name: 'Harness CD',
    identifier: 'harness_cd',
    type: 'HarnessCD' as any,
    desc: 'Deployments from Harness CD',
    enabled: true,
    category: 'Deployment' as any,
    spec: {}
  }
]

export const onEditCalledWith = {
  isEdit: true,
  onSuccess: jest.fn(),
  rowdata: {
    category: 'Deployment',
    desc: 'Deployments from Harness CD',
    enabled: true,
    identifier: 'harness_cd',
    name: 'Harness CD',
    spec: {},
    type: 'HarnessCD'
  },
  tableData: [
    {
      category: 'Deployment',
      desc: 'Deployments from Harness CD',
      enabled: true,
      identifier: 'harness_cd',
      name: 'Harness CD',
      spec: {},
      type: 'HarnessCD'
    }
  ]
}
