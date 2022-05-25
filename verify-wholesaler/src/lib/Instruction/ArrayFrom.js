/**
 * @author Maciej Lasoń <maciejlason3@gmail.com>
 */
"use strict";
const Instruction = require("./Instruction");

class ArrayFrom extends Instruction {
	execute(data) {
		if (data == null) {
			return null;
		}

		return this.args.map((instructions) => {
			const pipeline = new this.pipeline.constructor(this.pipeline.parser, this.pipeline.scope);
			pipeline.prepare(instructions);
			return pipeline.execute(data);
		});
	}
}

module.exports = ArrayFrom;
