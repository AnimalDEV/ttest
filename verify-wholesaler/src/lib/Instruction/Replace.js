/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";
const Instruction = require("./Instruction");
const {regexp_escape} = require("@etk/common");

class Replace extends Instruction {
	execute(data) {
		if (data == null) {
			return null;
		}

		const [search, replace] = this.args;

		if (typeof search !== "string" || !["string", "number"].includes(typeof replace)) {
			return null;
		}

		// noinspection JSPotentiallyInvalidConstructorUsage
		return String(data).replace(new RegExp(regexp_escape(search), "g"), replace);
	}
}

module.exports = Replace;
