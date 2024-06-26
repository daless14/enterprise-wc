import AxeBuilder from '@axe-core/playwright';
import percySnapshot from '@percy/playwright';
import { Locator, expect } from '@playwright/test';
import { test } from '../base-fixture';

import IdsDropdown from '../../src/components/ids-dropdown/ids-dropdown';

test.describe('IdsDropdown tests', () => {
  const url = '/ids-dropdown/example.html';

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  test.describe('general page checks', () => {
    test('should have a title', async ({ page }) => {
      await expect(page).toHaveTitle('IDS Dropdown Component');
    });

    test('should not have errors', async ({ page, browserName }) => {
      if (browserName === 'firefox') return;
      let exceptions = null;
      await page.on('pageerror', (error) => {
        exceptions = error;
      });

      await page.goto(url);
      await page.waitForLoadState();
      await expect(exceptions).toBeNull();
    });
  });

  test.describe('accessibility tests', () => {
    test('should pass an Axe scan', async ({ page, browserName }) => {
      if (browserName !== 'chromium') return;
      const accessibilityScanResults = await new AxeBuilder({ page } as any)
        .exclude('[disabled]') // Disabled elements do not have to pass
        .analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('snapshot tests', () => {
    test('should match innerHTML snapshot', async ({ page, browserName }) => {
      if (browserName !== 'chromium') return;
      const html = await page.evaluate(() => {
        const elem = document.querySelector('ids-dropdown')!;
        elem.shadowRoot?.querySelector('style')?.remove();
        return elem?.outerHTML;
      });
      await expect(html).toMatchSnapshot('dropdown-html');
    });

    test('should match shadowRoot snapshot', async ({ page, browserName }) => {
      if (browserName !== 'chromium') return;
      const html = await page.evaluate(() => {
        const elem = document.querySelector('ids-dropdown')!;
        elem.shadowRoot?.querySelector('style')?.remove();
        return elem.shadowRoot?.innerHTML;
      });
      await expect(html).toMatchSnapshot('dropdown-shadow');
    });

    test('should match the visual snapshot in percy', async ({ page, browserName }) => {
      if (browserName !== 'chromium') return;
      await percySnapshot(page, 'ids-dropdown-light');
    });

    test('should match the visual snapshot in percy (in a modal)', async ({ page, browserName }) => {
      if (browserName !== 'chromium') return;
      await page.goto('/ids-dropdown/in-modal.html');
      await page.locator('#modal-trigger-btn').click();
      await page.locator('ids-dropdown').nth(2).click();
      await percySnapshot(page, 'ids-dropdown-modal-light');
    });

    test('should match the visual snapshot in percy (in a popup)', async ({ page, browserName }) => {
      if (browserName !== 'chromium') return;
      await page.goto('/ids-dropdown/in-popup.html');
      await page.locator('#popup-trigger-btn').click();
      await page.locator('ids-dropdown').nth(1).click();
      await page.waitForSelector('ids-popup[visible]');
      await percySnapshot(page, 'ids-dropdown-popup-light');
    });
  });

  test.describe('event tests', () => {
    test('should fire a change event', async ({ page }) => {
      const eventFiredCount = await page.evaluate(() => {
        let changeCount = 0;
        const dropdown = document.querySelector('ids-dropdown') as IdsDropdown;
        dropdown?.addEventListener('change', () => { changeCount++; });
        dropdown.value = 'hi';
        return changeCount;
      });

      expect(eventFiredCount).toEqual(1);
    });

    test('should fire an input event', async ({ page }) => {
      const eventFiredCount = await page.evaluate(() => {
        let changeCount = 0;
        const dropdown = document.querySelector('ids-dropdown') as IdsDropdown;
        dropdown?.addEventListener('input', () => { changeCount++; });
        dropdown.value = 'hi';
        return changeCount;
      });

      expect(eventFiredCount).toEqual(1);
    });
  });

  test.describe('functionality tests', () => {
    test('renders with empty container', async ({ page }) => {
      const exists = await page.evaluate(() => {
        document.body.insertAdjacentHTML('beforeend', `<ids-dropdown id="dropdown-test-1" label="Normal Dropdown"></ids-dropdown>`);
        const dropdown = document.querySelector<IdsDropdown>('#dropdown-test-1')!;
        return dropdown?.container !== undefined;
      });
      await expect(exists).toBe(true);
    });

    test('can set the placeholder attribute', async ({ page }) => {
      const value = await page.evaluate(() => {
        const dropdown = document.querySelector<IdsDropdown>('ids-dropdown')!;
        dropdown.placeholder = 'select an item';
        return dropdown.input!.placeholder;
      });
      expect(value).toBe('select an item');

      const value2 = await page.evaluate(() => {
        const dropdown = document.querySelector<IdsDropdown>('ids-dropdown')!;
        dropdown.placeholder = '';
        return dropdown.input!.placeholder;
      });
      expect(value2).toBe(null);
    });

    test('can set the readonly attribute', async ({ page }) => {
      const isReadonly = await page.evaluate(() => {
        const dropdown = document.querySelector<IdsDropdown>('ids-dropdown')!;
        dropdown.readonly = true;
        return dropdown?.readonly;
      });
      expect(isReadonly).toBeTruthy();
      expect(await page.locator('ids-dropdown').first().getAttribute('readonly')).toBeTruthy();

      const isReadonly2 = await page.evaluate(() => {
        const dropdown = document.querySelector<IdsDropdown>('ids-dropdown')!;
        dropdown.readonly = false;
        return dropdown?.readonly;
      });
      expect(isReadonly2).toBeFalsy();
      expect(await page.locator('ids-dropdown').first().getAttribute('readonly')).toBeFalsy();

      const isReadonly3 = await page.evaluate(() => {
        const dropdown = document.querySelector<IdsDropdown>('ids-dropdown')!;
        dropdown.setAttribute('readonly', 'true');
        return dropdown?.readonly;
      });
      expect(isReadonly3).toBeTruthy();
      expect(await page.locator('ids-dropdown').first().getAttribute('readonly')).toBeTruthy();

      const isReadonly4 = await page.evaluate(() => {
        const dropdown = document.querySelector<IdsDropdown>('ids-dropdown')!;
        dropdown.setAttribute('readonly', 'false');
        return dropdown?.readonly;
      });
      expect(isReadonly4).toBeFalsy();
      expect(await page.locator('ids-dropdown').first().getAttribute('readonly')).toBeFalsy();
    });

    test('can set the disabled attribute', async ({ page }) => {
      const isDisabled = await page.evaluate(() => {
        const dropdown = document.querySelector<IdsDropdown>('ids-dropdown')!;
        dropdown.disabled = true;
        return dropdown?.disabled;
      });
      expect(isDisabled).toBeTruthy();
      expect(await page.locator('ids-dropdown').first().getAttribute('disabled')).toBeTruthy();

      const isDisabled2 = await page.evaluate(() => {
        const dropdown = document.querySelector<IdsDropdown>('ids-dropdown')!;
        dropdown.disabled = false;
        return dropdown?.disabled;
      });
      expect(isDisabled2).toBeFalsy();
      expect(await page.locator('ids-dropdown').first().getAttribute('disabled')).toBeFalsy();

      const isDisabled3 = await page.evaluate(() => {
        const dropdown = document.querySelector<IdsDropdown>('ids-dropdown')!;
        dropdown.setAttribute('disabled', 'true');
        return dropdown?.disabled;
      });
      expect(isDisabled3).toBeTruthy();
      expect(await page.locator('ids-dropdown').first().getAttribute('disabled')).toBeTruthy();

      const isDisabled4 = await page.evaluate(() => {
        const dropdown = document.querySelector<IdsDropdown>('ids-dropdown')!;
        dropdown.setAttribute('disabled', 'false');
        return dropdown?.disabled;
      });
      expect(isDisabled4).toBeFalsy();
      expect(await page.locator('ids-dropdown').first().getAttribute('disabled')).toBeFalsy();
    });

    test('can set allow blank', async ({ page }) => {
      const values = await page.evaluate(() => {
        const dropdown = document.querySelector<IdsDropdown>('ids-dropdown')!;
        dropdown.allowBlank = true;
        dropdown.value = 'blank';
        return [dropdown?.allowBlank, dropdown.value];
      });

      expect(values[0]).toBeTruthy();
      expect(values[1]).toEqual('blank');

      const values2 = await page.evaluate(() => {
        const dropdown = document.querySelector<IdsDropdown>('ids-dropdown')!;
        dropdown.allowBlank = false;
        return [dropdown?.allowBlank, dropdown.value];
      });
      expect(values2[0]).toBeFalsy();
      expect(values2[1]).toBeNull();
    });

    test('can have blank value=""', async ({ page }) => {
      const values = await page.evaluate(() => {
        const dropdown = document.querySelector<IdsDropdown>('ids-dropdown#dropdown-9')!;
        return [dropdown?.allowBlank, dropdown.value];
      });

      const [allowBlank, value] = values;
      expect(allowBlank).toBeFalsy();
      expect(value).toEqual(null);

      const newValue = await page.evaluate(() => {
        const dropdown = document.querySelector<IdsDropdown>('ids-dropdown#dropdown-9')!;
        dropdown.options[2].click();
        return dropdown.value;
      });

      expect(newValue).toBe('opt2');

      const blankValue = await page.evaluate(() => {
        const dropdown = document.querySelector<IdsDropdown>('ids-dropdown#dropdown-9')!;
        dropdown.options[0].click();
        return dropdown.value;
      });

      expect(blankValue).toEqual('');
    });

    test('can view tooltips on dropdown and options', async ({ page }) => {
      const dropdownLocator: Locator = await page.locator('#dropdown-6');

      // Check tooltip for dropdown
      await dropdownLocator.hover();
      await expect(await page.locator('ids-tooltip')).toBeAttached();
      await dropdownLocator.blur();

      // Check tooltip for dropdown option
      await dropdownLocator.locator('ids-trigger-button').click();
      const dropdownFirstOptionLocator: Locator = await page.locator('#dropdown-6 ids-list-box ids-list-box-option').first();
      await dropdownFirstOptionLocator.hover();
      await expect(await page.locator('ids-tooltip')).toBeAttached();
      await dropdownFirstOptionLocator.blur();

      // Check tooltip for lazy loaded dropdown option
      await page.evaluate(() => {
        const asyncTooltipDropdown = document.createElement('ids-dropdown');
        asyncTooltipDropdown.id = 'dropdown-async-tooltips';
        asyncTooltipDropdown.innerHTML = '<ids-list-box></ids-list-box>';
        (asyncTooltipDropdown as IdsDropdown).beforeShow = async function beforeShow() {
          return new Promise((resolve) => {
            resolve([
              {
                value: 'opt1',
                label: 'Option One',
                tooltip: 'Additional Info on Option One'
              }
            ]);
          });
        };

        const lastDropdown = document.querySelector('ids-dropdown:last-of-type');
        lastDropdown?.after(asyncTooltipDropdown);
      });

      const asyncDropdownLocator: Locator = await page.locator('#dropdown-async-tooltips');
      await asyncDropdownLocator.locator('ids-trigger-button').click();
      const asyncDropdownFirstOptionLocator: Locator = await page.locator('#dropdown-async-tooltips ids-list-box ids-list-box-option').first();
      await asyncDropdownFirstOptionLocator.hover();
      await expect(await page.locator('ids-tooltip')).toBeAttached();
    });
  });

  test.describe('reattachment tests', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/ids-dropdown/reattach.html');
    });

    test('popup functionality after reattachment', async ({ page }) => {
      // reattach
      await page.locator('ids-button#reattach').click();

      // open dropdown
      await page.locator('ids-dropdown').click();

      // select another option
      await page.locator('ids-list-box-option[value="opt4"]').click();

      // expect new value to be selected and dropdown list to be hidden
      const selected = await page.locator('ids-dropdown').evaluate((dropdown: IdsDropdown) => dropdown.value);
      await expect(await page.locator('ids-dropdown ids-dropdown-list')).not.toBeVisible();
      expect(selected).toEqual('opt4');
    });
  });
});
