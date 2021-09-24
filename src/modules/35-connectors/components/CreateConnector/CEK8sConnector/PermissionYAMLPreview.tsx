import React from 'react'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'

const yamlContent = {
  apiVersion: 'rbac.authorization.k8s.io/v1',
  kind: 'ClusterRole',
  metadata: {
    name: 'ce-clusterrole'
  },
  rules: [
    {
      apiGroups: [''],
      resources: [
        'pods',
        'nodes',
        'nodes/proxy',
        'events',
        'namespaces',
        'persistentvolumes',
        'persistentvolumeclaims'
      ],
      verbs: ['get', 'list', 'watch']
    },
    {
      apiGroups: ['apps', 'extensions'],
      resources: ['statefulsets', 'deployments', 'daemonsets', 'replicasets'],
      verbs: ['get', 'list', 'watch']
    },
    {
      apiGroups: ['batch'],
      resources: ['jobs', 'cronjobs'],
      verbs: ['get', 'list', 'watch']
    },
    {
      apiGroups: ['metrics.k8s.io'],
      resources: ['pods', 'nodes'],
      verbs: ['get', 'list']
    },
    {
      apiGroups: ['storage.k8s.io'],
      resources: ['storageclasses'],
      verbs: ['get', 'list', 'watch']
    }
  ],
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: 'ClusterRole',
    name: 'ce-clusterrole'
  },
  subjects: [
    {
      kind: 'ServiceAccount',
      name: 'default',
      namespace: 'harness-delegate'
    }
  ],
  data: {
    account_id: 'kmpySmUISimoRrJL6NL73w',
    connector_id: 'cerishiconnector'
  },
  spec: {
    group: 'lightwing.lightwing.io',
    names: {
      kind: 'AutoStoppingRule',
      listKind: 'AutoStoppingRuleList',
      plural: 'autostoppingrules',
      singular: 'autostoppingrule'
    },
    scope: 'Namespaced',
    versions: [
      {
        name: 'v1',
        schema: {
          openAPIV3Schema: {
            'x-kubernetes-preserve-unknown-fields': true,
            description: 'AutoStoppingRule is the Schema for the autostoppingrules API',
            properties: {
              apiVersion: {
                type: 'string'
              },
              kind: {
                type: 'string'
              },
              metadata: {
                type: 'object'
              },
              spec: {
                'x-kubernetes-preserve-unknown-fields': true,
                description: 'AutoStoppingRuleSpec defines the desired state of AutoStoppingRule',
                properties: {
                  foo: {
                    description:
                      'Foo is an example field of AutoStoppingRule. Edit autostoppingrule_types.go\nto remove/update',
                    type: 'string'
                  }
                },
                type: 'object'
              },
              status: {
                'x-kubernetes-preserve-unknown-fields': true,
                description: 'AutoStoppingRuleStatus defines the observed state of AutoStoppingRule',
                type: 'object'
              }
            },
            type: 'object'
          }
        },
        served: true,
        storage: true,
        subresources: {
          status: {}
        }
      }
    ]
  },
  status: {
    acceptedNames: {
      kind: '',
      plural: ''
    },
    conditions: [],
    storedVersions: []
  }
}

const PermissionYAMLPreview = () => {
  return (
    <div>
      <YAMLBuilder
        showSnippetSection={false}
        entityType="Service"
        height="400px"
        fileName={'ccm-k8s-connector.yaml'}
        existingJSON={yamlContent}
        yamlSanityConfig={{ removeEmptyObject: false, removeEmptyString: false, removeEmptyArray: false }}
        isReadOnlyMode={true}
        isEditModeSupported={false}
        theme={'DARK'}
      />
    </div>
  )
}

export default PermissionYAMLPreview
