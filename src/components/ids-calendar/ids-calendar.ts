import Base from './ids-calendar-base';
import { CalendarEventData, CalendarEventTypeData } from './ids-calendar-event';
import IdsMonthView from '../ids-month-view/ids-month-view';
import IdsWeekView from '../ids-week-view/ids-week-view';
import IdsCheckbox from '../ids-checkbox/ids-checkbox';
import styles from './ids-calendar.scss';
import { stringToBool } from '../../utils/ids-string-utils/ids-string-utils';
import { attributes } from '../../core/ids-attributes';
import { customElement, scss } from '../../core/ids-decorators';
import { dateDiff, isValidDate } from '../../utils/ids-date-utils/ids-date-utils';
import { breakpoints } from '../../utils/ids-breakpoint-utils/ids-breakpoint-utils';
import IdsPopup from '../ids-popup/ids-popup';

type CalendarEventDetail = {
  id: string;
  subject: string;
  dateRange: string;
  duration: string;
  color: string;
  eventType: string;
  shortSubject?: string;
  status?: string;
  comments?: string;
};

type CalendarViewTypes = 'month' | 'week' | 'day';

/**
 * IDS Calendar Component
 * @type {IdsCalendar}
 * @inherits IdsElement
 * @mixes IdsThemeMixin
 * @mixes IdsEventsMixin
 * @mixes IdsCalendarEventsMixin
 */
@customElement('ids-calendar')
@scss(styles)
export default class IdsCalendar extends Base {
  activeDate: Date = new Date();

  #mobileBreakpoint = parseInt(breakpoints.md);

  #resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => this.#onResize(entries));

  constructor() {
    super();
    if (!this.state) this.state = {};
  }

  static get attributes() {
    return [
      ...super.attributes,
      attributes.DATE,
      attributes.SHOW_DETAILS,
      attributes.SHOW_LEGEND
    ];
  }

  /**
   * Setting for calendar details pane
   * @param {boolean|string} val show/hides details
   */
  set showDetails(val: boolean | string) {
    if (stringToBool(val)) {
      this.setAttribute(attributes.SHOW_DETAILS, '');
      this.updateEventDetails(this.state.selected);
      this.container.classList.add('show-details');
    } else {
      this.container.querySelector('.calendar-details-pane').innerHTML = '';
      this.removeAttribute(attributes.SHOW_DETAILS);
      this.container.classList.remove('show-details');
    }
  }

  /**
   * @returns {boolean} true if detail pane enabled
   */
  get showDetails(): boolean {
    return this.hasAttribute(attributes.SHOW_DETAILS);
  }

  /**
   * Setting for calendar legend pane
   * @param {boolean|string} val show/hides legend
   */
  set showLegend(val: boolean | string) {
    if (stringToBool(val)) {
      this.setAttribute(attributes.SHOW_LEGEND, '');
      this.renderLegend(this.eventTypesData);
      this.container.classList.add('show-legend');
    } else {
      this.removeAttribute(attributes.SHOW_LEGEND);
      this.querySelector('#event-types-legend')?.remove();
      this.container.classList.remove('show-legend');
    }
  }

  /**
   * @returns {boolean} true of legend pane enabled
   */
  get showLegend(): boolean {
    return this.hasAttribute(attributes.SHOW_LEGEND);
  }

  /**
   * Setting for calendar date
   * @param {Date|string} val user date input
   */
  set date(val: Date | string) {
    const date = new Date(val);

    if (isValidDate(date)) {
      this.activeDate = date;
      this.setAttribute(attributes.DATE, val);
      if (!this.state.skipRender) {
        this.changeView(this.state.view);
        this.updateEventDetails();
      }
    } else {
      this.removeAttribute(attributes.DATE);
    }
  }

  /**
   * @returns {Date} date
   */
  get date(): Date {
    const date = new Date(this.getAttribute(attributes.DATE));
    return isValidDate(date) ? date : new Date();
  }

