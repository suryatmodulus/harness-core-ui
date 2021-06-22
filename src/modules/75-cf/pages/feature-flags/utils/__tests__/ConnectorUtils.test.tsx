import {
  buildAWSPayload,
  buildArtifactoryPayload,
  buildGitPayload,
  removeErrorCode,
  buildKubPayload,
  setupKubFormData
} from '../ConnectorUtils'

jest.mock('services/cd-ng', () => ({
  getSecretV2Promise: jest.fn().mockImplementation(() =>
    Promise.resolve({
      data: {
        secret: {
          name: 'secretdevxDDUx'
        }
      }
    })
  )
}))

describe('Connector Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test(' test buildAWSPayload', () => {
    expect(
      buildAWSPayload({
        name: 'dummyaws',
        description: '',
        identifier: 'dummyaws',
        tags: {},
        delegateType: 'ManualConfig',
        username: 'usename',
        secretKeyRef: { name: 'mysecretappd', identifier: 'mysecretappd', referenceString: 'account.mysecretappd' },
        crossAccountAccess: false,
        accessKey: { type: 'TEXT', value: 'accesskey' }
      })
    ).toEqual({
      connector: {
        name: 'dummyaws',
        description: '',
        orgIdentifier: undefined,
        projectIdentifier: undefined,
        identifier: 'dummyaws',
        tags: {},
        type: 'Aws',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: { accessKey: 'accesskey', accessKeyRef: undefined, secretKeyRef: 'account.mysecretappd' },
            crossAccountAccess: null
          }
        }
      }
    })
  }),
    test(' test buildArtifactoryPayload', () => {
      expect(
        buildArtifactoryPayload({
          name: 'dummy name',
          description: '',
          identifier: 'dummy_name',
          tags: {},
          artifactoryServerUrl: 'dummyurl',
          authType: 'UsernamePassword',
          username: { type: 'TEXT', value: 'dummyusername' },
          password: { name: 'jkdhkjdhk', identifier: 'jkdhkjdhk', referenceString: 'account.jkdhkjdhk' }
        })
      ).toEqual({
        connector: {
          type: 'Artifactory',
          name: 'dummy name',
          identifier: 'dummy_name',
          description: '',
          tags: {},
          spec: {
            artifactoryServerUrl: 'dummyurl',
            auth: {
              type: 'UsernamePassword',
              spec: { username: 'dummyusername', usernameRef: undefined, passwordRef: 'account.jkdhkjdhk' }
            }
          }
        }
      })
    }),
    test(' test buildGitPayload with ssh', () => {
      expect(
        buildGitPayload({
          name: 'dummy name',
          description: '',
          identifier: 'dummy_name',
          tags: {},
          connectionType: 'Ssh',
          url: 'url',
          urlType: 'Repo',
          connectType: 'Ssh',
          sshKey: { referenceString: 'sshKeyRef' }
        })
      ).toEqual({
        connector: {
          type: 'Git',
          name: 'dummy name',
          identifier: 'dummy_name',
          orgIdentifier: undefined,
          projectIdentifier: undefined,
          description: '',
          tags: {},
          spec: {
            connectionType: 'Repo',
            url: 'url',
            type: 'Ssh',
            spec: {
              sshKeyRef: 'sshKeyRef'
            }
          }
        }
      })
    }),
    test(' test remove error code ', () => {
      expect(
        removeErrorCode([
          {
            message:
              'No eligible delegates could perform the required capabilities for this task: [ dhgjdgk ]↵  -  The capabilities were tested by the following delegates: [ Meenakshi-Raikwar-MBP ]↵  -  Following delegates were validating but never returned: [  ]↵  -  Other delegates (if any) may have been offline or were not eligible due to tag or scope restrictions.',
            reason: ' No Eligible Delegate Found',
            code: 450
          }
        ])
      ).toEqual([
        {
          message:
            'No eligible delegates could perform the required capabilities for this task: [ dhgjdgk ]↵  -  The capabilities were tested by the following delegates: [ Meenakshi-Raikwar-MBP ]↵  -  Following delegates were validating but never returned: [  ]↵  -  Other delegates (if any) may have been offline or were not eligible due to tag or scope restrictions.',
          reason: ' No Eligible Delegate Found'
        }
      ])
    }),
    test(' test buildKubPayload for ManualConfig All auth Type', async () => {
      expect(
        buildKubPayload({
          name: 'K8ManualUserPass',
          description: 'description',
          identifier: 'K8ManualUserPass',
          tags: {},
          delegateType: 'ManualConfig',
          authType: 'UsernamePassword',
          username: { value: 'username', type: 'TEXT' },
          password: { name: 'secretdevxEMfT', identifier: 'secretdevxDDUx', referenceString: 'account.secretdevxDDUx' },
          oidcIssuerUrl: '',
          oidcScopes: '',
          clientKeyAlgo: '',
          delegateSelectors: ['meenakshi-raikwar-mbp'],
          skipDefaultValidation: false,
          usernamefieldType: 'TEXT',
          masterUrl: 'masterurl',
          usernametextField: 'username'
        })
      ).toEqual({
        connector: {
          name: 'K8ManualUserPass',
          description: 'description',
          identifier: 'K8ManualUserPass',
          tags: {},
          type: 'K8sCluster',
          spec: {
            delegateSelectors: ['meenakshi-raikwar-mbp'],
            credential: {
              type: 'ManualConfig',
              spec: {
                masterUrl: 'masterurl',
                auth: {
                  type: 'UsernamePassword',
                  spec: { username: 'username', passwordRef: 'account.secretdevxDDUx' }
                }
              }
            }
          }
        }
      })

      expect(
        buildKubPayload({
          name: 'K8ManualServiceToken',
          identifier: 'K8ManualUserPass',
          description: 'description',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'K8sCluster',
          delegateType: 'ManualConfig',
          delegateName: '',
          masterUrl: 'masterurl',
          authType: 'ServiceAccount',
          skipDefaultValidation: false,
          username: { value: 'username', type: 'TEXT' },
          password: {
            identifier: 'secretdevxDDUx',
            name: 'secretdevxEMfT',
            referenceString: 'account.secretdevxDDUx',
            accountIdentifier: 'accountId'
          },
          serviceAccountToken: {
            name: 'secretdevxEMfT',
            identifier: 'secretdevxDDUx',
            referenceString: 'account.secretdevxDDUx'
          },
          usernamefieldType: 'TEXT',
          usernametextField: 'username',
          delegateSelectors: []
        })
      ).toEqual({
        connector: {
          name: 'K8ManualServiceToken',
          description: 'description',
          projectIdentifier: null,
          orgIdentifier: null,
          identifier: 'K8ManualUserPass',
          tags: {},
          type: 'K8sCluster',
          spec: {
            delegateSelectors: [],
            credential: {
              type: 'ManualConfig',
              spec: {
                masterUrl: 'masterurl',
                auth: { type: 'ServiceAccount', spec: { serviceAccountTokenRef: 'account.secretdevxDDUx' } }
              }
            }
          }
        }
      })
      expect(
        buildKubPayload({
          name: 'K8ManualOIDC',
          identifier: 'K8ManualUserPass',
          description: 'description',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'K8sCluster',
          delegateType: 'ManualConfig',
          delegateName: '',
          masterUrl: 'masterurl',
          authType: 'OpenIdConnect',
          skipDefaultValidation: false,
          oidcIssuerUrl: 'oidc url',
          oidcPassword: {
            name: 'secretdevxEMfT',
            identifier: 'secretdevxDDUx',
            referenceString: 'account.secretdevxDDUx'
          },
          oidcCleintId: {
            name: 'secretdevxEMfT',
            identifier: 'secretdevxDDUx',
            referenceString: 'account.secretdevxDDUx'
          },
          oidcCleintSecret: {
            name: 'secretdevxEMfT',
            identifier: 'secretdevxDDUx',
            referenceString: 'account.secretdevxDDUx'
          },
          oidcScopes: 'scope',
          oidcUsernamefieldType: 'TEXT',
          oidcUsernametextField: 'username',
          oidcUsername: { value: 'username', type: 'TEXT' },
          delegateSelectors: []
        })
      ).toEqual({
        connector: {
          name: 'K8ManualOIDC',
          description: 'description',
          projectIdentifier: null,
          orgIdentifier: null,
          identifier: 'K8ManualUserPass',
          tags: {},
          type: 'K8sCluster',
          spec: {
            delegateSelectors: [],
            credential: {
              type: 'ManualConfig',
              spec: {
                masterUrl: 'masterurl',
                auth: {
                  type: 'OpenIdConnect',
                  spec: {
                    oidcIssuerUrl: 'oidc url',
                    oidcUsername: 'username',
                    oidcPasswordRef: 'account.secretdevxDDUx',
                    oidcClientIdRef: 'account.secretdevxDDUx',
                    oidcSecretRef: 'account.secretdevxDDUx',
                    oidcScopes: 'scope'
                  }
                }
              }
            }
          }
        }
      })
      expect(
        buildKubPayload({
          name: 'K8ManualClientId',
          identifier: 'K8ManualUserPass',
          description: 'description',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'K8sCluster',
          delegateType: 'ManualConfig',
          delegateName: '',
          masterUrl: 'masterurl',
          authType: 'ClientKeyCert',
          skipDefaultValidation: false,
          clientKey: {
            name: 'secretdevxEMfT',
            identifier: 'secretdevxDDUx',
            referenceString: 'account.secretdevxDDUx'
          },
          clientKeyCertificate: {
            name: 'secretdevxEMfT',
            identifier: 'secretdevxDDUx',
            referenceString: 'account.secretdevxDDUx'
          },
          clientKeyPassphrase: {
            name: 'secretdevxEMfT',
            identifier: 'secretdevxDDUx',
            referenceString: 'account.secretdevxDDUx'
          },
          clientKeyCACertificate: {
            name: 'secretdevxEMfT',
            identifier: 'secretdevxDDUx',
            referenceString: 'account.secretdevxDDUx'
          },
          clientKeyAlgo: 'key algo',

          delegateSelectors: []
        })
      ).toEqual({
        connector: {
          name: 'K8ManualClientId',
          description: 'description',
          projectIdentifier: null,
          orgIdentifier: null,
          identifier: 'K8ManualUserPass',
          tags: {},
          type: 'K8sCluster',
          spec: {
            delegateSelectors: [],
            credential: {
              type: 'ManualConfig',
              spec: {
                masterUrl: 'masterurl',
                auth: {
                  type: 'ClientKeyCert',
                  spec: {
                    clientKeyRef: 'account.secretdevxDDUx',
                    clientCertRef: 'account.secretdevxDDUx',
                    clientKeyPassphraseRef: 'account.secretdevxDDUx',
                    caCertRef: 'account.secretdevxDDUx',
                    clientKeyAlgo: 'key algo'
                  }
                }
              }
            }
          }
        }
      })
    })
  test('test setupKubFormData', () => {
    expect(
      setupKubFormData(
        {
          name: 'K8ManualClientId',
          identifier: 'K8ManualUserPass',
          description: 'description',
          tags: {},
          type: 'K8sCluster',
          spec: {
            credential: {
              type: 'ManualConfig',
              spec: {
                masterUrl: 'masterurl',
                auth: {
                  type: 'ClientKeyCert',
                  spec: {
                    caCertRef: 'account.secretdevxDDUx',
                    clientCertRef: 'account.secretdevxDDUx',
                    clientKeyRef: 'account.secretdevxDDUx',
                    clientKeyPassphraseRef: 'account.secretdevxDDUx',
                    clientKeyAlgo: 'key algo'
                  }
                }
              }
            },
            delegateSelectors: []
          }
        },
        'accountId'
      )
    ).resolves.toEqual({
      delegateType: 'ManualConfig',
      delegateName: '',
      masterUrl: 'masterurl',
      authType: 'ClientKeyCert',
      skipDefaultValidation: false,
      clientKey: {
        identifier: 'secretdevxDDUx',
        name: 'secretdevxDDUx',
        referenceString: 'account.secretdevxDDUx',
        accountIdentifier: 'accountId'
      },
      clientKeyCertificate: {
        identifier: 'secretdevxDDUx',
        name: 'secretdevxDDUx',
        referenceString: 'account.secretdevxDDUx',
        accountIdentifier: 'accountId'
      },
      clientKeyPassphrase: {
        identifier: 'secretdevxDDUx',
        name: 'secretdevxDDUx',
        referenceString: 'account.secretdevxDDUx',
        accountIdentifier: 'accountId'
      },
      clientKeyCACertificate: {
        identifier: 'secretdevxDDUx',
        name: 'secretdevxDDUx',
        referenceString: 'account.secretdevxDDUx',
        accountIdentifier: 'accountId'
      },
      clientKeyAlgo: 'key algo'
    })

    expect(
      setupKubFormData(
        {
          name: 'K8ManualOIDC',
          identifier: 'K8ManualUserPass',
          description: 'description',
          tags: {},
          type: 'K8sCluster',
          spec: {
            credential: {
              type: 'ManualConfig',
              spec: {
                masterUrl: 'masterurl',
                auth: {
                  type: 'OpenIdConnect',
                  spec: {
                    oidcIssuerUrl: 'url',
                    oidcUsername: 'username',
                    oidcUsernameRef: null,
                    oidcClientIdRef: 'account.secretdevxDDUx',
                    oidcPasswordRef: 'account.secretdevxDDUx',
                    oidcSecretRef: 'account.secretdevxDDUx',
                    oidcScopes: 'scope'
                  }
                }
              }
            },
            delegateSelectors: []
          }
        },
        'accountId'
      )
    ).resolves.toEqual({
      delegateType: 'ManualConfig',
      delegateName: '',
      masterUrl: 'masterurl',
      authType: 'OpenIdConnect',
      skipDefaultValidation: false,
      oidcIssuerUrl: 'url',
      oidcUsername: { value: 'username', type: 'TEXT' },
      oidcPassword: {
        identifier: 'secretdevxDDUx',
        name: 'secretdevxDDUx',
        referenceString: 'account.secretdevxDDUx',
        accountIdentifier: 'accountId'
      },
      oidcCleintId: {
        identifier: 'secretdevxDDUx',
        name: 'secretdevxDDUx',
        referenceString: 'account.secretdevxDDUx',
        accountIdentifier: 'accountId'
      },
      oidcCleintSecret: {
        identifier: 'secretdevxDDUx',
        name: 'secretdevxDDUx',
        referenceString: 'account.secretdevxDDUx',
        accountIdentifier: 'accountId'
      },
      oidcScopes: 'scope'
    })

    expect(
      setupKubFormData(
        {
          name: 'K8Manualservice',
          identifier: 'K8ManualUserPass',
          description: 'description',
          tags: {},
          type: 'K8sCluster',
          spec: {
            credential: {
              type: 'ManualConfig',
              spec: {
                masterUrl: 'masterurl',
                auth: { type: 'ServiceAccount', spec: { serviceAccountTokenRef: 'account.secretdevxDDUx' } }
              }
            },
            delegateSelectors: ['meenakshi-raikwar-mbp']
          }
        },
        'accountId'
      )
    ).resolves.toEqual({
      delegateType: 'ManualConfig',
      delegateName: '',
      masterUrl: 'masterurl',
      authType: 'ServiceAccount',
      skipDefaultValidation: false,
      serviceAccountToken: {
        identifier: 'secretdevxDDUx',
        name: 'secretdevxDDUx',
        referenceString: 'account.secretdevxDDUx',
        accountIdentifier: 'accountId'
      }
    })
  })
})
