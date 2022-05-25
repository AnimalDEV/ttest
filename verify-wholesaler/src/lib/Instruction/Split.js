/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";
const Instruction = require("./Instruction");

class Split extends Instruction {
	execute(data) {
		if (data == null) {
			return null;
		}

		const [separator] = this.args;

		// noinspection JSPotentiallyInvalidConstructorUsage
		return String(data).split(separator);
	}
}

module.exports = Split;
