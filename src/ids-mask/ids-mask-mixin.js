import maskAPI from './ids-mask-global';

/**
 * Adds validation to any input field
 * @param {any} superclass Accepts a superclass and creates a new subclass from it
 * @returns {any} The extended object
 */
const IdsMaskMixin = (superclass) => class extends superclass {
  constructor() {
    super();
    this.maskState = {};
  }

  static get properties() {
    const theseProps = [
      'mask-pattern',
      'mask-pattern-options'
    ];

    if (Array.isArray(super.properties)) {
      return super.properties.concat(theseProps);
    }
    return theseProps;
  }

  /**
   * @readonly
   * @returns {IdsMask} reference to a global IDS Mask instance
   */
  get maskAPI() {
    return maskAPI;
  }

  /**
   * @returns {object} defined Mask options
   */
  get maskOptions() {
    return this.maskState.options;
  }

  /**
   * @param {object} val incoming Mask options
   */
  set maskOptions(val) {
    if (typeof val === 'object') {
      this.maskState.pattern = val;
    }
  }

  /**
   * Retrieves the currently-stored mask pattern.
   * @returns {Function|Array<string|RegExp>} representing the stored mask pattern
   */
  get maskPattern() {
    return this.maskState.pattern;
  }

  /**
   * Sets the Mask pattern to be used.
   * @param {string|Function|Array<string|RegExp>} val the mask pattern on which to conform input
   */
  set maskPattern(val) {
    let trueVal;

    // In cases where the mask is a string (Legacy Soho Mask), the string is automatically converted
    // to an array containing regex patterns.
    // In cases where the mask is a function, the function call is stored and called when the mask
    // needs to be processed.
    if (Array.isArray(val) || typeof val === 'function') {
      trueVal = val;
    } else if (typeof val === 'string') {
      trueVal = maskAPI._convertPatternFromString(val);
    }

    this.maskState.pattern = trueVal;
  }

  /**
   * @param {string} rawValue the value to be checked for masking.
   * @param {IdsMaskOptions} opts various options that can be passed to the masking process.
   * @returns {IdsProcessedMaskValue} the result of the mask
   */
  processMask(rawValue, opts) {
    return maskAPI.process(rawValue, opts);
  }
};

export default IdsMaskMixin;
