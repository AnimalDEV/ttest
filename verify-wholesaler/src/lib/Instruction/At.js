/**
 * @author Maciej Lasoń <maciejlason3@gmail.com>
 */
"use strict";
const Instruction = require("./Instruction");
const ExtError = require("exterror");

class At extends Instruction {
	execute(data) {
		if (!Array.isArray(data)) {
			return null;
		}

		let [index] = this.args;
		if(!Number.isFinite(index)) {
			throw new ExtError("ERR_INDEX_NOT_A_NUMBER", "Index should be a number");
		}
		if(index < 0) {
			index = data.length + index;
		}
		return data[index] ?? null;
	}
}

module.exports = At;
