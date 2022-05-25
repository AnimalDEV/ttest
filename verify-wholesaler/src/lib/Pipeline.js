/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";
const ExtError = require("exterror");
const instructions = require("./Instruction");
const Scope = require("./Scope");

// TODO move to common
function camelize(str) {
	return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
		if (+match === 0) {
			return "";
		} // or if (/\s+/.test(match)) for white spaces
		return index === 0 ? match.toLowerCase() : match.toUpperCase();
	});
}

/**
 *
 */
class Pipeline {
	/**
	 *
	 * @param parser
	 * @param parentScope
	 */
	constructor(parser, parentScope) {
		this.parser = parser;
		this.pipeline = [];
		this.instructions = Object.fromEntries(Object.entries(Object.assign({}, instructions, parser.instructions)).map(([key, value]) => ([
			camelize(key),
			value
		])));
		this.scope = new Scope(parentScope);
	}

	/**
	 *
	 * @param instruction
	 * @returns {{args: any, name: string}}
	 */
	static prepareInstruction(instruction) {
		if (typeof instruction === "string") {
			instruction = {[instruction]: null};
		}
		const keys = Object.keys(instruction);
		if (keys.length > 1) {
			throw new ExtError("Inst too long");
		}
		const name = keys[0];
		let args = instruction[name];
		if (!Array.isArray(args)) {
			args = [args];
		}
		return {
			name,
			args
		};
	}

	/**
	 *
	 * @param instructions
	 */
	prepare(instructions) {
		for (const instruction of instructions) {
			const {
				name,
				args
			} = Pipeline.prepareInstruction(instruction);
			if (!this.instructions.hasOwnProperty(name) || typeof this.instructions[name] !== "function") {
				throw new ExtError("ERR_UNKNOWN_INSTRUCTION", `Unknown instruction '${name}'`);
			}
			this.pipeline.push(new this.instructions[name](this, args));
		}
	}

	/**
	 *
	 * @param {any} data
	 * @returns {any}
	 */
	execute(data) {
		//throw new ExtError("ASD", "asd");
		return this.pipeline.reduce((data, instruction) => instruction.execute(data), data);
	}
}

module.exports = Pipeline;
