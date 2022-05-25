/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";
const Instruction = require("./Instruction");

class Trim extends Instruction {
	execute(data) {
		if (data == null) {
			return null;
		}

		// noinspection JSPotentiallyInvalidConstructorUsage
		return String(data).trim();
	}
}

module.exports = Trim;
