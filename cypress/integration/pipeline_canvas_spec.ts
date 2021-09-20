describe('Pipeline Canvas Spec - error on pipeline save', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', err => {
      // expect(err.message).to.include('Ignoring error for now')
      return false
    })
  })

  it('Without git sync - error on pipeline save', () => {
    cy.intercept(
      'GET',
      '/ng/api/git-sync/git-sync-enabled?accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1',
      { connectivityMode: null, gitSyncEnabled: false }
    )

    cy.intercept(
      'POST',
      '/pipeline/api/pipelines?accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default',
      { fixture: 'pipeline/api/pipelines.post' }
    )

    cy.visit('#/login')
    cy.login('test', 'test')

    cy.visitCreatePipeline()

    cy.fillName('testPipeline_Cypress')

    cy.clickSubmit()

    const addStageIcon = cy.get('[icon="plus"]')
    addStageIcon.click()

    const deployStage = cy.get('[data-testid="stage-Deployment"]')
    deployStage.click()

    cy.fillName('testStage_Cypress')
    cy.clickSubmit()

    cy.contains('span', 'New Service').click()

    cy.fillName('testService')
    const serviceSave = cy.get('[data-id="service-save"]')
    serviceSave.click()

    const serviceSuccessToaster = cy.contains('span', 'Service created successfully')
    expect(serviceSuccessToaster)

    const newlyAddedService = cy.get('[value="testService"]')
    expect(newlyAddedService)

    cy.contains('span', '+ Add Variable').click()
    cy.fillName('testVariable')
    cy.get('[data-test-id="addVariableSave"]').click()

    const variableValue = cy.get('[name="variables[0].value"]')
    variableValue.type('varvalue')

    cy.contains('span', 'Next').click()

    cy.contains('span', 'New Environment').click()
    cy.fillName('testEnv')
    cy.contains('p', 'Production').click()
    cy.get('[data-id="environment-save"]').click()

    const envSuccessToaster = cy.contains('span', 'Environment created successfully')
    expect(envSuccessToaster)

    const newlyAddedEnv = cy.get('[value="testEnv"]')
    expect(newlyAddedEnv)

    const yamlButton = cy.get('[data-name="yaml-btn"]')
    yamlButton.click()

    // Enable YAML editing
    cy.contains('span', 'Edit Yaml').click({ force: true })

    const visualBtn = cy.get('[data-name="visual-btn"]')
    visualBtn.click()

    // try to save the pipleine, the mock data has error
    cy.contains('span', 'Save').click({ force: true })

    const pipelineSaveErrorToaster = cy.contains(
      'span',
      'Invalid yaml: $.pipeline.stages[0].stage.spec.execution: is missing but it is required'
    )
    expect(pipelineSaveErrorToaster)
  })

  it('without git sync - success on pipeline save', () => {
    cy.intercept(
      'GET',
      '/ng/api/git-sync/git-sync-enabled?accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1',
      { connectivityMode: null, gitSyncEnabled: false }
    )

    cy.intercept(
      'POST',
      '/pipeline/api/pipelines?accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default',
      { fixture: 'pipeline/api/pipelines.postsuccess' }
    )

    cy.visit('#/login')
    cy.login('test', 'test')

    cy.visitCreatePipeline()

    cy.fillName('testPipeline_Cypress')

    cy.clickSubmit()

    const addStageIcon = cy.get('[icon="plus"]')
    addStageIcon.click()

    const deployStage = cy.get('[data-testid="stage-Deployment"]')
    deployStage.click()

    cy.fillName('testStage_Cypress')
    cy.clickSubmit()

    cy.contains('span', 'Save').click({ force: true })
    expect(cy.contains('span', 'Pipeline published successfully'))
  })

  it('Git sync enabled', () => {
    cy.intercept(
      'GET',
      '/ng/api/git-sync/git-sync-enabled?accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1',
      { connectivityMode: null, gitSyncEnabled: true }
    )
    cy.intercept(
      'GET',
      '/ng/api/git-sync?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1',
      { fixture: 'ng/api/git-sync' }
    )
    cy.intercept(
      'GET',
      '/ng/api/git-sync-branch/listBranchesWithStatus?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&yamlGitConfigIdentifier=&page=0&size=20&searchTerm=',
      { fixture: 'ng/api/git-sync-branches' }
    )

    cy.visit('#/login')
    cy.login('test', 'test')

    cy.visitCreatePipeline()

    cy.fillName('testPipeline_Cypress')

    cy.clickSubmit()

    const addStageIcon = cy.get('[icon="plus"]')
    addStageIcon.click()

    const deployStage = cy.get('[data-testid="stage-Deployment"]')
    deployStage.click()

    cy.fillName('testStage_Cypress')
    cy.clickSubmit()

    // open the sav confirmation dialog
    cy.contains('span', 'Save').click({ force: true })
    expect(
      cy.contains(
        'p',
        'We don’t have your git credentials for the selected folder. Please update the credentials in user profile.'
      )
    )
  })
})
