import {
  IdsElement,
  customElement,
  scss,
  mix,
  attributes
} from '../ids-base/ids-element';
import {
  IdsEventsMixin,
  IdsKeyboardMixin,
  IdsThemeMixin
} from '../ids-mixins';

import '../ids-color/ids-color';
import '../ids-trigger-field/ids-trigger-field';
import '../ids-trigger-field/ids-trigger-button';
import '../ids-popup/ids-popup';
import styles from './ids-color-picker.scss';

/**
 * IDS ColorPicker
 * @type {IdsColorPicker}
 * @inherits IdsElement
 * @mixes IdsEventsMixin
 * @mixes IdsKeyboardMixin
 */

@customElement('ids-color-picker')
@scss(styles)
class IdsColorPicker extends mix(IdsElement).with(IdsEventsMixin, IdsKeyboardMixin, IdsThemeMixin) {
  constructor() {
    super();
  }

   idsColorPicker = this.shadowRoot

   body = document.getElementsByTagName('body')[0]

   colorpickerContainer = this.container;

   colorContainer = this.idsColorPicker.querySelector('.color-container')

   triggerButton = this.idsColorPicker.querySelector('#color-picker-button')

   colorpickerInput = this.idsColorPicker.querySelector('.color-input')

   colorInputValueClass = this.label === '' ? 'color-input-value-no-label' : 'color-input-value';

   colorInputValue = this.idsColorPicker.querySelector(this.label === '' ? '.color-input-value-no-label' : '.color-input-value')

   colorPreview = this.idsColorPicker.querySelector('.color-preview')

   idsColorsArr = document.querySelectorAll('ids-color')

   connectedCallback() {
     // TODO: Need to do this and not sure why or the setters dont work
     // eslint-disable-next-line no-self-assign
     this.value = this.value;
     // eslint-disable-next-line no-self-assign
     this.disabled = this.disabled;
     // eslint-disable-next-line no-self-assign
     this.swatch = this.swatch;
     // eslint-disable-next-line no-self-assign
     this.label = this.label;
     this.#handleEvents();
   }

   static get attributes() {
     return [attributes.DISABLED, attributes.LABEL, attributes.MODE, attributes.NAME, 'swatch', attributes.VALUE, attributes.VERSION];
   }

   template() {
     const id = this.id || 'ids-color';
     const template = `
      <div class="ids-color-picker">
        <ids-trigger-field tabbable="false">
          <span class="color-preview" tabindex="-1">
            <ids-input tabindex="-1" class="color-input" type="color" disabled="${this.disabled}"></ids-input>
          </span>
          <ids-input dirty-tracker="true" disabled="${this.disabled}" class="${this.label === '' ? 'color-input-value-no-label' : 'color-input-value'}" label="${this.label}"></ids-input>
          <ids-trigger-button id="${id}-button">
            <ids-icon class="ids-dropdown" icon="dropdown" size="medium"></ids-icon>
          </ids-trigger-button>
        </ids-trigger-field>
        <ids-popup type="menu">
          <slot slot="content" class="color-popup"></slot>
        </ids-popup>
      </div>`;
     return template;
   }

   set value(v) {
     this.#updateColorPickerValues(v);
     this.setAttribute('value', v.toString().toLowerCase());
   }

   get value() {
     return this.getAttribute('value') || '#B94E4E';
   }

   set disabled(d) {
     this.setAttribute('disabled', d.toString());
   }

   get disabled() {
     return this.getAttribute('disabled') || 'false';
   }

   set swatch(s) {
     this.setAttribute('swatch', s.toString());
   }

   get swatch() {
     return this.getAttribute('swatch') || 'true';
   }

   set label(l) {
     this.setAttribute('label', l.toString());
   }

   get label() {
     return this.getAttribute('label') || '';
   }

   #handleEvents() {
     this.idsColorsArr.forEach((element) => {
       element.style.backgroundColor = element.getAttribute('hex');
     });

     if (this.disabled === 'false') {
       this.onEvent('click', this.container, (event) => {
         const target = event.target;
         const openColorCondition = (target.classList.contains('colorpicker-icon') || target.classList.contains('ids-dropdown'));
         
         if (openColorCondition) {
           this.#openCloseColorpicker();
         }

         if (target.hasAttribute('hex')) {
           this.#updateColorCheck(target);
           this.setAttribute('value', target.getAttribute('hex'));
           this.#openCloseColorpicker();
         }
       });

       this.onEvent('keyup', this.container, (keyup) => {
         if (keyup.key === 'Enter') {
           if (keyup.target.id === `${this.id}-button`) {
             this.#openCloseColorpicker();
           }
           if (keyup.target.hasAttribute('hex')) {
             this.setAttribute('value', keyup.target.getAttribute('hex'));
             this.#openCloseColorpicker();
           }
         }
       });
     }

     this.onEvent('change', this.colorpickerInput, () => this.setAttribute('value', this.colorpickerInput.value.toLowerCase()));

     this.onEvent('change', this.colorInputValue, () => this.setAttribute('value', this.colorInputValue.value.toLowerCase()));
   }

   #updateColorPickerValues(colorValue) {
     this.colorpickerInput.value = colorValue;
     this.colorPreview.style.backgroundColor = colorValue;
     this.colorInputValue.value = colorValue;
   }

   #openCloseColorpicker() {
     const popup = this.container.querySelector('ids-popup');
     popup.alignTarget = this.container.querySelector('ids-icon');
     popup.align = 'bottom, center';
     popup.arrow = 'bottom';
     popup.y = 12;
     popup.visible = !popup.visible;
   }

   #updateColorCheck(target) {
    const checkedColor = target.parentElement.querySelector('[checked="true"]');
    if (checkedColor) {
      checkedColor.removeAttribute('checked');
    }
    target.setAttribute('checked', 'true');
   }
}

export default IdsColorPicker;
