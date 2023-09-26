import type { AlternativeType } from './app/types/types';

declare global {
  namespace Cypress {
    interface Chainable {
      //   drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      //   dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      //   visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>

      // cypress/support/commands.ts
      getBySel(
        dataTestAttribute: string,
        args?: any
      ): Chainable<JQuery<HTMLElement>>;
      getByExtendedSel(
        dataTestAttribute: string,
        extension: string,
        args?: any
      ): Chainable<JQuery<HTMLElement>>;
      waitForJs(): Chainable<void>;
      login(username: string, password: string): Chainable<Element>;
      loginAsUser(): Chainable<Element>;
      loginAsModerator(): Chainable<Element>;
      loginAsAdmin(): Chainable<Element>;
      ensurePriorityOrder(alternatives: AlternativeType[]): Chainable<Element>;
      ensureConfirmationOrder(
        alternatives: AlternativeType[]
      ): Chainable<Element>;
    }
  }
}
