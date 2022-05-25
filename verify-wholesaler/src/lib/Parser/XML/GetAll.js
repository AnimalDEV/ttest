/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";
const Get = require("./Get");
const ExtError = require("exterror");

/**
 *
 */
class GetAll extends Get {
	/**
	 *
	 * @param data
	 * @returns {*|*[]|null}
	 */
	execute(data) {
		if (data == null) {
			return null;
		}
		const [path] = this.args;
		if (typeof path !== "string" || !path.trim().length) {
			throw new ExtError("ERR_INS_GET_MISSING_PATH", "Incorrect 'path' argument in 'GetAll' instruction");
		}

		return this.get(path, data, true);
	}
}

module.exports = GetAll;
