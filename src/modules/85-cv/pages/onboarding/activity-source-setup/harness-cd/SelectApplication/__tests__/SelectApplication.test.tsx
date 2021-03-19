import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import type { UseGetReturn } from 'restful-react'
import * as portalService from 'services/portal'
import { TestWrapper } from '@common/utils/testUtils'
import SelectApplication from '../SelectApplication'
import mockData from './mockData.json'

const MockData = {
  metaData: {},
  resource: {
    offset: '0',
    start: 0,
    limit: '9',
    filters: [
      { fieldName: 'accountId', fieldValues: ['1234_accountId'], op: 'EQ' },
      { fieldName: 'accountId', fieldValues: ['1234_accountId'], op: 'EQ' },
      { fieldName: 'accountId', fieldValues: ['1234_accountId'], op: 'IN' }
    ],
    orders: [{ fieldName: 'createdAt', orderType: 'DESC' }],
    fieldsIncluded: [],
    fieldsExcluded: [],
    response: [
      {
        uuid: '1234_appId',
        appId: '1234_appId',
        createdBy: { uuid: 'qxSKwm7dR-md9iDWLV1lZA', name: 'Praveen Sugavanam', email: 'praveen@harness.io' },
        createdAt: 1600872950157,
        lastUpdatedBy: { uuid: 'qxSKwm7dR-md9iDWLV1lZA', name: 'Praveen Sugavanam', email: 'praveen@harness.io' },
        lastUpdatedAt: 1600872950157,
        name: 'Nemanja App',
        description: '',
        accountId: '1234_accountId',
        services: [
          {
            uuid: '1234_uuid',
            appId: '1234_appId',
            createdBy: { uuid: 'qxSKwm7dR-md9iDWLV1lZA', name: 'Praveen Sugavanam', email: 'praveen@harness.io' },
            createdAt: 1600873141461,
            lastUpdatedBy: { uuid: 'qxSKwm7dR-md9iDWLV1lZA', name: 'Praveen Sugavanam', email: 'praveen@harness.io' },
            lastUpdatedAt: 1600873202686,
            name: 'Kubernetes Service',
            description: null,
            artifactType: 'DOCKER',
            deploymentType: 'KUBERNETES',
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
            keywords: ['kubernetes service', 'docker'],
            helmVersion: 'V2',
            accountId: '1234_accountId',
            artifactStreamIds: ['C7eBUW0gT3KFE4AO8Di-Gg'],
            artifactStreamBindings: null,
            sample: false,
            tagLinks: null,
            deploymentTypeTemplateId: null,
            customDeploymentName: null,
            k8sV2: true,
            pcfV2: false
          }
        ],
        environments: [
          {
            uuid: '4567_uuid',
            appId: '1234_appId',
            createdBy: { uuid: 'qxSKwm7dR-md9iDWLV1lZA', name: 'Praveen Sugavanam', email: 'praveen@harness.io' },
            createdAt: 1600872987963,
            lastUpdatedBy: { uuid: 'qxSKwm7dR-md9iDWLV1lZA', name: 'Praveen Sugavanam', email: 'praveen@harness.io' },
            lastUpdatedAt: 1600872987963,
            name: 'Nemanja Env',
            description: '',
            configMapYaml: null,
            helmValueYaml: null,
            configMapYamlByServiceTemplateId: null,
            helmValueYamlByServiceTemplateId: null,
            environmentType: 'NON_PROD',
            serviceTemplates: null,
            configFiles: null,
            setup: null,
            infrastructureDefinitions: null,
            infraDefinitionsCount: 0,
            keywords: ['non_prod', 'nemanja env'],
            accountId: '1234_accountId',
            sample: false,
            tagLinks: null
          }
        ],
        setup: null,
        recentExecutions: null,
        notifications: null,
        nextDeploymentOn: 0,
        keywords: ['nemanja app'],
        yamlGitConfig: null,
        defaults: {},
        sample: false,
        tagLinks: null
      },
      {
        uuid: 'asd_id',
        appId: 'asd_id',
        createdBy: { uuid: 'asdad123', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
        createdAt: 1585715224974,
        lastUpdatedBy: { uuid: 'asdad123', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
        lastUpdatedAt: 1585715224974,
        name: 'wmxdkemzkhkl',
        description: 'eemdmcyouelr',
        accountId: '1234_accountId',
        services: [
          {
            uuid: '0vJTTbyxT0uNyFIseYDkWg',
            appId: 'asd_id',
            createdBy: { uuid: 'asdad123', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
            createdAt: 1585715227280,
            lastUpdatedBy: {
              uuid: 'asdad123',
              name: 'Malya Regula',
              email: 'malyadri.regula@harness.io'
            },
            lastUpdatedAt: 1585715227280,
            name: 'hgffeeehcg',
            description: 'bahhgcdaga',
            artifactType: 'DOCKER',
            deploymentType: 'KUBERNETES',
            configMapYaml: null,
            helmValueYaml: null,
            version: 1,
            appContainer: null,
            configFiles: [],
            serviceVariables: [],
            artifactStreams: [],
            serviceCommands: [],
            lastDeploymentActivity: null,
            lastProdDeploymentActivity: null,
            setup: null,
            keywords: ['bahhgcdaga', 'hgffeeehcg', 'docker'],
            helmVersion: 'V2',
            accountId: '1234_accountId',
            artifactStreamIds: null,
            artifactStreamBindings: null,
            sample: false,
            tagLinks: null,
            deploymentTypeTemplateId: null,
            customDeploymentName: null,
            k8sV2: true,
            pcfV2: false
          }
        ],
        environments: [],
        setup: null,
        recentExecutions: null,
        notifications: null,
        nextDeploymentOn: 0,
        keywords: ['wmxdkemzkhkl', 'eemdmcyouelr'],
        yamlGitConfig: null,
        defaults: {},
        sample: false,
        tagLinks: null
      },
      {
        uuid: '1231231_123',
        appId: '1231231_123',
        createdBy: { uuid: '12312fsdfs', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
        createdAt: 1585714764326,
        lastUpdatedBy: { uuid: '12312fsdfs', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
        lastUpdatedAt: 1585714764326,
        name: 'oktgezjibufp',
        description: 'qftdmhtrhpvy',
        accountId: '1234_accountId',
        services: [
          {
            uuid: 'SwNJzheST-iuTL0nSY1a_w',
            appId: '1231231_123',
            createdBy: { uuid: '12312fsdfs', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
            createdAt: 1585714771150,
            lastUpdatedBy: {
              uuid: '12312fsdfs',
              name: 'Malya Regula',
              email: 'malyadri.regula@harness.io'
            },
            lastUpdatedAt: 1585714771150,
            name: 'bbgdffgcfb',
            description: 'aaddgaggbh',
            artifactType: 'DOCKER',
            deploymentType: 'KUBERNETES',
            configMapYaml: null,
            helmValueYaml: null,
            version: 1,
            appContainer: null,
            configFiles: [],
            serviceVariables: [],
            artifactStreams: [],
            serviceCommands: [],
            lastDeploymentActivity: null,
            lastProdDeploymentActivity: null,
            setup: null,
            keywords: ['aaddgaggbh', 'bbgdffgcfb', 'docker'],
            helmVersion: 'V2',
            accountId: '1234_accountId',
            artifactStreamIds: null,
            artifactStreamBindings: null,
            sample: false,
            tagLinks: null,
            deploymentTypeTemplateId: null,
            customDeploymentName: null,
            k8sV2: true,
            pcfV2: false
          },
          {
            uuid: '123123_sfsf',
            appId: '123123_sdff',
            createdBy: { uuid: 'asdasdaa56', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
            createdAt: 1585714766247,
            lastUpdatedBy: {
              uuid: 'asdasdaa56',
              name: 'Malya Regula',
              email: 'malyadri.regula@harness.io'
            },
            lastUpdatedAt: 1585714766247,
            name: 'cgcdabdcgb',
            description: 'bfaahdchaa',
            artifactType: 'DOCKER',
            deploymentType: 'KUBERNETES',
            configMapYaml: null,
            helmValueYaml: null,
            version: 1,
            appContainer: null,
            configFiles: [],
            serviceVariables: [],
            artifactStreams: [],
            serviceCommands: [],
            lastDeploymentActivity: null,
            lastProdDeploymentActivity: null,
            setup: null,
            keywords: ['bfaahdchaa', 'cgcdabdcgb', 'docker'],
            helmVersion: 'V2',
            accountId: '1234_accountId',
            artifactStreamIds: null,
            artifactStreamBindings: null,
            sample: false,
            tagLinks: null,
            deploymentTypeTemplateId: null,
            customDeploymentName: null,
            k8sV2: true,
            pcfV2: false
          }
        ],
        environments: [],
        setup: null,
        recentExecutions: null,
        notifications: null,
        nextDeploymentOn: 0,
        keywords: ['oktgezjibufp', 'qftdmhtrhpvy'],
        yamlGitConfig: null,
        defaults: {},
        sample: false,
        tagLinks: null
      },
      {
        uuid: 's6x2LXq3S-qvQFjMoj0PTw',
        appId: 's6x2LXq3S-qvQFjMoj0PTw',
        createdBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
        createdAt: 1585629947719,
        lastUpdatedBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
        lastUpdatedAt: 1585629947719,
        name: 'vhbsjusfxvvn',
        description: 'xiksbhdjuzyc',
        accountId: '1234_accountId',
        services: [
          {
            uuid: 'X5D_KHqwRzGmVqpMT62lww',
            appId: 's6x2LXq3S-qvQFjMoj0PTw',
            createdBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
            createdAt: 1585629953973,
            lastUpdatedBy: {
              uuid: '6EZobE9ZSXagi2eMkcg7XA',
              name: 'Malya Regula',
              email: 'malyadri.regula@harness.io'
            },
            lastUpdatedAt: 1585629953973,
            name: 'hhaabghdge',
            description: 'dcffbcccbd',
            artifactType: 'DOCKER',
            deploymentType: 'KUBERNETES',
            configMapYaml: null,
            helmValueYaml: null,
            version: 1,
            appContainer: null,
            configFiles: [],
            serviceVariables: [],
            artifactStreams: [],
            serviceCommands: [],
            lastDeploymentActivity: null,
            lastProdDeploymentActivity: null,
            setup: null,
            keywords: ['dcffbcccbd', 'hhaabghdge', 'docker'],
            helmVersion: 'V2',
            accountId: '1234_accountId',
            artifactStreamIds: null,
            artifactStreamBindings: null,
            sample: false,
            tagLinks: null,
            deploymentTypeTemplateId: null,
            customDeploymentName: null,
            k8sV2: true,
            pcfV2: false
          },
          {
            uuid: '4x7_6aQbTUyPqv5htdBQjA',
            appId: 's6x2LXq3S-qvQFjMoj0PTw',
            createdBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
            createdAt: 1585629949522,
            lastUpdatedBy: {
              uuid: '6EZobE9ZSXagi2eMkcg7XA',
              name: 'Malya Regula',
              email: 'malyadri.regula@harness.io'
            },
            lastUpdatedAt: 1585629949522,
            name: 'hdedddcehc',
            description: 'gcaeghadeb',
            artifactType: 'DOCKER',
            deploymentType: 'KUBERNETES',
            configMapYaml: null,
            helmValueYaml: null,
            version: 1,
            appContainer: null,
            configFiles: [],
            serviceVariables: [],
            artifactStreams: [],
            serviceCommands: [],
            lastDeploymentActivity: null,
            lastProdDeploymentActivity: null,
            setup: null,
            keywords: ['hdedddcehc', 'gcaeghadeb', 'docker'],
            helmVersion: 'V2',
            accountId: '1234_accountId',
            artifactStreamIds: null,
            artifactStreamBindings: null,
            sample: false,
            tagLinks: null,
            deploymentTypeTemplateId: null,
            customDeploymentName: null,
            k8sV2: true,
            pcfV2: false
          }
        ],
        environments: [
          {
            uuid: 'fHtffsCkRjmNdZ4SAorv2Q',
            appId: 's6x2LXq3S-qvQFjMoj0PTw',
            createdBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
            createdAt: 1585629958449,
            lastUpdatedBy: {
              uuid: '6EZobE9ZSXagi2eMkcg7XA',
              name: 'Malya Regula',
              email: 'malyadri.regula@harness.io'
            },
            lastUpdatedAt: 1585629958449,
            name: 'nnmjipjnqo',
            description: 'qjmnqmpqmn',
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
            keywords: ['prod', 'nnmjipjnqo', 'qjmnqmpqmn'],
            accountId: '1234_accountId',
            sample: false,
            tagLinks: null
          }
        ],
        setup: null,
        recentExecutions: null,
        notifications: null,
        nextDeploymentOn: 0,
        keywords: ['vhbsjusfxvvn', 'xiksbhdjuzyc'],
        yamlGitConfig: null,
        defaults: {},
        sample: false,
        tagLinks: null
      },
      {
        uuid: 'btDP8DmoRRyEQjbrh_GejA',
        appId: 'btDP8DmoRRyEQjbrh_GejA',
        createdBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
        createdAt: 1585629824559,
        lastUpdatedBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
        lastUpdatedAt: 1585629824559,
        name: 'dtffvdh',
        description: '',
        accountId: '1234_accountId',
        services: [],
        environments: [],
        setup: null,
        recentExecutions: null,
        notifications: null,
        nextDeploymentOn: 0,
        keywords: ['dtffvdh'],
        yamlGitConfig: null,
        defaults: {},
        sample: false,
        tagLinks: null
      },
      {
        uuid: 'ILuzww8BSkiJ_ZBWncjbIA',
        appId: 'ILuzww8BSkiJ_ZBWncjbIA',
        createdBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
        createdAt: 1585627825938,
        lastUpdatedBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
        lastUpdatedAt: 1585627825938,
        name: 'wqphndqafure',
        description: 'muhcrpkcycjm',
        accountId: '1234_accountId',
        services: [
          {
            uuid: 'urCx8dx-TrC5TWZzDPr4JA',
            appId: 'ILuzww8BSkiJ_ZBWncjbIA',
            createdBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
            createdAt: 1585627831526,
            lastUpdatedBy: {
              uuid: '6EZobE9ZSXagi2eMkcg7XA',
              name: 'Malya Regula',
              email: 'malyadri.regula@harness.io'
            },
            lastUpdatedAt: 1585627831526,
            name: 'efecfebcfg',
            description: 'dagbdgbeeh',
            artifactType: 'DOCKER',
            deploymentType: 'KUBERNETES',
            configMapYaml: null,
            helmValueYaml: null,
            version: 1,
            appContainer: null,
            configFiles: [],
            serviceVariables: [],
            artifactStreams: [],
            serviceCommands: [],
            lastDeploymentActivity: null,
            lastProdDeploymentActivity: null,
            setup: null,
            keywords: ['efecfebcfg', 'dagbdgbeeh', 'docker'],
            helmVersion: 'V2',
            accountId: '1234_accountId',
            artifactStreamIds: null,
            artifactStreamBindings: null,
            sample: false,
            tagLinks: null,
            deploymentTypeTemplateId: null,
            customDeploymentName: null,
            k8sV2: true,
            pcfV2: false
          },
          {
            uuid: 'lA6tt7vLT4SbWsKRl3oknQ',
            appId: 'ILuzww8BSkiJ_ZBWncjbIA',
            createdBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
            createdAt: 1585627826830,
            lastUpdatedBy: {
              uuid: '6EZobE9ZSXagi2eMkcg7XA',
              name: 'Malya Regula',
              email: 'malyadri.regula@harness.io'
            },
            lastUpdatedAt: 1585627826830,
            name: 'chchchdeff',
            description: 'efbhgeffdg',
            artifactType: 'DOCKER',
            deploymentType: 'KUBERNETES',
            configMapYaml: null,
            helmValueYaml: null,
            version: 1,
            appContainer: null,
            configFiles: [],
            serviceVariables: [],
            artifactStreams: [],
            serviceCommands: [],
            lastDeploymentActivity: null,
            lastProdDeploymentActivity: null,
            setup: null,
            keywords: ['efbhgeffdg', 'chchchdeff', 'docker'],
            helmVersion: 'V2',
            accountId: '1234_accountId',
            artifactStreamIds: null,
            artifactStreamBindings: null,
            sample: false,
            tagLinks: null,
            deploymentTypeTemplateId: null,
            customDeploymentName: null,
            k8sV2: true,
            pcfV2: false
          }
        ],
        environments: [],
        setup: null,
        recentExecutions: null,
        notifications: null,
        nextDeploymentOn: 0,
        keywords: ['wqphndqafure', 'muhcrpkcycjm'],
        yamlGitConfig: null,
        defaults: {},
        sample: false,
        tagLinks: null
      },
      {
        uuid: '6tfA7tQ0TKGveUbpyp6F7g',
        appId: '6tfA7tQ0TKGveUbpyp6F7g',
        createdBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
        createdAt: 1585563117929,
        lastUpdatedBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
        lastUpdatedAt: 1585563117929,
        name: 'cdcfrerfc',
        description: '',
        accountId: '1234_accountId',
        services: [
          {
            uuid: 'zcHH9SCbRlycH9LjzRbMxw',
            appId: '6tfA7tQ0TKGveUbpyp6F7g',
            createdBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
            createdAt: 1585563136798,
            lastUpdatedBy: {
              uuid: '6EZobE9ZSXagi2eMkcg7XA',
              name: 'Malya Regula',
              email: 'malyadri.regula@harness.io'
            },
            lastUpdatedAt: 1585563136799,
            name: 'drssfccffc',
            description: null,
            artifactType: 'AWS_CODEDEPLOY',
            deploymentType: 'AWS_CODEDEPLOY',
            configMapYaml: null,
            helmValueYaml: null,
            version: 1,
            appContainer: null,
            configFiles: [],
            serviceVariables: [],
            artifactStreams: [],
            serviceCommands: [],
            lastDeploymentActivity: null,
            lastProdDeploymentActivity: null,
            setup: null,
            keywords: ['aws_codedeploy', 'drssfccffc'],
            helmVersion: null,
            accountId: '1234_accountId',
            artifactStreamIds: null,
            artifactStreamBindings: null,
            sample: false,
            tagLinks: null,
            deploymentTypeTemplateId: null,
            customDeploymentName: null,
            k8sV2: false,
            pcfV2: false
          }
        ],
        environments: [],
        setup: null,
        recentExecutions: null,
        notifications: null,
        nextDeploymentOn: 0,
        keywords: ['cdcfrerfc'],
        yamlGitConfig: null,
        defaults: {},
        sample: false,
        tagLinks: null
      },
      {
        uuid: 'bgHlc-5pSn2Y0XTXtx_PjQ',
        appId: 'bgHlc-5pSn2Y0XTXtx_PjQ',
        createdBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
        createdAt: 1585552746358,
        lastUpdatedBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
        lastUpdatedAt: 1585552746358,
        name: 'sdvsdd',
        description: '',
        accountId: '1234_accountId',
        services: [
          {
            uuid: 'UpsI37IoRWS_XBP1fema3g',
            appId: 'bgHlc-5pSn2Y0XTXtx_PjQ',
            createdBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
            createdAt: 1585552769431,
            lastUpdatedBy: {
              uuid: '6EZobE9ZSXagi2eMkcg7XA',
              name: 'Malya Regula',
              email: 'malyadri.regula@harness.io'
            },
            lastUpdatedAt: 1585552769431,
            name: 'xvdfdfdfd',
            description: null,
            artifactType: 'DOCKER',
            deploymentType: 'KUBERNETES',
            configMapYaml: null,
            helmValueYaml: null,
            version: 1,
            appContainer: null,
            configFiles: [],
            serviceVariables: [],
            artifactStreams: [],
            serviceCommands: [],
            lastDeploymentActivity: null,
            lastProdDeploymentActivity: null,
            setup: null,
            keywords: ['xvdfdfdfd', 'docker'],
            helmVersion: 'V2',
            accountId: '1234_accountId',
            artifactStreamIds: null,
            artifactStreamBindings: null,
            sample: false,
            tagLinks: null,
            deploymentTypeTemplateId: null,
            customDeploymentName: null,
            k8sV2: true,
            pcfV2: false
          }
        ],
        environments: [],
        setup: null,
        recentExecutions: null,
        notifications: null,
        nextDeploymentOn: 0,
        keywords: ['sdvsdd'],
        yamlGitConfig: null,
        defaults: {},
        sample: false,
        tagLinks: null
      },
      {
        uuid: 'VpkyA60-QwiSvsY_NJMLpw',
        appId: 'VpkyA60-QwiSvsY_NJMLpw',
        createdBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
        createdAt: 1585552652945,
        lastUpdatedBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
        lastUpdatedAt: 1585552652945,
        name: 'dvgzcudacewc',
        description: 'zgabxxdcvpdf',
        accountId: '1234_accountId',
        services: [
          {
            uuid: 'h6CFx0t4TJWnrWGvrp9Z_Q',
            appId: 'VpkyA60-QwiSvsY_NJMLpw',
            createdBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
            createdAt: 1585552664709,
            lastUpdatedBy: {
              uuid: '6EZobE9ZSXagi2eMkcg7XA',
              name: 'Malya Regula',
              email: 'malyadri.regula@harness.io'
            },
            lastUpdatedAt: 1585552664709,
            name: 'daadeehhec',
            description: 'gfagfhgafe',
            artifactType: 'DOCKER',
            deploymentType: 'KUBERNETES',
            configMapYaml: null,
            helmValueYaml: null,
            version: 1,
            appContainer: null,
            configFiles: [],
            serviceVariables: [],
            artifactStreams: [],
            serviceCommands: [],
            lastDeploymentActivity: null,
            lastProdDeploymentActivity: null,
            setup: null,
            keywords: ['daadeehhec', 'gfagfhgafe', 'docker'],
            helmVersion: 'V2',
            accountId: '1234_accountId',
            artifactStreamIds: null,
            artifactStreamBindings: null,
            sample: false,
            tagLinks: null,
            deploymentTypeTemplateId: null,
            customDeploymentName: null,
            k8sV2: true,
            pcfV2: false
          },
          {
            uuid: 'oT4jIE1-SkijpE9VgXK4xQ',
            appId: 'VpkyA60-QwiSvsY_NJMLpw',
            createdBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
            createdAt: 1585552657052,
            lastUpdatedBy: {
              uuid: '6EZobE9ZSXagi2eMkcg7XA',
              name: 'Malya Regula',
              email: 'malyadri.regula@harness.io'
            },
            lastUpdatedAt: 1585552657052,
            name: 'badbeffahg',
            description: 'gcggcceabe',
            artifactType: 'DOCKER',
            deploymentType: 'KUBERNETES',
            configMapYaml: null,
            helmValueYaml: null,
            version: 1,
            appContainer: null,
            configFiles: [],
            serviceVariables: [],
            artifactStreams: [],
            serviceCommands: [],
            lastDeploymentActivity: null,
            lastProdDeploymentActivity: null,
            setup: null,
            keywords: ['badbeffahg', 'gcggcceabe', 'docker'],
            helmVersion: 'V2',
            accountId: '1234_accountId',
            artifactStreamIds: null,
            artifactStreamBindings: null,
            sample: false,
            tagLinks: null,
            deploymentTypeTemplateId: null,
            customDeploymentName: null,
            k8sV2: true,
            pcfV2: false
          }
        ],
        environments: [
          {
            uuid: 'iBYWclSIRIuhqrIyrq_zbQ',
            appId: 'VpkyA60-QwiSvsY_NJMLpw',
            createdBy: { uuid: '6EZobE9ZSXagi2eMkcg7XA', name: 'Malya Regula', email: 'malyadri.regula@harness.io' },
            createdAt: 1585552672669,
            lastUpdatedBy: {
              uuid: '6EZobE9ZSXagi2eMkcg7XA',
              name: 'Malya Regula',
              email: 'malyadri.regula@harness.io'
            },
            lastUpdatedAt: 1585552672669,
            name: 'pmjqkpionm',
            description: 'konjiqqmmk',
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
            keywords: ['prod', 'konjiqqmmk', 'pmjqkpionm'],
            accountId: '1234_accountId',
            sample: false,
            tagLinks: null
          }
        ],
        setup: null,
        recentExecutions: null,
        notifications: null,
        nextDeploymentOn: 0,
        keywords: ['zgabxxdcvpdf', 'dvgzcudacewc'],
        yamlGitConfig: null,
        defaults: {},
        sample: false,
        tagLinks: null
      }
    ],
    total: 57,
    currentPage: 1,
    empty: false,
    pageSize: 9,
    or: false
  },
  responseMessages: []
}

jest.mock('@cv/components/TableFilter/TableFilter', () => ({
  ...(jest.requireActual('@cv/components/TableFilter/TableFilter') as object),
  TableFilter: function MockComponent(props: any) {
    return <Container className="filterComponent" onClick={() => props.onFilter('mockFilter')} />
  }
}))

describe('SelectApplication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('render', async () => {
    const { container, getByText } = render(
      <MemoryRouter>
        <TestWrapper>
          <SelectApplication
            onPrevious={jest.fn()}
            mockData={{ data: mockData as any, loading: false }}
            stepData={{ applications: { '1324_appId': 'appName' } }}
          />
        </TestWrapper>
      </MemoryRouter>
    )
    expect(getByText('HARNESS FIRSTGEN APPLICATION')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('Ensure that when api returns error, error state is renderde', async () => {
    const useGetListApplicationsSpy = jest.spyOn(portalService, 'useGetListApplications')
    useGetListApplicationsSpy.mockReturnValue({
      error: { message: 'mockErrorMessage' }
    } as UseGetReturn<any, any, any, any>)

    const { container, getByText } = render(
      <MemoryRouter>
        <TestWrapper>
          <SelectApplication
            onPrevious={jest.fn()}
            mockData={{ data: mockData as any, loading: false }}
            stepData={{ applications: { '1324_appId': 'appName' } }}
          />
        </TestWrapper>
      </MemoryRouter>
    )

    await waitFor(() => expect(container.querySelector('[class*="loadingErrorNoData"]')).not.toBeNull())
    getByText('mockErrorMessage')
  })

  test('Ensure that when no data is returned, no data state is rendered', async () => {
    const useGetListApplicationsSpy = jest.spyOn(portalService, 'useGetListApplications')
    useGetListApplicationsSpy.mockReturnValue({
      data: {}
    } as UseGetReturn<any, any, any, any>)

    const { container } = render(
      <MemoryRouter>
        <TestWrapper>
          <SelectApplication
            onPrevious={jest.fn()}
            mockData={{ data: mockData as any, loading: false }}
            stepData={{ applications: { '1324_appId': 'appName' } }}
          />
        </TestWrapper>
      </MemoryRouter>
    )

    await waitFor(() => expect(container.querySelector('[class*="loadingErrorNoData"]')).not.toBeNull())
  })

  test('Ensure that when filter is applied api is called with set filter', async () => {
    const useGetListApplicationsSpy = jest.spyOn(portalService, 'useGetListApplications')
    useGetListApplicationsSpy.mockReturnValue({
      data: MockData
    } as UseGetReturn<any, any, any, any>)

    const { container } = render(
      <MemoryRouter>
        <TestWrapper>
          <SelectApplication
            onPrevious={jest.fn()}
            mockData={{ data: mockData as any, loading: false }}
            stepData={{ applications: { '1324_appId': 'appName' } }}
          />
        </TestWrapper>
      </MemoryRouter>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    const filterComponent = container.querySelector('.filterComponent')
    if (!filterComponent) {
      throw Error('Filter component was not rendered.')
    }

    fireEvent.click(filterComponent)
    await waitFor(() => expect(useGetListApplicationsSpy).toHaveBeenCalledTimes(3))
  })

  test('Ensure that click on a row selects the row and clicking on second page makes api call', async () => {
    const useGetListApplicationsSpy = jest.spyOn(portalService, 'useGetListApplications')
    useGetListApplicationsSpy.mockReturnValue({
      data: MockData
    } as UseGetReturn<any, any, any, any>)
    const onSubmitMock = jest.fn()

    const { container, getByText } = render(
      <MemoryRouter>
        <TestWrapper>
          <SelectApplication
            onPrevious={jest.fn()}
            onSubmit={onSubmitMock}
            mockData={{ data: mockData as any, loading: false }}
            stepData={{ applications: { '1324_appId': 'appName' } }}
          />
        </TestWrapper>
      </MemoryRouter>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    const secondButton = container.querySelectorAll('[class*="Pagination"] button[type="button"]')
    if (!secondButton) {
      throw Error('Pagination buttons were not rendered.')
    }

    fireEvent.click(secondButton[1])
    await waitFor(() => expect(useGetListApplicationsSpy).toHaveBeenCalledTimes(3))

    const tableRows = container.querySelectorAll('[role="row"]')
    expect(tableRows.length).toBe(10)
    fireEvent.click(tableRows[1])

    await waitFor(() => expect(tableRows[1].querySelector('input[checked=""]')).not.toBeNull())

    fireEvent.click(getByText('Next'))
    await waitFor(() =>
      expect(onSubmitMock).toHaveBeenCalledWith({
        applications: {
          '1234_appId': 'Nemanja App',
          '1324_appId': 'appName'
        }
      })
    )
  })

  test('Ensure validation message is displayed when no apps are selected', async () => {
    const useGetListApplicationsSpy = jest.spyOn(portalService, 'useGetListApplications')
    useGetListApplicationsSpy.mockReturnValue({
      data: MockData
    } as UseGetReturn<any, any, any, any>)
    const onSubmitMock = jest.fn()

    const { container, getByText } = render(
      <MemoryRouter>
        <TestWrapper>
          <SelectApplication
            onPrevious={jest.fn()}
            onSubmit={onSubmitMock}
            mockData={{ data: mockData as any, loading: false }}
            stepData={{}}
          />
        </TestWrapper>
      </MemoryRouter>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    const submitButton = container.querySelector('button[type="submit"]')
    if (!submitButton) {
      throw Error('Submit button was not rendered.')
    }

    fireEvent.click(submitButton)
    await waitFor(() => expect(getByText('At least one application must be selected.')))
  })
})
