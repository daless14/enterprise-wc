/**
 * @jest-environment jsdom
 */
// eslint-disable-next-line
import MutationObserver from '../__mocks__/MutationObserver';
import IdsTabs, { IdsTab } from '../../src/ids-tabs';
import IdsText from '../../src/ids-text/ids-text';

const processAnimFrame = () => new Promise((resolve) => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => { resolve(); });
  });
});

const DEFAULT_TABS_HTML = (
  `<ids-tabs value="hello">
    <ids-tab value="hello">Hello</ids-tab>
    <ids-tab value="world">World</ids-tab>
    <ids-tab value="can">Can</ids-tab>
    <ids-tab value="uhearme">You Hear Me?</ids-tab>
  </ids-tabs>`
);

describe('IdsTabs Tests', () => {
  let elem;

  /**
   * scans through to find all ids-tab elements in an
   * ids-tabs instance and verifies all "selected"
   * attribs make sense based on value of tabs/values
   *
   * @returns {boolean} whether or not there were issues
   */
  function areTabSelectionAttribsValid() {
    let isValidState = true;
    let selectionCount = 0;

    for (const tabEl of [...elem.children]) {
      const isTabSelected = tabEl.value === elem.value;
      const isTabMarkedSelected = Boolean(tabEl.selected);

      if (isTabMarkedSelected) {
        selectionCount++;
      }

      if (isTabMarkedSelected !== isTabSelected) {
        isValidState = false;
      }
    }

    if (selectionCount > 1 || selectionCount === 0) {
      isValidState = false;
    }

    return isValidState;
  }

  const createElemViaTemplate = async (innerHTML) => {
    elem?.remove?.();

    const template = document.createElement('template');
    template.innerHTML = innerHTML;
    elem = template.content.childNodes[0];
    document.body.appendChild(elem);

    await processAnimFrame();

    return elem;
  };

  afterEach(async () => {
    elem?.remove();
  });

  it('renders from HTML Template with no errors', async () => {
    elem = await createElemViaTemplate(DEFAULT_TABS_HTML);

    const errors = jest.spyOn(global.console, 'error');
    expect(document.querySelectorAll('ids-tabs').length).toEqual(1);
    expect(errors).not.toHaveBeenCalled();
  });

  it('renders correctly', async () => {
    elem = await createElemViaTemplate(DEFAULT_TABS_HTML);

    expect(elem.outerHTML).toMatchSnapshot();
  });

  it('renders with counts, and has no errors', async () => {
    const errors = jest.spyOn(global.console, 'error');

    elem = await createElemViaTemplate(
      `<ids-tabs>
        <ids-tab count="20">Pizzas</ids-tab>
        <ids-tab count="18">Diet Cokes</ids-tab>
        <ids-tab count="12">Ginger Ales</ids-tab>
      </ids-tabs>`
    );
    expect(elem.outerHTML).toMatchSnapshot();
    expect(errors).not.toHaveBeenCalled();
  });

  it('renders with partial counts set, and triggers an error', async () => {
    const errors = jest.spyOn(global.console, 'error');

    await createElemViaTemplate(
      `<ids-tabs>
        <ids-tab count="20">Pizzas</ids-tab>
        <ids-tab count="18">Diet Cokes</ids-tab>
        <ids-tab>Ginger Ales?</ids-tab>
      </ids-tabs>`
    );

    expect(errors).toHaveBeenCalled();
  });

  it('removes a tab after rendering and does not break', async () => {
    const errors = jest.spyOn(global.console, 'error');
    elem = await createElemViaTemplate(DEFAULT_TABS_HTML);
    await processAnimFrame();

    elem.remove(elem.children[elem.children.length - 1]);
    await processAnimFrame();

    expect(errors).not.toHaveBeenCalled();
    expect(elem.outerHTML).toMatchSnapshot();
  });

  it('sets "selected" state of a tab directly, and does not '
  + 'trigger an error', async () => {
    elem = await createElemViaTemplate(DEFAULT_TABS_HTML);

    elem.children[1].selected = true;

    await processAnimFrame();
    const hasValidTabs = areTabSelectionAttribsValid(elem);

    expect(hasValidTabs).toEqual(true);
  });

  it('sets tabs to an invalid value and triggers an error', async () => {
    const errors = jest.spyOn(global.console, 'error');
    elem = await createElemViaTemplate(DEFAULT_TABS_HTML);
    await processAnimFrame();

    elem.value = 'random_value';
    await processAnimFrame();
    await processAnimFrame();

    const hasValidTabs = areTabSelectionAttribsValid(elem);

    expect(hasValidTabs).toEqual(false);
    expect(errors).toHaveBeenCalled();
  });

  it('changes content within a text node to fire a slotchange with no errors', async () => {
    elem = await createElemViaTemplate(DEFAULT_TABS_HTML);
    await processAnimFrame();

    const errors = jest.spyOn(global.console, 'error');
    elem.children[0].textContent = 'Its Over 9000';

    await processAnimFrame();

    expect(errors).not.toHaveBeenCalled();
    expect(elem.outerHTML).toMatchSnapshot();
  });

  it('changes value of ids-tab, and the "selected" attrib of every '
  + 'ids-tab listed is predictable', async () => {
    elem = await createElemViaTemplate(DEFAULT_TABS_HTML);
    await processAnimFrame();

    await Promise.all([...elem.children].map((tabEl) => async () => {
      elem.value = tabEl.getAttribute('value');
      await processAnimFrame();
      const isTabSelectionValid = areTabSelectionAttribsValid();
      expect(isTabSelectionValid).toEqual(true);
      expect(elem.outerHTML).toMatchSnapshot();
    }));
  });

  it('assigns an invalid count to a tab with counts, and triggers '
  + 'an error', async () => {
    const errors = jest.spyOn(global.console, 'error');

    await expect(createElemViaTemplate(
      `<ids-tabs value="eggs">
        <ids-tab count="z20" value="eggs">Eggs In a Basket</ids-tab>
        <ids-tab count="5" value="peas">Peas in a Pod</ids-tab>
      </ids-tabs>`
    ));

    await processAnimFrame();

    expect(errors).toHaveBeenCalled();
  });
});
