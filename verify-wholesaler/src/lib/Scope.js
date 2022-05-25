/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";

/**
 *
 */
class Scope {
	/**
	 *
	 * @param {Scope} [parentScope]
	 */
	constructor(parentScope) {
		/**
		 *
		 * @type {Map<any, any>}
		 */
		this.data = new Map;
		/**
		 *
		 * @type {Scope}
		 */
		this.parentScope = parentScope;
	}

	/**
	 *
	 * @param {string} key
	 * @returns {null|any}
	 */
	get(key) {
		if (this.data.has(key)) {
			return this.data.get(key);
		}
		if (this.parentScope instanceof Scope) {
			return this.parentScope.get(key);
		}
		return null;
	}

	/**
	 *
	 * @param {string} key
	 * @param {any} value
	 */
	set(key, value) {
		this.data.set(key, value);
	}
}

module.exports = Scope;
