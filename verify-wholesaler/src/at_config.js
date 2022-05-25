/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";

/**
 *
 * @param {object} wholesaleConfig
 * @param {object} config
 * @returns {object}
 */
function atConfig(wholesaleConfig, config) {
	function replace(object) {
		return Object.entries(object).reduce((result, [key, value]) => {
			if (value != null && typeof value === "object") {
				result[key] = replace(value);
			} else {
				if (typeof value === "string" && value.startsWith("@config")) {
					const match = value.match(/^@config\.(.+)$/);
					const path = match[1].split(".");
					result[key] = getObjectValue(wholesaleConfig, path);
				} else {
					result[key] = value;
				}
			}
			return result;
		}, Array.isArray(object) ? [] : {});
	}

	return replace(config);
}

/**
 *
 * @param {object} object
 * @param {string[]} path
 * @returns {*}
 */
function getObjectValue(object, path) {
	return path.reduce((value, key) => value?.[key], object);
}

module.exports = {
	atConfig,
	getObjectValue
};
