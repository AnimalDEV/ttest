/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";
const Instruction = require("./Instruction");

/**
 *
 */
class Loop extends Instruction {
	/**
	 *
	 * @param pipeline
	 * @param args
	 */
	constructor(pipeline, args) {
		super(pipeline, args);
		const instructions = this.args;
		const _pipeline = new pipeline.constructor(this.pipeline.parser, this.pipeline.scope);
		_pipeline.prepare(instructions);
		this._pipeline = _pipeline;
	}

	/**
	 *
	 * @param data
	 * @returns {null|*}
	 */
	execute(data) {
		if (data == null) {
			return null;
		}
		return data.map((value) => this._pipeline.execute(value));
	}
}

module.exports = Loop;
