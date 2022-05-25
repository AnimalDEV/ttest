/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";
const Instruction = require("./Instruction");

class Map extends Instruction {
	execute(data) {
		if (data == null) {
			return null;
		}

		const map = this.args;

		return Object.fromEntries(Object.entries(map[0]).map(([key, instructions]) => {
			const Pipeline = require("../Pipeline");
			const pipeline = new Pipeline(this.pipeline.parser, this.pipeline.scope);
			pipeline.prepare(instructions);
			return [
				key,
				pipeline.execute(data)
			];
		}));
	}
}

module.exports = Map;
