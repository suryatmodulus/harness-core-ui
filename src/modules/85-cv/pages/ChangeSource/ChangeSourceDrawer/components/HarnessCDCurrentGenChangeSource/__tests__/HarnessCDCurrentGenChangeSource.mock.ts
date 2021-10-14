export const mockedEnvironments = {
  metaData: {},
  resource: {
    offset: '0',
    start: 0,
    limit: null,
    filters: [
      {
        fieldName: 'appId',
        fieldValues: ['t-cO5ChuS2afXKNrJk2_Eg'],
        op: 'IN'
      },
      {
        fieldName: '_id',
        fieldValues: ['Ym-GIpJZQHu7RtF0OQ4I_A'],
        op: 'IN'
      },
      {
        fieldName: 'accountId',
        fieldValues: ['kmpySmUISimoRrJL6NL73w'],
        op: 'IN'
      },
      {
        fieldName: 'appId',
        fieldValues: ['t-cO5ChuS2afXKNrJk2_Eg'],
        op: 'IN'
      }
    ],
    orders: [
      {
        fieldName: 'createdAt',
        orderType: 'DESC'
      }
    ],
    fieldsIncluded: [],
    fieldsExcluded: [],
    response: [
      {
        uuid: 'Ym-GIpJZQHu7RtF0OQ4I_A',
        appId: 't-cO5ChuS2afXKNrJk2_Eg',
        createdBy: null,
        createdAt: 1632127066881,
        lastUpdatedBy: null,
        lastUpdatedAt: 1632127066882,
        name: 'Test Env',
        description: null,
        configMapYaml: null,
        helmValueYaml: null,
        configMapYamlByServiceTemplateId: null,
        helmValueYamlByServiceTemplateId: null,
        environmentType: 'PROD',
        serviceTemplates: null,
        configFiles: null,
        setup: null,
        infrastructureDefinitions: null,
        infraDefinitionsCount: 0,
        keywords: ['test env', 'prod'],
        accountId: 'kmpySmUISimoRrJL6NL73w',
        sample: false,
        tagLinks: null
      }
    ],
    total: 1,
    currentPage: 1,
    empty: false,
    pageSize: 1000,
    or: false
  },
  responseMessages: []
}

export const mockedServices = {
  metaData: {},
  resource: {
    offset: '0',
    start: 0,
    limit: null,
    filters: [
      { fieldName: 'appId', fieldValues: ['t-cO5ChuS2afXKNrJk2_Eg'], op: 'IN' },
      { fieldName: '_id', fieldValues: ['nOSIX_OFSzeOEyLaZYlJmg', 'Ei1L1JafR9yIK6BC15ZuJA'], op: 'IN' },
      { fieldName: 'accountId', fieldValues: ['kmpySmUISimoRrJL6NL73w'], op: 'IN' },
      { fieldName: 'appId', fieldValues: ['t-cO5ChuS2afXKNrJk2_Eg'], op: 'IN' }
    ],
    orders: [{ fieldName: 'createdAt', orderType: 'DESC' }],
    fieldsIncluded: [],
    fieldsExcluded: [],
    response: [
      {
        uuid: 'nOSIX_OFSzeOEyLaZYlJmg',
        appId: 't-cO5ChuS2afXKNrJk2_Eg',
        createdBy: null,
        createdAt: 1632127071751,
        lastUpdatedBy: null,
        lastUpdatedAt: 1632127071783,
        name: 'Archive',
        description: 'ssxvnJHpDqdxVCrAsTVYbcwv',
        artifactType: 'WAR',
        deploymentType: 'SSH',
        serviceId: null,
        configMapYaml: null,
        helmValueYaml: null,
        version: 2,
        appContainer: null,
        configFiles: [],
        serviceVariables: [],
        artifactStreams: [],
        serviceCommands: [],
        lastDeploymentActivity: null,
        lastProdDeploymentActivity: null,
        setup: null,
        keywords: ['war', 'archive', 'ssxvnjhpdqdxvcrastvybcwv'],
        helmVersion: null,
        cfCliVersion: null,
        accountId: 'kmpySmUISimoRrJL6NL73w',
        artifactStreamIds: ['2-8cX-ouSwO6RkKrMDMaCA'],
        artifactStreamBindings: null,
        sample: false,
        tagLinks: null,
        deploymentTypeTemplateId: null,
        customDeploymentName: null,
        artifactFromManifest: null,
        pcfV2: false,
        k8sV2: false,
        type: 'SERVICE'
      },
      {
        uuid: 'Ei1L1JafR9yIK6BC15ZuJA',
        appId: 't-cO5ChuS2afXKNrJk2_Eg',
        createdBy: null,
        createdAt: 1632127066984,
        lastUpdatedBy: null,
        lastUpdatedAt: 1632127067076,
        name: 'Test Service',
        description: 'ssxvnJHpDqdxVCrAsTVYbcwv',
        artifactType: 'WAR',
        deploymentType: 'SSH',
        serviceId: null,
        configMapYaml: null,
        helmValueYaml: null,
        version: 2,
        appContainer: null,
        configFiles: [],
        serviceVariables: [],
        artifactStreams: [],
        serviceCommands: [],
        lastDeploymentActivity: null,
        lastProdDeploymentActivity: null,
        setup: null,
        keywords: ['test service', 'war', 'ssxvnjhpdqdxvcrastvybcwv'],
        helmVersion: null,
        cfCliVersion: null,
        accountId: 'kmpySmUISimoRrJL6NL73w',
        artifactStreamIds: ['3Ie7Lcr5Sj-6U0GLVQ7Vgw'],
        artifactStreamBindings: null,
        sample: false,
        tagLinks: null,
        deploymentTypeTemplateId: null,
        customDeploymentName: null,
        artifactFromManifest: null,
        pcfV2: false,
        k8sV2: false,
        type: 'SERVICE'
      }
    ],
    total: 2,
    currentPage: 1,
    empty: false,
    or: false,
    pageSize: 1000
  },
  responseMessages: []
}
