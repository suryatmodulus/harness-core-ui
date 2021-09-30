import { getK8sIngressTemplate, getK8sYamlSchema } from '../GetK8sYamlSchema'

describe('K8s Yaml tests', () => {
  test('should fetch k8s yaml schema', () => {
    const schema = getK8sYamlSchema()
    expect(schema).toBeDefined()
  })

  test('should fetch k8s ingress template', () => {
    const template = getK8sIngressTemplate({
      name: 'ruleName',
      idleTime: 15,
      cloudConnectorId: 'random-id',
      hideProgressPage: false,
      deps: [{}]
    })
    expect(template).toBeDefined()
  })
})
