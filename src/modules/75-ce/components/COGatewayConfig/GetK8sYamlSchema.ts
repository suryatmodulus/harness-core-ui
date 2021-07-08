import { Utils } from '@ce/common/Utils'

const getK8sYamlSchema = () => ({
  $schema: 'http://json-schema.org/draft-07/schema',
  $id: 'http://example.com/example.json',
  type: 'object',
  title: 'The root schema',
  required: ['kind', 'apiVersion', 'metadata', 'spec'],
  properties: {
    kind: {
      $id: '#/properties/kind',
      type: 'string',
      title: 'The kind schema'
    },
    apiVersion: {
      $id: '#/properties/apiVersion',
      type: 'string',
      title: 'The apiVersion schema'
    },
    metadata: {
      $id: '#/properties/metadata',
      type: 'object',
      title: 'The metadata schema',
      required: ['name', 'annotations'],
      properties: {
        name: {
          $id: '#/properties/metadata/properties/name',
          type: 'string',
          title: 'The name schema'
        },
        namespace: {
          $id: '#/properties/metadata/properties/namespace',
          type: 'string',
          title: 'The namespace schema'
        },
        annotations: {
          $id: '#/properties/metadata/properties/annotations',
          type: 'object',
          title: 'The annotations schema',
          required: [],
          additionalProperties: true
        }
      },
      additionalProperties: true
    },
    spec: {
      $id: '#/properties/spec',
      type: 'object',
      title: 'The spec schema',
      required: ['rules'],
      properties: {
        rules: {
          $id: '#/properties/spec/properties/rules',
          type: 'array',
          title: 'The rules schema',
          additionalItems: true,
          items: {
            $id: '#/properties/spec/properties/rules/items',
            type: 'object',
            title: 'The items schema',
            required: ['http'],
            properties: {
              http: {
                $id: '#/properties/spec/properties/rules/items/properties/http',
                type: 'object',
                title: 'The http schema',
                required: ['paths'],
                properties: {
                  paths: {
                    $id: '#/properties/spec/properties/rules/items/properties/http/properties/paths',
                    type: 'array',
                    title: 'The paths schema',
                    additionalItems: true,
                    items: {
                      $id: '#/properties/spec/properties/rules/items/properties/http/properties/paths/items',
                      type: 'object',
                      title: 'The items schema',
                      required: ['path', 'pathType', 'backend'],
                      properties: {
                        path: {
                          $id: '#/properties/spec/properties/rules/items/properties/http/properties/paths/items/properties/path',
                          type: 'string',
                          title: 'The path schema'
                        },
                        pathType: {
                          $id: '#/properties/spec/properties/rules/items/properties/http/properties/paths/items/properties/pathType',
                          type: 'string',
                          title: 'The pathType schema'
                        },
                        backend: {
                          $id: '#/properties/spec/properties/rules/items/properties/http/properties/paths/items/properties/backend',
                          type: 'object',
                          title: 'The backend schema',
                          required: ['service'],
                          properties: {
                            service: {
                              $id: '#/properties/spec/properties/rules/items/properties/http/properties/paths/items/properties/backend/properties/service',
                              type: 'object',
                              title: 'The service schema',
                              required: ['name', 'port'],
                              properties: {
                                name: {
                                  $id: '#/properties/spec/properties/rules/items/properties/http/properties/paths/items/properties/backend/properties/service/properties/name',
                                  type: 'string',
                                  title: 'The name schema'
                                },
                                port: {
                                  $id: '#/properties/spec/properties/rules/items/properties/http/properties/paths/items/properties/backend/properties/service/properties/port',
                                  type: 'object',
                                  title: 'The port schema',
                                  required: ['number'],
                                  properties: {
                                    number: {
                                      $id: '#/properties/spec/properties/rules/items/properties/http/properties/paths/items/properties/backend/properties/service/properties/port/properties/number',
                                      type: 'integer',
                                      title: 'The number schema'
                                    }
                                  },
                                  additionalProperties: true
                                }
                              },
                              additionalProperties: true
                            }
                          },
                          additionalProperties: true
                        }
                      },
                      additionalProperties: true
                    }
                  }
                },
                additionalProperties: true
              }
            },
            additionalProperties: true
          }
        }
      },
      additionalProperties: true
    },
    status: {
      $id: '#/properties/status',
      type: 'object',
      title: 'The status schema',
      required: [],
      additionalProperties: true
    }
  },
  additionalProperties: true
})

const getK8sIngressTemplate = ({ name, idleTime, projectId, orgId, cloudConnectorId }: Record<string, any>) => {
  const modifiedName = Utils.getHyphenSpacedString(name)
  return {
    apiVersion: 'lightwing.lightwing.io/v1',
    kind: 'AutoStoppingRule',
    metadata: {
      name: modifiedName,
      annotations: {
        'harness.io/project-id': projectId,
        'harness.io/org-id': orgId,
        'harness.io/cloud-connector-id': cloudConnectorId,
        'nginx.ingress.kubernetes.io/configuration-snippet': `more_set_input_headers "AutoStoppingRule: ${orgId}-${projectId}-${modifiedName}";`
      }
    },
    spec: {
      idleTimeMins: idleTime,
      rules: [
        {
          host: '<replace with your domain name or simply remove it>',
          http: {
            paths: [
              {
                path: '/',
                pathType: 'Prefix',
                backend: {
                  service: {
                    name: '<replace your service name>',
                    port: {
                      number: '<replace with your service port>'
                    }
                  }
                }
              }
            ]
          }
        }
      ]
    }
  }
}

export { getK8sYamlSchema, getK8sIngressTemplate }
