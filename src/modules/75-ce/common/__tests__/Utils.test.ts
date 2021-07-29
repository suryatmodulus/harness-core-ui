import { Utils } from '../Utils'

describe('Tests for utils methods', () => {
  test('should convert boolean value to string (yes/no)', () => {
    expect(Utils.booleanToString(true)).toBe('yes')
    expect(Utils.booleanToString(false)).toBe('no')
  })

  test('should receive correct target group object', () => {
    expect(Utils.getTargetGroupObject(80, 'HTTP')).toMatchObject({
      port: 80,
      target_port: 80, // eslint-disable-line
      action: 'forward',
      protocol: 'http',
      target_protocol: 'http', // eslint-disable-line
      redirect_url: '', // eslint-disable-line
      routing_rules: [], // eslint-disable-line
      server_name: '' // eslint-disable-line
    })
  })

  test('should return true for numeric value and false for non-numeric', () => {
    expect(Utils.isNumber(8)).toBeTruthy()
    expect(Utils.isNumber('str')).toBeFalsy()
  })

  test('should generate a random string everytime', () => {
    const randomOne = Utils.randomString()
    const randomTwo = Utils.randomString()
    expect(randomOne.length).toEqual(12)
    expect(randomTwo.length).toEqual(12)
    expect(randomOne).not.toEqual(randomTwo)
  })

  test('should return default healthcheck object', () => {
    const receivedObj = Utils.getDefaultRuleHealthCheck()
    expect(receivedObj).toEqual({
      protocol: 'http',
      path: '/',
      port: 80,
      timeout: 30
    })
  })

  test('should return hyphen separated string', () => {
    const str = Utils.getHyphenSpacedString('some random string in here')
    expect(str.split('-').length).toEqual(5)
  })

  describe('Check for account with connectors data', () => {
    test('Has data', () => {
      const result = Utils.accountHasConnectors({
        awsConnectorsPresent: true,
        azureConnectorsPresent: false,
        k8sClusterConnectorPresent: false,
        gcpConnectorsPresent: false,
        applicationDataPresent: false,
        cloudDataPresent: false,
        clusterDataPresent: false,
        defaultAwsPerspectiveId: '',
        defaultAzurePerspectiveId: '',
        defaultClusterPerspectiveId: '',
        defaultGcpPerspectiveId: '',
        inventoryDataPresent: false,
        isSampleClusterPresent: false
      })
      expect(result).toBeTruthy()
    })
    test('Has no data', () => {
      const result = Utils.accountHasConnectors({
        awsConnectorsPresent: false,
        azureConnectorsPresent: false,
        k8sClusterConnectorPresent: false,
        gcpConnectorsPresent: false,
        applicationDataPresent: false,
        cloudDataPresent: false,
        clusterDataPresent: false,
        defaultAwsPerspectiveId: '',
        defaultAzurePerspectiveId: '',
        defaultClusterPerspectiveId: '',
        defaultGcpPerspectiveId: '',
        inventoryDataPresent: false,
        isSampleClusterPresent: false
      })
      expect(result).toBeFalsy()
    })
  })
})