  /**
   * Ids Calendar Component connected life-cycle hook
   */
  connectedCallback(): void {
    this.setDirection();
    this.changeView('month');
    this.#attachEventHandlers();
    this.#resizeObserver.observe(this.container);
    super.connectedCallback();
  }

  /**
   * Ids Calendar Component disconnected life-cycle hook
   */
  disconnectedCallback() {
    this.#resizeObserver?.disconnect();
    super.disconnectedCallback?.();
  }

  /**
   * Handle event type data changes
   * @param {CalendarEventTypeData[]} data event types
   */
  onEventTypesChange(data: CalendarEventTypeData[]) {
    this.renderLegend(data);
    this.#toggleMonthLegend(data, this.state.isMobile);
  }

  /**
   * Ids Calendar template
   * @returns {string} html template
   */
  template(): string {
    return `
      <div class="ids-calendar">
        <div class="calendar-legend-pane"><slot name="legend"></slot></div>
        <div class="calendar-view-pane"></div>
        <div class="calendar-details-pane"></div>
      </div>
    `;
  }

  /**
   * Create accordion template for events detail
   * @param {CalendarEventDetail[]} data event detail data
   * @returns {string} html accordion template
   */
  detailAccordionTemplate(data: CalendarEventDetail[]): string {
    const panels = data.map((item: CalendarEventDetail) => `
      <ids-accordion-panel expanded="false">
        <ids-accordion-header color="${item.color}" slot="header">
          <ids-text font-weight="bold" overflow="ellipsis">${item.shortSubject || item.subject}</ids-text>
        </ids-accordion-header>
        <div slot="content" class="panel-content">
          ${item.status ? `<ids-data-label label="${this.locale.translate('Status')}">${item.status}</ids-data-label><hr>` : ''}
          <ids-data-label label="${this.locale.translate('Date')}">${item.dateRange}</ids-data-label><hr>
          <ids-data-label label="Event Type">${item.eventType}</ids-data-label><hr>
          <ids-data-label label="${this.locale.translate('Duration')}">${item.duration}</ids-data-label>
          ${item.comments ? `<hr><ids-data-label label="${this.locale.translate('Comments')}">${item.comments}</ids-data-label>` : ''}
        </div>
      </ids-accordion-panel>
    `).join('');

    return `<ids-accordion allow-one-pane="true">${panels}</ids-accordion>`;
  }

  /**
   * Create list template for events detail
   * @param {CalendarEventDetail[]} data event detail data
   * @returns {string} html accordion template
   */
  detailListTemplate(data: CalendarEventDetail[]): string {
    const listItems = data.map((item: CalendarEventDetail) => `
      <li color="${item.color}" class="detail-item" tabindex="0" data-id="${item.id}">
        <div class="calendar-detail-content">
          <ids-text font-size="18" font-weight="bold">${item.subject}</ids-text>
          <ids-text font-size="14">${item.dateRange}</ids-text>
          <ids-text font-size="14">${item.comments || ''}${item.status ? ` | ${item.status}` : ''}</ids-text>
        </div>
        <ids-text font-size="12" class="detail-item-duration">${item.duration}</ids-text>
        <ids-icon icon="caret-right"></ids-icon>
      </li>
    `).join('');

    return `<ul class="calendar-events-list">${listItems}</ul>`;
  }

