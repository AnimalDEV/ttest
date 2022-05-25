/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";
const ExtError = require("exterror");
const Instruction = require("../../Instruction/Instruction");

/**
 *
 */
class Get extends Instruction {
	/**
	 *
	 * @param data
	 * @returns {null|*|[]}
	 */
	execute(data) {
		if (data == null) {
			return null;
		}
		const [path] = this.args;
		if (typeof path !== "string" || !path.trim().length) {
			throw new ExtError("ERR_INS_GET_MISSING_PATH", "Incorrect 'path' argument in 'Get' instruction");
		}

		return this.get(path, data);
	}

	/**
	 *
	 * @param path
	 * @param node
	 * @param all
	 * @returns {*|[]}
	 */
	get(path, node, all = false) {
		function get(path, node) {
			const many = [];

			let key = path.shift();

			let last = !path.length;

			if (key[0] === "@") {
				if (!last) {
					throw new ExtError("attr not empty path");
				}

				return node.attributes[key.slice(1)];
			}

			if (key === "#text") {
				if (!last) {
					throw new ExtError("text not empty path");
				}

				return node.toString();
			}

			let childNodes = node.children;
			if (!childNodes) {
				childNodes = [];
			}

			let attrName, operator, attrValue, _case;

			const matches = key.match(/([a-z][a-z0-9:_-]*|\*)\[([a-z][a-z0-9:_-]*)([*^$~]?)='([^']*)'\s?([si]?)]/);
			if (matches) {
				[
					,
					key,
					attrName,
					operator,
					attrValue,
					_case
				] = matches;
			}

			if (key !== "*") {
				childNodes = childNodes.filter(({name}) => key === name);
			}

			if (attrName) {
				const matchNode = function (actual, expected, _case) {
					if (_case === "i") {
						if (typeof actual === "string") {
							actual = actual.toLocaleLowerCase();
						}
						if (typeof expected === "string") {
							expected = expected.toLocaleLowerCase();
						}
					}
					switch (operator) {
						case "*":
							return actual.includes(expected);
						case "^":
							return actual.startsWith(expected);
						case "$":
							return actual.endsWith(expected);
						case "~":
							return actual.split(/[s,]+/).filter(Boolean).includes(expected);
						default:
							return expected === actual;
					}
				};
				childNodes = childNodes.filter((node) => {
					return node.attributes.hasOwnProperty(attrName) && matchNode(node.attributes[attrName], attrValue, operator, _case);
				});
			}

			if (last) {
				if (all) {
					return childNodes;
				}
				return childNodes.shift();
			}

			for (const childNode of childNodes) {
				const result = get(path.slice(), childNode);
				if (result != null) {
					if (!all) {
						return result;
					}
					if (Array.isArray(result)) {
						many.push(...result);
					} else {
						many.push(result);
					}
				}
			}

			return many.length ? many : null;
		}

		return get(path.split("."), node);
	}
}

module.exports = Get;
