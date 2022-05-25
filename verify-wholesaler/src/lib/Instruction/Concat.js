/**
 * @author Maciej Lasoń <maciejlason3@gmail.com>
 */
"use strict";
const Instruction = require("./Instruction");

class Concat extends Instruction {
	execute(data) {
		if (data == null) {
			return null;
		}
		const instructionResults = this.args.map((instruction) => {
			const pipeline = new this.pipeline.constructor(this.pipeline.parser, this.pipeline.scope);
			pipeline.prepare([instruction]);
			return pipeline.execute(data);
		});
		return instructionResults.join("");
	}
}

module.exports = Concat;