  createNewEvent(id: string, modal = false) {
    const date = new Date(this.activeDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const event: CalendarEventData = {
      id,
      subject: 'New Event',
      isAllDay: 'true',
      starts: new Date(year, month, day).toISOString(),
      ends: new Date(year, month, day, 23, 59, 59, 999).toISOString(),
      type: 'dto',
      comments: 'New Event Comments'
    };

    if (modal) {
      const view = this.getView();
      const target = view.tagName === 'IDS-MONTH-VIEW' ? view.getSelectedDay() : this.container;
      this.#attachFormPopup(target, event);
    } else {
      this.addEvent(event);
    }
  }

  #eventFormTemplate(data: CalendarEventData): string {
    const eventType = this.getEventTypeById(data.type);
    const eventTypeOptions = this.eventTypesData.map((item: CalendarEventTypeData) => `
      <ids-list-box-option value="${item.id}">
        <ids-text>${item.label}</ids-text>
      </ids-list-box-option>
    `).join('');
    const start = new Date(data.starts);
    const end = new Date(data.ends);
    const formattedStart = this.locale.formatDate(start);
    const formattedEnd = this.locale.formatDate(end);
    const startHour = this.locale.formatHour(start.getHours() + (start.getMinutes() / 60));
    const endHour = this.locale.formatHour(end.getHours() + (end.getMinutes() / 60));

    return `
      <form id="event-form" data-id="${data.id}" slot="content" color="${eventType.color || 'azure'}">
        <div id="event-form-header" class="inline-container" color="${eventType?.color || 'azure'}">
          <ids-text font-size="16" font-weight="bold">${eventType?.label || ''}</ids-text>
          <ids-button data-action="close">
            <ids-icon slot="icon" icon="close"></ids-icon>
          </ids-button>
        </div>
        <div id="event-form-content">
          <ids-input size="full" id="event-subject" type="text" label="Subject" value="${data.subject}"></ids-input>
          <ids-dropdown size="full" id="event-type" label="Event Types" value="${data.type}">
            <ids-list-box>${eventTypeOptions}</ids-list-box>
          </ids-dropdown>
          <ids-checkbox id="event-is-all-day" label="All Day" checked="${data.isAllDay}"></ids-checkbox>
          <div class="inline-container">
            <ids-date-picker id="event-from-date" label="From" size="full" value="${formattedStart}" mask></ids-date-picker>
            <ids-time-picker id="event-from-hour" label="&nbsp" size="full" value="${startHour}"></ids-time-picker>
          </div>
          <div class="inline-container">
            <ids-date-picker id="event-to-date" label="To" size="full" value="${formattedEnd}" mask></ids-date-picker>
            <ids-time-picker id="event-to-hour" label="&nbsp" size="full" value="${endHour}"></ids-time-picker>
          </div>
          <ids-textarea size="full" id="event-comments" label="Comments" autoselect="true">${data.comments || ''}</ids-textarea>
        </div>
        <div id="event-form-actions" class="inline-container">
          <ids-button data-action="close">
            <idx-test translate-text="true" slot="text">Cancel</idx-test>
          </ids-button>
          <ids-button data-action="submit" type="submit">
            <idx-test translate-text="true" slot="text">Submit</idx-test>
          </ids-button>
        </div>
      </form>
    `;
  }

  /**
   * Attach calendar event handlers
   */
  #attachEventHandlers(): void {
    this.offEvent('dayselected.calendar-container');
    this.onEvent('dayselected.calendar-container', this.container, (evt: CustomEvent) => {
      evt.stopPropagation();
      this.#updateActiveDate(evt.detail.date);
      this.state.selected = evt.detail?.events || [];
      this.updateEventDetails(evt.detail?.events);
    });

    this.offEvent('viewchange.calendar-container');
    this.onEvent('viewchange.calendar-container', this.container, (evt: CustomEvent) => {
      evt.stopPropagation();
      this.#updateActiveDate(evt.detail.date);
      this.changeView(evt.detail.view);
      this.renderEventsData();
    });

    this.offEvent('datechange.calendar-container');
    this.onEvent('datechange.calendar-container', this.container, (evt: CustomEvent) => {
      evt.stopPropagation();
      this.#updateActiveDate(evt.detail.date);
      this.renderEventsData();
    });

    this.offEvent('change.calendar-legend');
    this.onEvent('change.calendar-legend', this.container.querySelector('.calendar-legend-pane'), (evt: any) => {
      evt.stopPropagation();
      this.#toggleEventType(evt.detail.elem, evt.detail.checked);
      this.relayCalendarData();
      this.updateEventDetails(this.state.selected);
    });

