import { customElement, scss } from '../../core/ids-decorators';
import { attributes } from '../../core/ids-attributes';
import { stringToBool } from '../../utils/ids-string-utils/ids-string-utils';

import Base from './ids-dropdown-base';
import '../ids-trigger-field/ids-trigger-field';
import '../ids-trigger-field/ids-trigger-button';
import '../ids-input/ids-input';
import '../ids-popup/ids-popup';
import '../ids-list-box/ids-list-box';
import '../ids-text/ids-text';
import '../ids-icon/ids-icon';

import styles from './ids-dropdown.scss';

type IdsListBoxOption = {
  id?: string,
  label: string,
  value: string
};

type IdsListBoxOptions = Array<IdsListBoxOption>;

/**
 * IDS Dropdown Component
 * @type {IdsDropdown}
 * @inherits IdsElement
 * @mixes IdsDirtyTrackerMixin
 * @mixes IdsEventsMixin
 * @mixes IdsKeyboardMixin
 * @mixes IdsThemeMixin
 * @mixes IdsLocaleMixin
 * @mixes IdsPopupOpenEventsMixin
 * @mixes IdsValidationMixin
 * @mixes IdsTooltipMixin
 * @part dropdown - the tag element
 */
@customElement('ids-dropdown')
@scss(styles)
export default class IdsDropdown extends Base {
  constructor() {
    super();
    this.state = { selectedIndex: 0 };
  }

  /**
   * Invoked each time the custom element is appended into a document-connected element.
   */
  connectedCallback() {
    this.popup = this.container.querySelector('ids-popup');
    this.trigger = this.container.querySelector('ids-trigger-button');
    this.listBox = this.querySelector('ids-list-box');
    this.labelEl = this.input?.labelEl;

    this
      .#addAria()
      .#attachEventHandlers()
      .#attachKeyboardListeners();

    super.connectedCallback();
    this.#configurePopup();
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes() {
    return [
      ...super.attributes,
      attributes.ALLOW_BLANK,
      attributes.AUTOCOMPLETE,
      attributes.DISABLED,
      attributes.GROUP,
      attributes.LABEL,
      attributes.NO_MARGINS,
      attributes.READONLY,
      attributes.SIZE,
      attributes.VALUE
    ];
  }

  #optionsData: IdsListBoxOptions = [];

  /**
   * List of available color variants for this component
   * @returns {Array<string>}
   */
  colorVariants: Array<string> = ['alternate-formatter'];

  /**
   * Push color variant to the container element
   * @returns {void}
   */
  onColorVariantRefresh(): void {
    this.input.colorVariant = this.colorVariant;
  }

  /**
   * Push label-state to the container element
   * @returns {void}
   */
  onlabelStateChange(): void {
    this.input.labelState = this.labelState;
  }

  /**
   * Push field-height/compact to the container element
   * @param {string} val the new field height setting
   */
  onFieldHeightChange(val: string) {
    if (val) {
      const attr = val === 'compact' ? { name: 'compact', val: '' } : { name: 'field-height', val };
      this.input.setAttribute(attr.name, attr.val);
      this.listBox?.setAttribute(attr.name, attr.val);
    } else {
      this.input.removeAttribute('compact');
      this.input.removeAttribute('field-height');
      this.listBox?.removeAttribute('compact');
      this.listBox?.removeAttribute('field-height');
    }
  }

  /**
   * Create the Template for the contents
   * @returns {string} The template
   */
  template(): string {
    const colorVariant = this.colorVariant ? ` color-variant="${this.colorVariant}"` : '';
    const fieldHeight = this.fieldHeight ? ` field-height="${this.fieldHeight}"` : '';
    const labelState = this.labelState ? ` label-state="${this.labelState}"` : '';
    const compact = this.compact ? ' compact' : '';
    const noMargins = this.noMargins ? ' no-margins' : '';
    this.hasIcons = this.querySelector('ids-list-box-option ids-icon') !== null;

    return `
      <div class="ids-dropdown">
        <ids-trigger-field
          ${!this.autocomplete ? ' readonly="true"' : ''}
          ${this.disabled ? ' disabled="true"' : ''}
          ${this.readonly ? '' : ' readonly-background'}
          cursor="pointer"
          size="${this.size}"
          label="${this.label}"
          part="trigger-field"
          ${colorVariant}${fieldHeight}${compact}${noMargins}${labelState}

          ${this.validate ? ` validate="${this.validate}"` : ''}
          ${this.validate && this.validationEvents ? ` validation-events="${this.validationEvents}"` : ''}
        >
          <ids-trigger-button
            slot="trigger-end"
            part="trigger-button"
            tabbable="false"
            disabled="${this.disabled}"
          >
            <ids-text audible="true">Dropdown Button</ids-text>
            <ids-icon slot="icon" icon="dropdown" part="icon"></ids-icon>
          </ids-trigger-button>
        </ids-trigger-field>
      <ids-popup type="menu" part="popup">
        <slot slot="content">
        </slot>
      </ids-popup>
    </div>`;
  }

  /**
   * Add internal aria attributes
   * @private
   * @returns {object} This API object for chaining
   */
  #addAria() {
    const attrs: any = {
      role: 'combobox',
      'aria-expanded': 'false',
      'aria-autocomplete': 'list',
      'aria-haspopup': 'listbox',
      'aria-description': this.locale?.translate('PressDown'),
      'aria-controls': this.listBox?.getAttribute('id') || `ids-list-box-${this.id}`
    };

    if (this.listBox) {
      this.listBox.setAttribute('id', `ids-list-box-${this.id}`);
      this.listBox.setAttribute('aria-label', `Listbox`);
    }
    Object.keys(attrs).forEach((key: any) => this.setAttribute(key, attrs[key]));
    return this;
  }

