import {
  customElement,
  scss,
} from '../../core/ids-decorators';

import { attributes } from '../../core/ids-attributes';
import Base from './ids-swappable-item-base';
import styles from './ids-swappable-item.scss';
import { stringToBool } from '../../utils/ids-string-utils/ids-string-utils';

/**
 * IDS Swappable Item Component
 * @type {IdsSwappableItem}
 * @inherits IdsElement
 * @mixes IdsEventsMixin
 * @mixes IdsThemeMixin
 */
@customElement('ids-swappable-item')
@scss(styles)
export default class IdsSwappableItem extends Base {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('tabbable', 'true');
    this.setAttribute('draggable', 'false');
    this.attachEventListeners();
  }

  static get attributes() {
    return [
      ...super.attributes,
      attributes.DRAGGING,
      attributes.ORIGINAL_TEXT,
      attributes.OVER,
      attributes.SELECTED,
      attributes.TABBABLE
    ];
  }

  template(): string {
    return `<slot></slot>`;
  }

  /**
   * Set the selected attribute
   * @param {string | boolean | null} value boolean value
   * @memberof IdsSwappableItem
   */
  set selected(value: string | boolean | null) {
    const isValueTruthy = stringToBool(value);
    if (isValueTruthy) {
      this.setAttribute(attributes.SELECTED, '');
      this.setAttribute('aria-selected', 'selected');
      this.setAttribute('draggable', 'true');
    } else {
      this.removeAttribute(attributes.SELECTED);
      this.removeAttribute('aria-selected');
      this.setAttribute('draggable', 'false');
    }
  }

  /**
   * Get the selected attribute
   * @returns {boolean} selected attribute value
   * @readonly
   * @memberof IdsSwappableItem
   */
  get selected(): boolean | null {
    return stringToBool(this.getAttribute(attributes.SELECTED));
  }

  /**
   * Get all selected swappable items
   * @returns {any} NodeList of selected ids-swappable-item
   * @readonly
   * @memberof IdsSwappableItem
   */
  get selectedItems(): any {
    return this.parentElement.shadowRoot.querySelectorAll('[selected]');
  }

  /**
   * Get all swappable items
   * @returns {any} NodeList of ids-swappable-item
   * @readonly
   * @memberof IdsSwappableItem
   */
  get allItems(): any {
    return this.parentElement.querySelectorAll('ids-swappable-item');
  }

  /**
   * Set the originalText attribute
   * which is used to reset the text of the dropped items
   * @param {string} value text value of the item
   * @memberof IdsSwappableItem
   */
  set originalText(value: string) {
    if (value) {
      this.setAttribute(attributes.ORIGINAL_TEXT, value);
    } else {
      this.removeAttribute(attributes.ORIGINAL_TEXT);
    }
  }

  /**
   * Get the originalText attribute
   * @returns {string} string of text
   * @readonly
   * @memberof IdsSwappableItem
   */
  get originalText(): string {
    return this.getAttribute(attributes.ORIGINAL_TEXT);
  }

  /**
   * Get the selection attribute
   * @returns {string} value of selection attribute
   * @readonly
   * @memberof IdsSwappableItem
   */
  get selection(): string {
    return this.parentElement.getAttribute(attributes.SELECTION);
  }

  /**
   * Set if the item is tabbable
   * @param {boolean | string} value True of false depending if the item is tabbable
   */
  set tabbable(value: boolean | string) {
    if (stringToBool(value) !== this.getAttribute(attributes.TABBABLE)) {
      const isTabbable = stringToBool(value);
      if (isTabbable) {
        this.setAttribute(attributes.TABBABLE, 'true');
        this.setAttribute(attributes.TABINDEX, '0');
        return;
      }
      this.setAttribute(attributes.TABBABLE, 'false');
      this.setAttribute(attributes.TABINDEX, '-1');
    }
  }

  /**
   * Get whether the item currently allows tabbing.
   * @returns {boolean | string} true or false depending on whether the item is currently tabbable
   */
  get tabbable(): boolean | string {
    return stringToBool(this.getAttribute(attributes.TABBABLE) || true);
  }

  /**
   * Handle functionality for the dragstart event
   * @param {any} event dragstart event
   */
  #dragStart(event: any) {
    event.dataTransfer?.setData('text/plain', event.target.innerText);
    this.setAttribute(attributes.DRAGGING, '');
  }

  /**
   * Handle functionality for the dragend event
   */
  #dragEnd() {
    this.setAttribute(attributes.DRAGGABLE, 'false');
    this.removeAttribute(attributes.DRAGGING);
    this.removeAttribute(attributes.SELECTED);
    this.removeAttribute(attributes.OVER);
  }

  /**
   * Handle functionality for the dragover event
   */
  #dragOver() {
    if (this.hasAttribute(attributes.DRAGGING)) {
      this.removeAttribute(attributes.OVER);
    } else {
      this.setAttribute(attributes.OVER, '');
    }
  }

  /**
   * Handle functionality for the dragleave event
   */
  #dragLeave() {
    this.removeAttribute(attributes.OVER);
  }

  /**
   * Toggles the select attribute when
   * ids-swappable is not set to selection
   */
  #toggleSelect() {
    if (this.selected) {
      this.removeAttribute(attributes.SELECTED);
      this.querySelector('div[part="list-item"]')?.removeAttribute(attributes.SELECTED, 'selected');
    } else {
      this.allItems.forEach((item: any) => {
        item.removeAttribute(attributes.SELECTED);
        item.querySelector('div[part="list-item"]')?.removeAttribute(attributes.SELECTED);
      });
      this.setAttribute(attributes.SELECTED, '');
      this.querySelector('div[part="list-item"]')?.setAttribute(attributes.SELECTED, 'selected');
    }
  }

  /**
   * Toggles the select attribute when
   * ids-swappable is set to selection
   */
  #toggleMultiSelect() {
    if (this.selected) {
      this.removeAttribute(attributes.SELECTED);
    } else {
      this.setAttribute(attributes.SELECTED, '');
    }
  }

  /**
   * Handle the keyboard events
   */
  #handleKeyEvents() {
    this.listen(['Enter', 'ArrowUp', 'ArrowDown'], this, (e: any) => {
      e.preventDefault();

      if (e.key === 'ArrowDown') {
        e.target.parentElement?.nextElementSibling?.focus();
        e.target.nextElementSibling?.focus();
      }

      if (e.key === 'ArrowUp') {
        e.target.previousElementSibling?.focus();
      }

      if (e.key === 'Enter') {
        const isEditing = this.querySelector('.is-editing');
        if (isEditing) {
          return;
        }

        if (this.selection === 'multiple') {
          this.#toggleMultiSelect();
        } else {
          this.#toggleSelect();
        }
      }
    });
  }

  /**
   * Handle the click events
   */
  #handleClickEvents() {
    if (this.selection === 'multiple') {
      this.offEvent('click', this, this.#toggleMultiSelect);
      this.onEvent('click', this, this.#toggleMultiSelect);
    } else {
      this.offEvent('click', this, this.#toggleSelect);
      this.onEvent('click', this, this.#toggleSelect);
    }
  }

  /**
   * Handle the drag events
   */
  #handleDragEvents() {
    this.offEvent('dragstart', this, (e: any) => this.#dragStart(e));
    this.onEvent('dragstart', this, (e: any) => this.#dragStart(e));

    this.offEvent('dragend', this, () => this.#dragEnd());
    this.onEvent('dragend', this, () => this.#dragEnd());

    this.offEvent('drop', this, () => this.#dragEnd());
    this.onEvent('drop', this, () => this.#dragEnd());

    this.offEvent('dragover', this, () => this.#dragOver());
    this.onEvent('dragover', this, () => this.#dragOver());

    this.offEvent('dragleave', this, () => this.#dragLeave());
    this.onEvent('dragleave', this, () => this.#dragLeave());
  }

  /**
   * Attach all event listeners
   */
  attachEventListeners() {
    this.#handleClickEvents();
    this.#handleKeyEvents();
    this.#handleDragEvents();
  }
}