    this.offEvent('overflow-click.calendar-container');
    this.onEvent('overflow-click.calendar-container', this.container, (evt: CustomEvent) => {
      evt.stopPropagation();
      if (evt.detail.date) {
        this.#updateActiveDate(evt.detail.date);
        this.changeView('day');
        this.updateEventDetails(this.state.selected);
      }
    });

    this.offEvent('localechange.calendar-container');
    this.onEvent('localechange.calendar-container', this.closest('ids-container'), () => {
      this.updateEventDetails(this.state.selected);
      this.renderLegend(this.eventTypesData);
    });

    this.onEvent('click.details-item', this.container.querySelector('.calendar-details-pane'), (evt: any) => {
      const detailItem = evt.target.closest('.detail-item');
      if (detailItem) {
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        const id = detailItem.getAttribute('data-id');
        const eventData = this.getEventById(id);
        if (eventData) {
          this.#removePopup();
          this.#attachFormPopup(this.container, eventData);
        }
      }
    });

    this.offEvent('click-calendar-event', this);
    this.onEvent('click-calendar-event', this, (evt: CustomEvent) => {
      const elem = evt.detail.elem;
      this.#removePopup();
      this.#attachFormPopup(elem.container, elem.eventData);
    });
  }

  /**
   * Get IdsPopup containg calendar event form
   * @returns {IdsPopup} popup component
   */
  #getEventFormPopup(): IdsPopup {
    return this.container.querySelector('#event-form-popup');
  }

  /**
   * Attach calendar event form handlers
   */
  #attachFormEventHandlers(): void {
    const popup = this.#getEventFormPopup();

    this.offEvent('click.calendar-event-form', popup);
    this.onEvent('click.calendar-event-form', popup, (evt: any) => {
      if (evt.target && evt.target.tagName === 'IDS-BUTTON') {
        evt.stopPropagation();
        const action = evt.target.getAttribute('data-action');
        if (!action) return;

        if (action === 'close') {
          this.#removePopup();
          return;
        }

        if (action === 'submit') {
          const formElem = this.#getEventFormPopup().querySelector('#event-form');
          this.#submitEventForm(formElem);
          this.#removePopup();
        }
      }
    });

    this.offEvent('change.calendar-event-form', popup);
    this.onEvent('change.calendar-event-form', popup, (evt: any) => {
      evt.stopPropagation();
    });
  }

  /**
   * Insert event form popup into view.
   * Attach it to provided calendar event
   * @param {HTMLElement} target target to attach popup to
   * @param {CalendarEventData} eventData calendar event component
   */
  #attachFormPopup(target: HTMLElement, eventData: CalendarEventData): void {
    const template = `
      <ids-popup 
        id="event-form-popup"
        arrow="right"
        x="160"  
        align="center" 
        animated="false" 
        visible="false"
        type="menu" 
        position-style="absolute">
        ${this.#eventFormTemplate(eventData)}
      </ids-popup>
    `;

    this.container.insertAdjacentHTML('beforeend', template);
    const popup = this.#getEventFormPopup();
    this.#positionFormPopup(target, popup);
    this.#attachFormEventHandlers();
  }

  #positionFormPopup(target: HTMLElement, popup: any) {
    popup.alignTarget = target;
    popup.place();
    popup.visible = true;
  }

  /**
   * Remove calendar event form popup
   */
  #removePopup(): void {
    const popup = this.#getEventFormPopup();

    if (popup) {
      this.offEvent('click.calendar-event-form', popup);
      popup.remove();
    }
  }

  #submitEventForm(formElem: any) {
    // id
    const id = formElem.getAttribute('data-id');

    // subject
    const subject = formElem.querySelector('#event-subject')?.value;

    // event type
    const type = formElem.querySelector('#event-type')?.value;

    // is all day
    const isAllDay = formElem.querySelector('#event-is-all-day')?.checked === 'true' ? 'true' : 'false';

    // From dates
    const fromDate = formElem.querySelector('#event-from-date')?.value;
    const fromHour = formElem.querySelector('#event-from-hour')?.value;
    const starts = new Date(`${fromDate} ${fromHour}`).toISOString();

    // To Dates
    const toDate = formElem.querySelector('#event-to-date')?.value;
    const toHour = formElem.querySelector('#event-to-hour')?.value;
    const ends = new Date(`${toDate} ${toHour}`).toISOString();

    // Comments
    const comments = formElem.querySelector('#event-comments')?.value;

    const eventData: CalendarEventData = {
      id, subject, type, isAllDay, starts, ends, comments
    };

    this.updateEvent(eventData);
  }

  /**
   * Update event type data checked state
   * @param {IdsCheckbox} checkbox IdsCheckbox component
   * @param {boolean} checked true if checked
   */
  #toggleEventType(checkbox: IdsCheckbox, checked: boolean): void {
    const id = checkbox.getAttribute('data-id');
    const eventType = this.getEventTypeById(id);

    if (eventType) {
      eventType.checked = checked;
    }
  }

  /**
   * Changes view component
   * @param {CalendarViewTypes} view month | week | day
   */
  changeView(view: CalendarViewTypes = 'month'): void {
    const template = view === 'month'
      ? this.#createMonthTemplate()
      : this.#createWeekTemplate(view === 'day');

    this.insertViewTemplate(template);
    this.relayCalendarData();
    this.state.view = view;
  }

  /**
   * Inserts view component template
   * @param {string} template view component template
   */
  insertViewTemplate(template: string): void {
    const container = this.container.querySelector('.calendar-view-pane');
    container.innerHTML = template;
  }

  /**
   * Passes calendar event data to active view
   */
  relayCalendarData(): void {
    const viewElem = this.getView();
    const eventsData = this.#filterEventsByType(this.eventsData);

    if (viewElem) {
      viewElem.eventsData = eventsData;
      viewElem.eventTypesData = this.eventTypesData;
    }
  }

  /**
   * Updates active date
   * Reflects date attribute without re-render
   * @param {Date} date active date
   */
  #updateActiveDate(date: Date): void {
    this.state.skipRender = true;
    date = date || this.activeDate;
    const dateAttr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    this.setAttribute('date', dateAttr);
    this.state.skipRender = false;
  }

  #getSelectedEvents(): CalendarEventData[] {
    // if month view, query events and update details
    const view = this.getView();
    if (view && view.tagName === 'IDS-MONTH-VIEW') {
      this.state.selected = view.getActiveDayEvents();
      return this.state.selected;
    }

    return [];
  }

  /**
   * Renders IdsMonthView component
   * @returns {string} ids month view template
   */
  #createMonthTemplate(): string {
    const date = this.activeDate;

    return `
      <ids-month-view 
        view-picker
        show-today
        month="${date.getMonth()}" 
        day="${date.getDate()}" 
        year="${date.getFullYear()}" 
      ></ids-month-view>
    `;
  }

  /**
   * Renders IdsWeekView component
   * @param {boolean} isDayView show day view
   * @returns {string} ids week view template
   */
  #createWeekTemplate(isDayView = false): string {
    const activeDate = this.activeDate;
    const startDate = new Date(activeDate);
    const endDate = new Date(activeDate);

    if (!isDayView) {
      // adjust dates for start and end of week
      startDate.setDate(activeDate.getDate() - activeDate.getDay());
      endDate.setDate(activeDate.getDate() + (6 - activeDate.getDay()));
    }

    return `
      <ids-week-view 
        start-date="${startDate}" 
        end-date="${endDate}" 
        view-picker
      ></ids-week-view>
    `;
  }

  /**
   * Filters calendar events by checked event types
   * @param {Array<CalendarEventData>} events Array<CalendarEventData>
   * @returns {Array<CalendarEventData>} Array<CalendarEventData>
   */
  #filterEventsByType(events: CalendarEventData[]): CalendarEventData[] {
    if (!this.eventTypesData?.length) return events;

    // filter for checked event types
    const eventTypes = this.eventTypesData
      .filter((item: CalendarEventTypeData) => item.checked)
      .map((item: CalendarEventTypeData) => item.id);

    return events.filter((e: any) => eventTypes.includes(e.type));
  }

  /**
   * Create localized date range string
   * @param {Date} start start date
   * @param {Date} end end date
   * @returns {string} localized date range
   */
  formatDateRange(start: Date, end: Date): string {
    const dateTimeOpts = { dateStyle: 'long', timeStyle: 'short' };
    const startDateStr = this.locale.formatDate(start, dateTimeOpts);
    const endDateStr = this.locale.formatDate(end, dateTimeOpts);

    return `${startDateStr} - ${endDateStr}`;
  }

  /**
   * Create localized duration string
   * @param {Date} start start date
   * @param {Date} end end date
   * @returns {string} duration string
   */
  formatDuration(start: Date, end: Date): string {
    const hours = dateDiff(start, end, true);

    // Day(s)
    if (hours >= 24) {
      const days = Math.round(hours / 24);
      const dayStr = this.locale.translate(days === 1 ? 'Day' : 'Days');
      return `${this.locale.parseNumber(days.toString())} ${dayStr}`;
    }

    // Minute(s)
    if (hours < 1) {
      const startMinutes = start.getMinutes();
      const endMinutes = end.getMinutes();
      const diffMinutes = endMinutes - startMinutes;
      const minutesStr = this.locale.translate(diffMinutes === 1 ? 'Minute' : 'Minutes');
      return `${this.locale.parseNumber(diffMinutes.toString())} ${minutesStr}`;
    }

    // Hour(s)
    const hoursStr = this.locale.translate(hours === 1 ? 'Hour' : 'Hours');
    return `${this.locale.parseNumber(hours.toString())} ${hoursStr}`;
  }

  /**
   * Formats calendar event data for detail views
   * @param {CalendarEventData} event calendar event data
   * @returns {CalendarEventDetail} detail data
   */
  #formatDetailData(event: CalendarEventData): CalendarEventDetail {
    const startDate = new Date(event.starts);
    const endDate = new Date(event.ends);
    const eventType = this.getEventTypeById(event.type);

    return {
      ...event,
      dateRange: this.formatDateRange(startDate, endDate),
      duration: this.formatDuration(startDate, endDate),
      eventType: event.type,
      color: eventType?.color || 'azure'
    };
  }

  /**
   * Updates detail view with selected day events
   * @param {CalendarEventData[]} selected selected calendar events data
   */
  updateEventDetails(selected?: CalendarEventData[]): void {
    const container = this.container.querySelector('.calendar-details-pane');
    if (!this.showDetails || !container) return;

    // if not month view, clear details container
    const view = this.getView();
    if (view?.tagName !== 'IDS-MONTH-VIEW') {
      container.innerHTML = '';
      return;
    }

    selected = selected || this.#getSelectedEvents() || [];
    selected = this.#filterEventsByType(selected);
    const details = selected.map((event: CalendarEventData) => this.#formatDetailData(event));

    container.innerHTML = this.state.isMobile
      ? this.detailListTemplate(details)
      : this.detailAccordionTemplate(details);
  }

  /**
   * Add new calendar event data to collection
   * @param {CalendarEventData} eventData event data
   */
  addEvent(eventData: CalendarEventData): void {
    this.eventsData = this.eventsData.concat(eventData);

    this.triggerEvent('eventadded', this, {
      detail: { eventData },
      bubbles: true,
      cancelable: true,
      composed: true
    });
  }

  /**
   * Update existing calendar event and rerender events
   * If event doesn't exist, it creates new calendar event
   * @param {CalendarEventData} data event data
   */
  updateEvent(data: CalendarEventData): void {
    const events: CalendarEventData[] = this.eventsData.slice(0);
    const event = events.find((item: CalendarEventData) => item.id === data.id);

    if (event) {
      const eventData = Object.assign(event, data);
      this.eventsData = events;

      this.triggerEvent('eventupdated', this, {
        detail: { eventData },
        bubbles: true,
        cancelable: true,
        composed: true
      });
    } else {
      this.addEvent(data);
    }
  }

  /**
   * Remove calendar events data and components
   */
  clearEvents(): void {
    this.eventsData = [];
    this.beforeEventsRender = null;
  }

  /**
   * Renders event type legend if none provided
   * @param {CalendarEventTypeData[]} eventTypes event types
   */
  renderLegend(eventTypes: CalendarEventTypeData[] = []): void {
    // remove previous accordion
    this.querySelector('#event-types-legend')?.remove();

    if (!this.showLegend || !eventTypes.length || this.querySelector('[slot="legend"]')) return;

    const checkboxes = eventTypes.map((item: CalendarEventTypeData) => `
      <ids-checkbox 
        class="event-type-checkbox"
        checked="${item.checked}"
        data-id="${item.id}" 
        label="${item.translationKey ? this.locale.translate(item.translationKey) : item.label}" 
        color="${item.color}07"
        disabled="${item.disabled || 'false'}">
      </ids-checkbox>
    `).join('');

    const accordion = `
      <ids-accordion id="event-types-legend" slot="legend">
        <ids-accordion-panel expanded="true">
          <ids-accordion-header slot="header" expander-type="caret" expanded="true">
            <ids-text translate-text="true">Legend</ids-text>
          </ids-accordion-header>
          <div slot="content"><p>${checkboxes}</p></div>
        </ids-accordion-panel>
      </ids-accordion>
    `;

    this.insertAdjacentHTML('afterbegin', accordion);
  }

  /**
   * Gets current view component
   * @returns {IdsMonthView|IdsWeekView} current view component
   */
  getView(): IdsMonthView | IdsWeekView {
    return this.container.querySelector('ids-month-view') || this.container.querySelector('ids-week-view');
  }

  /**
   * Toggle Month View Legend
   * @param {CalendarEventTypeData[]} eventTypes calendar event types data
   * @param {boolean} show toggle legend
   */
  #toggleMonthLegend(eventTypes: CalendarEventTypeData[], show: boolean): void {
    const component = this.getView();

    if (!(component instanceof IdsMonthView)) return;

    let legendData: Array<any> | null = null;

    if (show && Array.isArray(eventTypes) && eventTypes.length) {
      legendData = eventTypes.map((item: CalendarEventTypeData) => ({
        name: item.label,
        color: `${item.color}-60`,
        dayOfWeek: [],
        cssClass: 'event-type',
        fontSize: 14
      }));
    }

    component.legend = legendData;
  }

  /**
   * Handle resize changes and toggle mobile/desktop elements
   * @param {ResizeObserverEntry[]} entries resize entries
   */
  #onResize(entries: ResizeObserverEntry[]) {
    const width = entries[0].contentRect.width;
    const isMobile = width <= this.#mobileBreakpoint;

    if (this.state.isMobile !== isMobile) {
      this.state.isMobile = isMobile;
      this.updateEventDetails(this.state.selected);
      this.#toggleMonthLegend(this.eventTypesData, isMobile);
    }
  }

  /**
   * @returns {Date} start date
   */
  get startDate(): Date {
    const start = this.getView().startDate;

    if (!start) {
      const date = new Date(this.activeDate);
      date.setDate(1);
      return date;
    }

    return start;
  }

  /**
   * @returns {Date} end date
   */
  get endDate(): Date {
    const end = this.getView().endDate;

    if (!end) {
      const date = new Date(this.activeDate);
      date.setMonth(date.getMonth() + 1);
      date.setDate(0);
      return date;
    }

    return end;
  }

  /**
   * Renders calendar events
   * @param {boolean} forceRender skip events fetch and render data
   * @returns {Promise<CalendarEventData>} calendar events
   */
  async renderEventsData(forceRender = false) {
    if (!forceRender && typeof this.state.beforeEventsRender === 'function') {
      this.eventsData = await this.state.beforeEventsRender(this.startDate, this.endDate);
      return;
    }

    if (!Array.isArray(this.eventsData)) return;

    this.relayCalendarData();
    this.updateEventDetails();
  }
}
