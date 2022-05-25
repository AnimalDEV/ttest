/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";
const Instruction = require("./Instruction");

class Join extends Instruction {
	execute(data) {
		if (data == null) {
			return null;
		}

		const [glue] = this.args;

		// noinspection JSPotentiallyInvalidConstructorUsage
		return [].constructor.prototype.join.call(data, glue);
	}
}

module.exports = Join;