  /**
   * Add internal aria attributes while open
   * @private
   * @returns {void}
   */
  #setAriaOnMenuOpen(): void {
    this.setAttribute('aria-expanded', 'true');

    // Add aria for the open state
    const selected = this.selectedOption || this.querySelector('ids-list-box-option');
    this.listBox?.setAttribute('tabindex', '0');
    this.listBox?.setAttribute('aria-activedescendant', selected?.id || this.selectedIndex);

    if (selected) {
      selected.classList.add('is-selected');
      selected.setAttribute('tabindex', '0');
      if (!this.autocomplete) {
        selected.focus();
      }
    }
  }

  /**
   * Add internal aria attributes while closed
   * @private
   * @returns {void}
   */
  #setAriaOnMenuClose() {
    this.setAttribute('aria-expanded', 'false');
    this.listBox?.removeAttribute('tabindex');

    const selected = this.selected;
    if (selected) {
      selected.classList.remove('is-selected');
      selected.setAttribute('tabindex', '-1');
      this.selectedOption?.classList.add('is-selected');
    }
  }

  get input() {
    return this.container.querySelector('ids-trigger-field');
  }

  /**
   * Set the `label` text
   * @param {string} value of the `label` text property
   */
  set label(value: string) {
    this.setAttribute('label', value);
    if (this.input) {
      this.input.label = value;
    }
  }

  get label(): string { return this.getAttribute('label'); }

  /**
   * Set the value of the dropdown using the value/id attribute if present
   * @param {string} value The value/id to use
   */
  set value(value: string) {
    const elem = this.querySelector(`ids-list-box-option[value="${value}"]`);

    if (!elem) {
      return;
    }
    this.#clearSelected();
    this.selectOption(elem);
    this.selectIcon(elem);
    this.selectTooltip(elem);
    this.input.value = (elem as any).textContent.trim();
    this.state.selectedIndex = [...(elem.parentElement as any).children].indexOf(elem);

    // Send the change event
    if (this.value === value) {
      this.triggerEvent('change', this, {
        bubbles: true,
        detail: {
          elem: this,
          value: this.value
        }
      });
    }
    this.setAttribute(attributes.VALUE, value);
  }

  get value(): string { return this.getAttribute(attributes.VALUE); }

  /**
   * Returns the selected Listbox option based on the Dropdown's value.
   * @returns {HTMLElement| null} the selected option
   */
  get selectedOption(): HTMLElement | null {
    return this.querySelector(`ids-list-box-option[value="${this.value}"]`);
  }

  /**
   * Returns the currently-selected Listbox option
   * (may be different from the Dropdown's value because of user input)
   * @readonly
   * @returns {HTMLElement|null} Reference to a selected Listbox option if one is present
   */
  get selected(): HTMLElement | null {
    return this.querySelector('ids-list-box-option.is-selected');
  }

  /**
   * Set the selected option by index
   * @param {number} value the index to use
   */
  set selectedIndex(value:number) {
    if (Number.isInteger(value) && this.options[value]) {
      const elem = this.options[value];
      this.value = elem.getAttribute(attributes.VALUE);
      this.state.selectedIndex = value;
    }
  }

  get selectedIndex() { return this.state.selectedIndex; }

  /**
   * Returns the currently available options
   * @returns {Array<any>} the array of options
   */
  get options() {
    return this.querySelectorAll('ids-list-box-option');
  }

  /**
   * Sets the readonly attribute
   * @param {string|boolean} value string value from the readonly attribute
   */
  set readonly(value) {
    const isReadonly = stringToBool(value);

    if (isReadonly) {
      this.removeAttribute(attributes.DISABLED);
      this.input.disabled = false;
      this.input.cursor = 'initial';
      this.input.readonlyBackground = false;
      this.setAttribute(attributes.READONLY, 'true');
      return;
    }
    this.input.disabled = false;
    this.input.cursor = 'pointer';
    this.input.readonlyBackground = true;
    this.removeAttribute(attributes.READONLY);
  }

  get readonly() {
    return stringToBool(this.getAttribute(attributes.READONLY)) || false;
  }

  /**
   * Sets the group attribute
   * @param {string|boolean} value string value from the disabled attribute
   */
  set group(value) {
    const valueSafe = stringToBool(value);
    if (valueSafe) {
      this.setAttribute(attributes.GROUP, valueSafe);
      return;
    }
    this.removeAttribute(attributes.GROUP);
  }

  get group() {
    return this.getAttribute(attributes.GROUP);
  }

  /**
   * Sets the disabled attribute
   * @param {string|boolean} value string value from the disabled attribute
   */
  set disabled(value) {
    const isDisabled = stringToBool(value);
    if (isDisabled) {
      this.input.disabled = true;
      this.input.readonly = false;
      this.input.cursor = 'initial';
      this.input.bgTransparent = false;
      this.setAttribute(attributes.DISABLED, 'true');
      return;
    }
    this.input.disabled = false;
    this.input.cursor = 'pointer';
    this.input.bgTransparent = true;
    this.removeAttribute(attributes.DISABLED);
  }

  get disabled() {
    return stringToBool(this.getAttribute(attributes.DISABLED)) || false;
  }

  /**
   * Sets allow-blank setting
   * @param {string|boolean} value adds blank option if true
   */
  set allowBlank(value: boolean | string) {
    if (stringToBool(value)) {
      this.setAttribute(attributes.ALLOW_BLANK, '');
      this.#insertBlankOption();
    } else {
      this.#removeBlank();
      this.removeAttribute(attributes.ALLOW_BLANK);
      if (this.value === 'blank') {
        this.removeAttribute(attributes.VALUE);
      }
    }
  }

  /**
   * Gets allow-blank value
   * @returns {boolean} allow-blank value
   */
  get allowBlank(): boolean {
    return stringToBool(this.getAttribute(attributes.ALLOW_BLANK));
  }

  /**
   * Set the aria and state on the element
   * @private
   * @param {HTMLElement} option the option to select
   */
  selectOption(option: HTMLElement) {
    option?.setAttribute('aria-selected', 'true');
    option?.classList.add('is-selected');
  }

  /**
   * Set the icon to be visible (if used)
   * @private
   * @param {HTMLElement} option the option to select
   */
  selectIcon(option: HTMLElement) {
    let dropdownIcon = this.input?.querySelector('ids-icon[slot="trigger-start"]');
    if (!this.hasIcons) {
      if (dropdownIcon) {
        dropdownIcon.remove();
      }
      return;
    }
    const icon: any = option.querySelector('ids-icon');

    if (!dropdownIcon) {
      const dropdownIconContainer = document.createElement('span');
      dropdownIconContainer.slot = 'trigger-start';
      dropdownIconContainer.classList.add('icon-container');
      dropdownIcon = document.createElement('ids-icon');
      dropdownIcon.icon = icon.icon;
      dropdownIcon.setAttribute('slot', 'trigger-start');
      dropdownIconContainer.append(dropdownIcon);
      this.input?.appendChild(dropdownIconContainer);
    } else {
      dropdownIcon.icon = icon.icon;
    }
  }

  /**
   * Set the tooltip to be visible for the selected option
   * @private
   * @param {HTMLElement} option the option to select
   */
  selectTooltip(option: HTMLElement) {
    const tooltip = option.getAttribute('tooltip');
    if (tooltip) {
      this.tooltip = tooltip;
    }
  }

  /**
   * Remove the aria and state from the currently selected element
   */
  #clearSelected() {
    const option = this.querySelector('ids-list-box-option[aria-selected]');
    if (option) {
      option.removeAttribute('aria-selected');
      option.classList.remove('is-selected');
    }
  }

  /**
   * Insert blank option into list box
   */
  #insertBlankOption(): void {
    if (!this.allowBlank) return;
    const list = this.querySelector('ids-list-box');
    const blankOption = '<ids-list-box-option value="blank" aria-label="Blank">&nbsp;</ids-list-box-option>';
    this.#removeBlank();
    list?.insertAdjacentHTML('afterbegin', blankOption);
  }

  /**
   * Remove blank options from list box
   */
  #removeBlank(): void {
    this.querySelector('ids-list-box-option[value="blank"]')?.remove();
  }

  #configurePopup() {
    this.popup.alignTarget = this.input.fieldContainer;
    this.popup.align = 'bottom, left';
    this.popup.arrow = 'none';
    this.popup.y = -1;
    this.popup.type = 'dropdown';

    // Fix aria if the menu is closed
    if (!this.popup.visible) {
      this.#setAriaOnMenuClose();
    }
  }

  /**
   * Open the dropdown list
   */
  async open() {
    if (this.disabled || this.readonly) {
      return;
    }

    // Trigger an async callback for contents
    if (typeof this.state.beforeShow === 'function') {
      const stuff = await this.state.beforeShow();
      this.#loadDataSet(stuff);
    }

    // Open the popup and add a class
    this.popup.visible = true;
    this.addOpenEvents();
    this.input.active = true;

    // Focus and select input when autocomplete is enabled
    if (this.autocomplete) {
      this.input.focus();
      this.input.input.select();
    }

    this.#setAriaOnMenuOpen();
  }

  /**
   * Populate the DOM with the dataset
   * @param {IdsListBoxOptions} dataset The dataset to use with value, label ect...
   * @private
   */
  #loadDataSet(dataset: IdsListBoxOptions) {
    let html = '';
    const listbox = this.querySelector('ids-list-box');
    listbox.innerHTML = '';

    dataset.forEach((option: IdsListBoxOption) => {
      html += `<ids-list-box-option
        value="${option.value}">${option.label}
        </ids-list-box-option>`;
    });
    listbox.insertAdjacentHTML('afterbegin', html);
    this.#insertBlankOption();
    this.value = this.getAttribute(attributes.VALUE);
  }

  /**
   * An async function that fires as the dropdown is opening allowing you to set contents.
   * @param {Function} func The async function
   */
  set beforeShow(func) {
    this.state.beforeShow = func;
  }

  get beforeShow() { return this.state.beforeShow; }

  /**
   * Inherited from the Popup Open Events Mixin.
   * Runs when a click event is propagated to the window.
   * @param {PointerEvent} e native pointer event
   * @returns {void}
   */
  onOutsideClick(e: any): void {
    if (!this.autocomplete) {
      this.close(true);
    }

    if (this.autocomplete && !(e.path?.includes(this.popup) || e.path?.includes(this.input.fieldContainer))) {
      this.close(true);
    }
  }

  /**
   * Close the dropdown popup
   * @param {boolean} noFocus if true do not focus on close
   */
  close(noFocus?: boolean) {
    this.popup.visible = false;
    this.input.active = false;
    this.#setAriaOnMenuClose();
    this.removeOpenEvents();

    if (!noFocus) {
      this.input.focus();
    }
  }

  /**
   * Toggle the dropdown list open/closed state
   * @private
   */
  toggle(): void {
    if (!this.popup.visible) {
      this.open();
    } else {
      this.close();
    }
  }

  /**
   * Establish Internal Event Handlers
   * @private
   * @returns {object} The object for chaining.
   */
  #attachEventHandlers() {
    this.onEvent('mousedown', this.listBox, (e: any) => {
      const option = e.target.closest('ids-list-box-option');

      if (option) {
        this.value = option.getAttribute(attributes.VALUE);
      }
    });

    this.offEvent('click.dropdown-input');
    this.onEvent('click.dropdown-input', this.input.input, () => {
      if (!this.autocomplete) {
        this.toggle();
      }

      // Stays opened when clicking to input in autocomplete
      if (this.autocomplete && !this.popup.visible) {
        this.open();
      }
    });

    // Should not open if clicked on label
    this.offEvent('click.dropdown-label');
    this.onEvent('click.dropdown-label', this.labelEl, (e: MouseEvent) => {
      e.preventDefault();

      this.input.focus();
    });

    this.offEvent('click.dropdown-popup');
    this.onEvent('click.dropdown-popup', this.trigger, () => {
      this.toggle();
    });

    // Disable text selection on tab (extra info in the screen reader)
    this.offEvent('focus.dropdown-input');
    this.onEvent('focus.dropdown-input', this.input, () => {
      (window.getSelection() as any).removeAllRanges();
    });

    // Handle the Locale Change
    this.offEvent('languagechange.dropdown-container');
    this.onEvent('languagechange.dropdown-container', this.closest('ids-container'), () => {
      this.#addAria();
    });

    return this;
  }

  #attachAutocompleteEvents() {
    // Handle Key Typeahead
    this.offEvent('keydownend.dropdown-autocomplete');
    this.onEvent('keydownend.dropdown-autocomplete', this.input, () => {
      this.#typeAhead();
    });
  }

  #removeAutocompleteEvents() {
    this.offEvent('keydownend.dropdown-autocomplete');
  }

  /**
   * Establish Internal Keyboard shortcuts
   * @private
   * @returns {object} This API object for chaining
   */
  #attachKeyboardListeners() {
    // Handle up and down arrow
    this.listen(['ArrowDown', 'ArrowUp'], this, (e: KeyboardEvent) => {
      if (!this.popup.visible) {
        this.open();
        return;
      }
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();

      const selected: any = this.selected;
      if (e.key === 'ArrowUp' && e.altKey) {
        this.value = selected?.getAttribute(attributes.VALUE) || '';
        this.close();
        return;
      }

      if (e.key === 'ArrowDown' && selected?.nextElementSibling) {
        selected.classList.remove('is-selected');
        selected.setAttribute('tabindex', '-1');
        selected?.removeAttribute('aria-selected');
        selected.nextElementSibling.classList.add('is-selected');
        selected.nextElementSibling.setAttribute('tabindex', '0');
        selected.nextElementSibling.setAttribute('aria-selected', true);
        (selected.nextElementSibling as any).focus();
        this.listBox?.setAttribute('aria-activedescendant', selected.nextElementSibling?.id || this.selectedIndex);
      }

      if (e.key === 'ArrowUp' && selected?.previousElementSibling) {
        selected.classList.remove('is-selected');
        selected.setAttribute('tabindex', '-1');
        selected?.removeAttribute('aria-selected');
        selected.previousElementSibling.classList.add('is-selected');
        selected.previousElementSibling.setAttribute('tabindex', '0');
        selected.previousElementSibling.setAttribute('aria-selected', true);
        (selected.previousElementSibling as any).focus();
        this.listBox?.setAttribute('aria-activedescendant', selected.previousElementSibling?.id || this.selectedIndex);
      }
    });

    // Close on escape
    this.listen(['Escape'], this, () => {
      this.close();
    });

    // Select or Open on space/enter
    this.listen([' ', 'Enter'], this, () => {
      if (!this.popup.visible) {
        this.open();
        return;
      }

      const selected = this.selected;
      this.value = selected?.getAttribute(attributes.VALUE) || '';
      this.close();
    });

    // Move to Next on Tab
    this.listen(['Tab'], this, (e: KeyboardEvent) => {
      if (!this.popup.visible) {
        return;
      }

      if (e.shiftKey) {
        this.input.focus();
      }

      const selected = this.selected;
      this.value = selected?.getAttribute(attributes.VALUE) || '';
      this.close(true);
    });
    return this;
  }

  /**
   * Open the list and move to the key pressed item
   * @param {string} keyString The last pressed key to use
   */
  /**
   * Display matches from the dataset
   * @returns {void}
   */
  #typeAhead() {
    if (this.readonly || this.disabled) {
      return;
    }

    const inputValue: string = this.input.value;
    const resultsArr = this.#findMatches(inputValue);
    const results = resultsArr.map((item: IdsListBoxOption) => {
      const regex = new RegExp(inputValue, 'gi');
      const optionText = item.label?.replace(
        regex,
        `<span class="highlight">${inputValue.toLowerCase()}</span>`
      );

      return this.#templatelistBoxOption({
        ...item,
        label: optionText
      });
    }).join('');

    this.listBox.innerHTML = results || `<ids-list-box-option>${this.locale.translate('NoResults')}</ids-list-box-option>`;
    // select first match
  }

  /**
   * Create the list box option template.
   * @param {IdsListBoxOption} option sets the label of the option
   * @returns {string} ids-list-box-option template.
   */
  #templatelistBoxOption(option: IdsListBoxOption): string {
    return `<ids-list-box-option${option.id ? ` id=${option.id} ` : ' '}value="${option.value}">${option.label}</ids-list-box-option>`;
  }

  /**
   * Find matches between the input value and the dataset
   * @param {string | RegExp} inputValue value of the input field
   * @returns {IdsListBoxOptions} containing matched values.
   */
  #findMatches(inputValue: string | RegExp): IdsListBoxOptions {
    return this.#optionsData.filter((option: IdsListBoxOption) => {
      const regex = new RegExp(inputValue, 'gi');

      return option.label?.match(regex);
    });
  }

  /**
   * Map slotted ids-list-box-option elements to the dataset
   */
  #setOptionsData() {
    this.#optionsData = [...this.options].map((item) => ({
      id: item?.id,
      label: item?.textContent,
      value: item?.getAttribute(attributes.VALUE)
    }));
  }

  /**
   * Set the dirty tracking feature on to indicate a changed dropdown
   * @param {boolean|string} value If true will set `dirty-tracker` attribute
   */
  set dirtyTracker(value: boolean | string) {
    const val = stringToBool(value);
    if (val) {
      this.setAttribute(attributes.DIRTY_TRACKER, val.toString());
    } else {
      this.removeAttribute(attributes.DIRTY_TRACKER);
    }

    this.handleDirtyTracker();
  }

  get dirtyTracker(): string { return this.getAttribute(attributes.DIRTY_TRACKER); }

  /**
   * Pass down `validate` attribute into IdsTriggerField
   * @param {string} value The `validate` attribute
   */
  set validate(value: string) {
    if (value) {
      this.setAttribute(attributes.VALIDATE, value.toString());
      this.input.setAttribute(attributes.VALIDATE, value.toString());
    } else {
      this.removeAttribute(attributes.VALIDATE);
      this.input.removeAttribute(attributes.VALIDATE);
    }
  }

  get validate(): string { return this.getAttribute(attributes.VALIDATE); }

  /**
   * Pass down `validation-events` attribute into IdsTriggerField
   * @param {string} value The `validation-events` attribute
   */
  set validationEvents(value: string) {
    if (value) {
      this.setAttribute(attributes.VALIDATION_EVENTS, value.toString());
      this.input.setAttribute(attributes.VALIDATION_EVENTS, value.toString());
    } else {
      this.removeAttribute(attributes.VALIDATION_EVENTS);
      this.input.removeAttribute(attributes.VALIDATION_EVENTS);
    }
  }

  get validationEvents(): string { return this.getAttribute(attributes.VALIDATION_EVENTS) || 'change'; }

  /**
   * Sets the no margins attribute
   * @param {boolean} value The value for no margins attribute
   */
  set noMargins(value: boolean) {
    if (stringToBool(value)) {
      this.setAttribute(attributes.NO_MARGINS, '');
      this.input.setAttribute(attributes.NO_MARGINS, '');
      return;
    }
    this.removeAttribute(attributes.NO_MARGINS);
    this.input.removeAttribute(attributes.NO_MARGINS);
  }

  get noMargins(): boolean {
    return stringToBool(this.getAttribute(attributes.NO_MARGINS));
  }

  /**
   * Set the dropdown size
   * @param {string} value The value
   */
  set size(value: string) {
    if (value) {
      this.setAttribute(attributes.SIZE, value);
      this.listBox?.setAttribute(attributes.SIZE, value);
    } else {
      this.removeAttribute(attributes.SIZE);
      this.listBox?.removeAttribute(attributes.SIZE);
    }
    this.input.setAttribute(attributes.SIZE, this.size);
  }

  get size(): string { return this.getAttribute(attributes.SIZE) ?? 'md'; }

  /**
   * Set autocomplete attribute
   * @param {string | boolean | null} value autocomplete value
   */
  set autocomplete(value: string | boolean | null) {
    const val = stringToBool(value);

    if (val) {
      this.setAttribute(attributes.AUTOCOMPLETE, val);
      this.#attachAutocompleteEvents();
      this.input?.removeAttribute(attributes.READONLY);
      this.#setOptionsData();
    } else {
      this.removeAttribute(attributes.AUTOCOMPLETE);
      this.#removeAutocompleteEvents();
      this.input?.setAttribute(attributes.READONLY, true);
    }
  }

  /**
   * Get the autocomplete attribute
   * @returns {boolean} autocomplete attribute value
   */
  get autocomplete(): boolean {
    return stringToBool(this.getAttribute(attributes.AUTOCOMPLETE));
  }
}
