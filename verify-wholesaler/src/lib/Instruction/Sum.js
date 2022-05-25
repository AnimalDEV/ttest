/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";
const Instruction = require("./Instruction");
const math = require("../../math");

class Sum extends Instruction {
	execute(data) {
		return math(this, data, (a, b) => a + b);
	}
}

module.exports = Sum;
