/**
 * @author Maciej Lasoń <maciejlason3@gmail.com>
 */
"use strict";
/**
 *
 * @param self
 * @param data
 * @param callback
 * @returns {null|number}
 */
module.exports = (self, data, callback) => {
	if (data == null) {
		return null;
	}
	const instructionResults = self.args.map((instruction) => {
		const pipeline = new self.pipeline.constructor(self.pipeline.parser, self.pipeline.scope);
		pipeline.prepare(Array.isArray(instruction) ? instruction : [instruction]);
		return pipeline.execute(data);
	});
	let [result] = instructionResults.splice(0, 1);
	result = parseFloat(result);
	for (const number of instructionResults) {
		result = callback(result, parseFloat(number));
	}
	return Number.isNaN(result) ? null : result;
};
