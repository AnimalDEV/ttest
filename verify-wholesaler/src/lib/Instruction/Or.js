/**
 * @author Maciej Lasoń <maciejlason3@gmail.com>
 */
"use strict";
const Instruction = require("./Instruction");

class Or extends Instruction {
	execute(data) {
		if (data == null) {
			return null;
		}
		for (const instructions of this.args) {
			const pipeline = new this.pipeline.constructor(this.pipeline.parser, this.pipeline.scope);
			pipeline.prepare(instructions);
			const result = pipeline.execute(data);
			if (result) {
				return result;
			}
		}
	}
}

module.exports = Or;
