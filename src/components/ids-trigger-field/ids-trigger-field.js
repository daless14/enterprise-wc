import { attributes } from '../../core/ids-attributes';
import { customElement, scss } from '../../core/ids-decorators';
import { stringToBool } from '../../utils/ids-string-utils/ids-string-utils';

import Base from './ids-trigger-field-base';

import IdsTriggerButton from './ids-trigger-button';

import styles from './ids-trigger-field.scss';

/**
 * IDS Trigger Field Component
 * @type {IdsTriggerField}
 * @inherits IdsInput
 * @mixes IdsEventsMixin
 * @mixes IdsThemeMixin
 * @part field - the field container
 * @part content - the content with trigger buttons and input element
 */
@customElement('ids-trigger-field')
@scss(styles)
export default class IdsTriggerField extends Base {
  /**
   * Call the constructor and then initialize
   */
  constructor() {
    super();
  }

  /**
   * Get a list of element dependencies for this component
   * @returns {object} of elements
   */
  get elements() {
    return {
      content: this.container.querySelector('.ids-trigger-field-content'),
      label: this.container.querySelector('label'),
      text: this.container.querySelector('ids-text'),
    };
  }

  /**
   * Custom Element `connectedCallback` implementation
   * @returns {void}
   */
  connectedCallback() {
    this.setInputAttributes();
    this.#attachEventHandlers();
    super.connectedCallback();

    this.onEvent('click.label', this.elements.label, () => {
      if (!stringToBool(this.disabled)) {
        [...this.inputs].forEach((input) => {
          input.input.focus();
        });
      }
    });
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes() {
    return [
      ...super.attributes,
      attributes.APPEARANCE,
      attributes.CSS_CLASS,
      attributes.DISABLE_EVENTS,
      attributes.TABBABLE
    ];
  }

  /**
   * Create the Template for the contents
   * @returns {string} The template
   */
  template() {
    const attrs = {
      readonly: this.readonly ? 'readonly' : '',
      disabled: this.disabled ? 'disabled' : '',
      required: this.validate ? 'required' : '',
      noMargins: this.noMargins ? 'no-margins' : '',
    };

    this.templateHostAttributes();
    const {
      ariaLabel,
      containerClass,
      inputClass,
      inputState,
      placeholder,
      type,
      value
    } = this.templateVariables();

    const hiddenLabelCss = !this.label || this.getAttribute(attributes.LABEL_HIDDEN) ? ' empty' : '';
    const labelHtml = `<label
      class="ids-label-text${hiddenLabelCss}"
      for="${this.id}-input"
      slot="ids-trigger-field-label"
      part="label"
      ${attrs.readonly}
      ${attrs.disabled}
      ${attrs.required}
    >
      <ids-text part="label" label ${attrs.disabled} color-unset>
        ${this.label}
      </ids-text>
    </label>`;

    return (
      `<div class="ids-trigger-field ${containerClass}" part="container">
        ${labelHtml}
        <div class="field-container" part="field-container">
          <slot name="trigger-start"></slot>
          <input
            part="input"
            id="${this.id}-input"
            ${type}${inputClass}${placeholder}${inputState}
            ${ariaLabel}
            ${value}
            ></input>
          <slot name="trigger-end"></slot>
        </div>
      </div>`
    );
  }

  /**
   * Set input observer
   * @private
   * @returns {void}
   */
  setInputObserver() {
    const callback = (mutationList) => {
      mutationList.forEach((m) => {
        if (m.type === 'attributes') {
          const attr = { name: m.attributeName, val: m.target[m.attributeName] };
          this.containerSetHeightClass(attr);
        }
      });
    };
    if (this.inputObserver) {
      this.inputObserver.disconnect();
    }
    this.inputObserver = new MutationObserver(callback);

    [...this.inputs].forEach((input) => {
      this.inputObserver.observe(input, { attributes: true });
    });
  }

  /**
   * Set the class for compact or field height
   * @private
   * @param {object} attr The input attribute
   * @returns {void}
   */
  containerSetHeightClass(attr) {
    const heightClassName = (h) => `field-height-${h}`;
    const heights = ['xs', 'sm', 'md', 'lg'];
    if (attr.name === 'compact') {
      this.container?.classList[stringToBool(attr.val) ? 'add' : 'remove']('compact');
    } else if (attr.name === 'field-height') {
      this.container?.classList.remove(...heights.map((h) => heightClassName(h)));
      if (attr.val !== null) {
        this.container?.classList.add(heightClassName(attr.val));
      }
    }
  }

  /**
   * Set the input attributes
   * @private
   * @returns {void}
   */
  setInputAttributes() {
    this.inputs = this.querySelectorAll('ids-input');
    if (this.inputs) {
      [...this.inputs].forEach((input) => {
        input.setAttribute(attributes.TRIGGERFIELD, 'true');
        input.setAttribute(attributes.LABEL, this.label);
        input.setAttribute(attributes.SIZE, this.size);
        input.setAttribute(attributes.VALIDATE, this.validate);
        input.setAttribute(attributes.LABEL_HIDDEN, true);
        input.setAttribute(attributes.BG_TRANSPARENT, true);

        // Set class for compact or field height
        const attribs = ['compact', 'field-height'];
        const attr = (a) => ({ name: a, val: input.getAttribute(a) });
        attribs.forEach((a) => this.containerSetHeightClass(attr(a)));
        this.setInputObserver();
      });
    }
  }

  /**
   * @readonly
   * @returns {Array<HTMLElement>} containing references to slotted IdsTriggerButtons on this component
   */
  get buttons() {
    return [...this.querySelectorAll('ids-trigger-button')];
  }

  /**
   * Set the trigger button to tabbable
   * @param {boolean|string} value True of false depending if the trigger field is tabbable
   */
  set tabbable(value) {
    const isTabbable = stringToBool(value);
    super.tabbable = isTabbable;

    this.setAttribute(attributes.TABBABLE, isTabbable);
    const button = this.querySelector('ids-trigger-button');

    if (button) {
      button.tabbable = isTabbable;
    }
  }

  get tabbable() {
    return super.tabbable;
  }

  /**
   * Set the appearance of the trigger field
   * @param {string} value Provide different options for appearance 'normal' | 'compact'
   */
  set appearance(value) {
    if (value) {
      this.setAttribute(attributes.APPEARANCE, value);
      return;
    }

    this.setAttribute(attributes.APPEARANCE, 'normal');
  }

  get appearance() { return this.getAttribute(attributes.APPEARANCE); }

  /**
   * Set if the button handles events
   * @param {boolean|string} value True of false depending if the button handles events
   */
  set disableNativeEvents(value) {
    const isDisabled = stringToBool(value);
    if (isDisabled) {
      this.setAttribute(attributes.DISABLE_EVENTS, value.toString());
      this.#attachEventHandlers();
      return;
    }

    this.removeAttribute(attributes.DISABLE_EVENTS);
  }

  get disableNativeEvents() { return this.getAttribute(attributes.DISABLE_EVENTS); }

  /**
   * Sets the css class
   * @param {string} c string value from the css class
   */
  set cssClass(c) {
    if (c) {
      this.setAttribute(attributes.CSS_CLASS, c.toString());
    }
  }

  get cssClass() {
    return this.getAttribute(attributes.CSS_CLASS) || '';
  }

  /**
   * Sets the disabled attribute
   * @param {string} d string value from the disabled attribute
   */
  set disabled(d) {
    super.disabled = d;

    if (stringToBool(d)) {
      this.buttons.forEach((btn) => {
        btn.setAttribute(attributes.DISABLED, '');
        btn.removeAttribute(attributes.READONLY);
      });
    } else {
      this.buttons.forEach((btn) => {
        btn.removeAttribute(attributes.DISABLED);
      });
    }
  }

  get disabled() {
    return super.disabled;
  }

  /**
   * Sets the readonly attribute
   * @param {string} r string value from the read only attribute
   */
  set readonly(r) {
    super.readonly = r;

    if (stringToBool(r)) {
      this.buttons.forEach((btn) => {
        btn.setAttribute(attributes.READONLY, '');
        btn.removeAttribute(attributes.DISABLED);
      });
    } else {
      this.buttons.forEach((btn) => {
        btn.removeAttribute(attributes.READONLY);
      });
    }
  }

  get readonly() {
    return super.readonly;
  }

  /**
   * Establish Internal Event Handlers
   * @private
   * @returns {object} The object for chaining.
   */
  #attachEventHandlers() {
    if (this.inputs) {
      [...this.inputs].forEach((input) => {
        const className = 'has-validation-message';
        this.onEvent('validate', input, (e) => {
          if (e.detail?.isValid) {
            this.container?.classList?.remove(className);
          } else {
            this.container?.classList?.add(className);
          }
        });
      });
    }

    if (this.disableNativeEvents) {
      return false;
    }

    const buttons = this.querySelectorAll('ids-trigger-button');
    if (buttons) {
      [...buttons].forEach((button) => this.onEvent('click', button, () => this.trigger()));
    }

    return this;
  }

  /**
   * Fire the trigger event and action.
   */
  trigger() {
    let canTrigger = true;
    const response = (veto) => {
      canTrigger = !!veto;
    };
    this.triggerEvent('beforetriggerclicked', this, { detail: { elem: this, response } });

    if (!canTrigger) {
      return;
    }
    this.triggerEvent('triggerclicked', this, { detail: { elem: this } });
  }
}
