/**
 * @author Maciej Lasoń <maciejlason3@gmail.com>
 */
"use strict";
const Instruction = require("./Instruction");
const math = require("../../math");

class Subtract extends Instruction {
	execute(data) {
		return math(this, data, (a, b) => a - b);
	}
}

module.exports = Subtract;

