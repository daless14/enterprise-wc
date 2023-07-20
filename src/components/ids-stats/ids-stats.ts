import { customElement, scss } from '../../core/ids-decorators';
import { stringToBool } from '../../utils/ids-string-utils/ids-string-utils';
import { attributes } from '../../core/ids-attributes';

import '../ids-box/ids-box';
import '../ids-layout-flex/ids-layout-flex';
import IdsElement from '../../core/ids-element';
import styles from './ids-stats.scss';

/**
 * IDS Stats Component
 * @type {IdsStats}
 * @inherits IdsElement
 * @part stats - the stats container element
 */
@customElement('ids-stats')
@scss(styles)
export default class IdsStats extends IdsElement {
  constructor() {
    super();
  }

  /**
   * Invoked each time the custom element is appended into a document-connected element.
   */
  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes(): Array<string> {
    return [
      ...super.attributes,
      attributes.TREND_LABEL,
      attributes.ICON,
      attributes.STATUS_COLOR,
      attributes.KPI,
      attributes.MAIN_LABEL,
      attributes.SUBTITLE
    ];
  }

  /**
   * Create the Template for the contents
   * @returns {string} The template
   */
  template(): string {
    const isPositive = (this.trendLabel || '').indexOf('+') > -1;
    const isNegative = (this.trendLabel || '').indexOf('-') > -1;
    return `<ids-box><div class="ids-stats" part="stats">
      <ids-layout-flex direction="column">
        <ids-layout-flex justify-content="space-between" align-items="center">
          <ids-layout-flex-item>
            <div class="trend-label${isPositive ? ' is-positive' : ''}${isNegative ? ' is-negative' : ''}">${this.trendLabel}${isPositive ? this.trendingUpIcon : ''}</div>
          </ids-layout-flex-item>
          <ids-layout-flex-item>
            <div class="main-icon"><ids-icon icon="${this.icon}" status-color=${this.statusColor}></ids-icon></div>
          </ids-layout-flex-item>
        </ids-layout-flex>
        <ids-layout-flex-item>
          <ids-text font-size="40" class="kpi" color="slate-100" font-weight="semi-bold" overflow="ellipsis">${this.kpi}</ids-text>
        </ids-layout-flex-item>
        <ids-layout-flex-item>
          <ids-text font-size="14" class="main-label" font-weight="semi-bold" overflow="ellipsis">${this.mainLabel}</ids-text>
        </ids-layout-flex-item>
        <ids-layout-flex-item>
          <ids-text font-size="12" class="subtitle" overflow="ellipsis">${this.subtitle}</ids-text>
        </ids-layout-flex-item>
      </ids-layout-flex>
    </div></<ids-box>`;
  }

  trendingUpIcon = `<svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1.4 12L0 10.6L7.4 3.15L11.4 7.15L16.6 2H14V0H20V6H18V3.4L11.4 10L7.4 6L1.4 12Z" fill="#2AC371"/>
  </svg>`;

  /**
   * Used to showcase price or amount trending up or down (Optional).
   * @param {string} value Trend label text
   */
  set trendLabel(value: string) {
    const elem = this.container?.querySelector('.trend-label');
    if (stringToBool(value) && elem) {
      this.setAttribute(attributes.TREND_LABEL, value);
      elem.textContent = value;
    } else if (elem) {
      elem.setAttribute('hidden', 'true');
    }
  }

  get trendLabel(): string {
    return this.getAttribute(attributes.TREND_LABEL) || '';
  }

  /**
   * Use to call attention to status of the KPI.
   * Can be colored to bring attention (via statusColor)
   * (Optional in larger KPI format).
   * @param {string} value Trend label text
   */
  set icon(value: string | null) {
    const elem = this.container?.querySelector('.main-icon');
    if (stringToBool(value) && elem && value) {
      this.setAttribute(attributes.ICON, value);
      elem.textContent = value;
    } else if (elem) {
      elem.setAttribute('hidden', 'true');
    }
  }

  get icon(): string | null {
    return this.getAttribute(attributes.ICON);
  }

  /**
   * Color that can be used for embellishment or to indicate status or bring attention
   * @param {string} value Any pallete color reference
   */
  set statusColor(value: string | null) {
    if (value) {
      this.setAttribute(attributes.STATUS_COLOR, value);
      this.container?.querySelector('.main-icon ids-icon')?.setAttribute('status-color', value);
    } else {
      this.removeAttribute(attributes.STATUS_COLOR);
    }
  }

  get statusColor(): string {
    return this.getAttribute(attributes.STATUS_COLOR) || 'azure';
  }

  /**
   * Large center label. Show up to 6 characters in small size in the KPI area
   * @param {string} value Numbers or percentages or dollar amount
   */
  set kpi(value: string | null) {
    const elem = this.container?.querySelector('.kpi');
    if (value && elem) {
      this.setAttribute(attributes.KPI, value);
      elem.textContent = value;
    } else if (elem) {
      this.removeAttribute(attributes.KPI);
    }
  }

  get kpi(): string {
    return this.getAttribute(attributes.KPI) || '';
  }

  /**
   * Main KPI Label. Will truncate if too big
   * @param {string} value label value as text
   */
  set mainLabel(value: string | null) {
    const elem = this.container?.querySelector('.main-label');
    if (value && elem) {
      this.setAttribute(attributes.MAIN_LABEL, value);
      elem.textContent = value;
    } else if (elem) {
      this.removeAttribute(attributes.MAIN_LABEL);
    }
  }

  get mainLabel(): string {
    return this.getAttribute(attributes.MAIN_LABEL) || '';
  }

  /**
   * Extra details on the KPI. Single line. Auto truncates.
   * @param {string} value label value as text
   */
  set subtitle(value: string | null) {
    const elem = this.container?.querySelector('.subtitle');
    if (value && elem) {
      this.setAttribute(attributes.SUBTITLE, value);
      elem.textContent = value;
    } else if (elem) {
      this.removeAttribute(attributes.SUBTITLE);
    }
  }

  get subtitle(): string {
    return this.getAttribute(attributes.SUBTITLE) || '';
  }
}
