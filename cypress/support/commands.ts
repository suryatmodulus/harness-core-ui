// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import '@testing-library/cypress/add-commands'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(username: string, pass: string): void
      visitCreatePipeline(): void
      fillName(name: string): void
      clickSubmit(): void
      fillField(fieldName: string, value: string): void
    }
  }
}

Cypress.Commands.add('login', (emailValue, password) => {
  const email = cy.get('[data-id="email-0"] input')
  email.clear()
  email.type(emailValue)

  const pass = cy.get('[data-id="password-1"] input')
  pass.clear()
  pass.type(password)

  cy.get('[type="submit"]').click()
})

Cypress.Commands.add('visitCreatePipeline', () => {
  // cy.visit('#/account/accountId/cd/orgs/default/projects/project1/pipelines/-1/pipeline-studio/')
  cy.contains('p', 'Projects').click()
  cy.contains('p', 'Project 1').click()
  cy.contains('p', 'Delivery').click()
  cy.contains('p', 'Pipelines').click()
  cy.contains('span', 'Create a Pipeline').click()
})

Cypress.Commands.add('fillName', value => {
  cy.get('[name="name"]').type(value)
})

Cypress.Commands.add('clickSubmit', () => {
  cy.get('[type="submit"]').click()
})

Cypress.Commands.add('fillField', (fieldName, value) => {
  cy.get(`[name=${fieldName}]`).type(value)
})
