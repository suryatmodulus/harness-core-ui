const gitSyncEnabledCall =
  '/ng/api/git-sync/git-sync-enabled?accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
const pipelineSaveCall =
  '/pipeline/api/pipelines?accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default'
const gitSyncMetaCall =
  '/ng/api/git-sync?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
const gitSyncBranchCall =
  '/ng/api/git-sync-branch/listBranchesWithStatus?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&yamlGitConfigIdentifier=&page=0&size=20&searchTerm='

describe('GIT SYNC DISABLED', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.intercept('GET', gitSyncEnabledCall, { connectivityMode: null, gitSyncEnabled: false })
    cy.login('test', 'test')

    cy.visitCreatePipeline()

    cy.fillName('testPipeline_Cypress')

    cy.clickSubmit()

    cy.get('[icon="plus"]').click()
    cy.findByTestId('stage-Deployment').click()

    cy.fillName('testStage_Cypress')
    cy.clickSubmit()
  })

  it('should display the error returned by pipeline save API', () => {
    cy.intercept('POST', pipelineSaveCall, { fixture: 'pipeline/api/pipelines.post' })
    cy.contains('span', 'New Service').click()

    cy.fillName('testService')
    cy.get('[data-id="service-save"]').click()

    cy.contains('span', 'Service created successfully').should('be.visible')

    cy.get('[value="testService"]').should('be.visible')

    cy.contains('span', '+ Add Variable').click()
    cy.fillName('testVariable')
    cy.findByTestId('addVariableSave').click()

    cy.get('[name="variables[0].value"]').type('varvalue')

    cy.contains('span', 'Next').click()

    cy.contains('span', 'New Environment').click()
    cy.fillName('testEnv')
    cy.contains('p', 'Production').click()
    cy.get('[data-id="environment-save"]').click()

    cy.contains('span', 'Environment created successfully').should('be.visible')

    cy.get('[value="testEnv"]').should('be.visible')

    cy.get('[data-name="toggle-option-two"]').click()

    // Enable YAML editing
    cy.contains('span', 'Edit Yaml').click({ force: true })

    cy.get('[data-name="toggle-option-one"]').click()

    // try to save the pipleine, the mock data has error
    cy.contains('span', 'Save').click({ force: true })

    cy.contains(
      'span',
      'Invalid yaml: $.pipeline.stages[0].stage.spec.execution: is missing but it is required'
    ).should('be.visible')
  })

  it('should display the success message if pipeline save is success', () => {
    cy.intercept('POST', pipelineSaveCall, { fixture: 'pipeline/api/pipelines.postsuccess' })

    cy.contains('span', 'Save').click({ force: true })
    cy.contains('span', 'Pipeline published successfully').should('be.visible')
  })
})

describe('GIT SYNC ENABLED', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.intercept('GET', gitSyncEnabledCall, { connectivityMode: null, gitSyncEnabled: true })
    cy.intercept('POST', pipelineSaveCall, { fixture: 'pipeline/api/pipelines.postsuccess' })

    cy.intercept('GET', gitSyncMetaCall, { fixture: 'ng/api/git-sync' })
    cy.intercept('GET', gitSyncBranchCall, { fixture: 'ng/api/git-sync-branches' })
    cy.login('test', 'test')

    cy.visitCreatePipeline()

    cy.fillName('testPipeline_Cypress')

    cy.clickSubmit()

    cy.get('[icon="plus"]').click()
    cy.findByTestId('stage-Deployment').click()

    cy.fillName('testStage_Cypress')
    cy.clickSubmit()
  })

  it('should display the git sync dialog on save', () => {
    // open the sav confirmation dialog
    cy.contains('span', 'Save').click({ force: true })
    cy.contains(
      'p',
      'We don’t have your git credentials for the selected folder. Please update the credentials in user profile.'
    ).should('be.visible')
  })
})
