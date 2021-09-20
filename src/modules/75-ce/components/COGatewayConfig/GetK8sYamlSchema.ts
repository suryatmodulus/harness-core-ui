import { isEmpty as _isEmpty } from 'lodash-es'
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
      description: '',
      required: ['hideProgressPage'],
      properties: {
        idleTimeMins: {
          $id: '#/properties/spec/properties/idleTimeMins',
          type: 'integer',
          title: 'The idleTimeMins schema',
          description: ''
        },
        hideProgressPage: {
          $id: '#/properties/spec/properties/hideProgressPage',
          type: 'boolean',
          title: 'The hideProgressPage schema',
          description: ''
        },
        dependencies: {
          $id: '#/properties/spec/properties/dependencies',
          type: 'array',
          title: 'The dependencies schema',
          description: '',
          additionalItems: true,
          items: {
            $id: '#/properties/spec/properties/dependencies/items',
            anyOf: [
              {
                $id: '#/properties/spec/properties/dependencies/items/anyOf/0',
                type: 'object',
                title: 'Dependency Object',
                description: '',
                required: ['selector', 'wait'],
                properties: {
                  selector: {
                    $id: '#/properties/spec/properties/dependencies/items/anyOf/0/properties/selector',
                    type: 'object',
                    title: 'The selector schema',
                    description: '',
                    required: ['ruleName'],
                    properties: {
                      ruleName: {
                        $id: '#/properties/spec/properties/dependencies/items/anyOf/0/properties/selector/properties/ruleName',
                        type: 'string',
                        title: 'The ruleName schema',
                        description: ''
                      }
                    },
                    additionalProperties: true
                  },
                  wait: {
                    $id: '#/properties/spec/properties/dependencies/items/anyOf/0/properties/wait',
                    type: 'integer',
                    title: 'The wait schema',
                    description: ''
                  }
                },
                additionalProperties: true
              }
            ]
          }
        },
        ingress: {
          $id: '#/properties/spec/properties/ingress',
          type: 'object',
          title: 'The ingress schema',
          description: '',
          required: ['rules'],
          properties: {
            rules: {
              $id: '#/properties/spec/properties/ingress/properties/rules',
              type: 'array',
              title: 'The rules schema',
              description: '',
              additionalItems: true,
              items: {
                $id: '#/properties/spec/properties/ingress/properties/rules/items',
                anyOf: [
                  {
                    $id: '#/properties/spec/properties/ingress/properties/rules/items/anyOf/0',
                    type: 'object',
                    title: 'Rule Object',
                    description: '',
                    required: ['host', 'http'],
                    properties: {
                      host: {
                        $id: '#/properties/spec/properties/ingress/properties/rules/items/anyOf/0/properties/host',
                        type: 'string',
                        title: 'The host schema',
                        description: ''
                      },
                      http: {
                        $id: '#/properties/spec/properties/ingress/properties/rules/items/anyOf/0/properties/http',
                        type: 'object',
                        title: 'The http schema',
                        description: '',
                        required: ['paths'],
                        properties: {
                          paths: {
                            $id: '#/properties/spec/properties/ingress/properties/rules/items/anyOf/0/properties/http/properties/paths',
                            type: 'array',
                            title: 'The paths schema',
                            description: '',
                            additionalItems: true,
                            items: {
                              $id: '#/properties/spec/properties/ingress/properties/rules/items/anyOf/0/properties/http/properties/paths/items',
                              anyOf: [
                                {
                                  $id: '#/properties/spec/properties/ingress/properties/rules/items/anyOf/0/properties/http/properties/paths/items/anyOf/0',
                                  type: 'object',
                                  title: 'Path Object',
                                  description: '',
                                  required: ['path', 'pathType', 'backend'],
                                  properties: {
                                    path: {
                                      $id: '#/properties/spec/properties/ingress/properties/rules/items/anyOf/0/properties/http/properties/paths/items/anyOf/0/properties/path',
                                      type: 'string',
                                      title: 'The path schema',
                                      description: ''
                                    },
                                    pathType: {
                                      $id: '#/properties/spec/properties/ingress/properties/rules/items/anyOf/0/properties/http/properties/paths/items/anyOf/0/properties/pathType',
                                      type: 'string',
                                      title: 'The pathType schema',
                                      description: ''
                                    },
                                    backend: {
                                      $id: '#/properties/spec/properties/ingress/properties/rules/items/anyOf/0/properties/http/properties/paths/items/anyOf/0/properties/backend',
                                      type: 'object',
                                      title: 'The backend schema',
                                      description: '',
                                      required: ['service'],
                                      properties: {
                                        service: {
                                          type: 'object',
                                          title: 'The service schema',
                                          description: '',
                                          required: ['name', 'port'],
                                          properties: {
                                            name: {
                                              type: 'string',
                                              title: 'The name schema',
                                              description: ''
                                            },
                                            port: {
                                              type: 'object',
                                              title: 'The port schema',
                                              description: '',
                                              required: ['number'],
                                              properties: {
                                                number: {
                                                  type: 'integer',
                                                  title: 'The number schema',
                                                  description: ''
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
                              ]
                            }
                          }
                        },
                        additionalProperties: true
                      }
                    },
                    additionalProperties: true
                  }
                ]
              }
            }
          },
          additionalProperties: true
        },
        serviceName: {
          $id: '#/properties/spec/properties/serviceName',
          type: 'string',
          title: 'The serviceName schema',
          description: ''
        }
      },
      oneOf: [
        {
          required: ['ingress']
        },
        {
          required: ['serviceName']
        }
      ],
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

const getK8sIngressTemplate = ({ name, idleTime, cloudConnectorId, hideProgressPage, deps }: Record<string, any>) => {
  const modifiedName = Utils.getHyphenSpacedString(name)
  return {
    apiVersion: 'lightwing.lightwing.io/v1',
    kind: 'AutoStoppingRule',
    metadata: {
      name: modifiedName,
      annotations: {
        'harness.io/cloud-connector-id': cloudConnectorId,
        'nginx.ingress.kubernetes.io/configuration-snippet': `more_set_input_headers "AutoStoppingRule: ${modifiedName}";`
      }
    },
    spec: {
      idleTimeMins: idleTime,
      hideProgressPage: Boolean(hideProgressPage),
      ingress: {
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
      },
      ...(!_isEmpty(deps) && { dependencies: deps })
    }
  }
}

export { getK8sYamlSchema, getK8sIngressTemplate }
