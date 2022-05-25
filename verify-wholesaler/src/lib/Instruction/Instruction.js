/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";

/**
 *
 */
class Instruction {
	/**
	 *
	 * @param pipeline
	 * @param args
	 */
	constructor(pipeline, args) {
		this.pipeline = pipeline;
		this.args = args;
	}

	/**
	 * @param data
	 * @return *
	 */
	execute(data) {
		throw new Error("Instruction.execute not implemented");
	};
}

module.exports = Instruction;
