import { onServiceChange } from '../Dependency.utils'

describe('Validate utils', () => {
  const setFieldValue = jest.fn()
  const checkedState = { currentTarget: { id: 'service101', checked: true } } as any
  const unCheckedState = { currentTarget: { id: 'service101', checked: false } } as any
  const formikWithNoData = {
    values: {
      dependencies: []
    },
    setFieldValue
  } as any
  const formikWithData = {
    values: {
      dependencies: [{ monitoredServiceIdentifier: 'service101' }]
    },
    setFieldValue
  } as any
  test('validate onServiceChange ', () => {
    onServiceChange(checkedState, formikWithNoData)
    expect(setFieldValue).toHaveBeenCalledWith('dependencies', [{ monitoredServiceIdentifier: 'service101' }])
    onServiceChange(unCheckedState, formikWithData)
    expect(setFieldValue).toHaveBeenCalledWith('dependencies', [])
  })
})
