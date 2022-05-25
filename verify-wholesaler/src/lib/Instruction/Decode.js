/**
 * @author Maciej Lasoń <maciejlason3@gmail.com>
 */
"use strict";
const Instruction = require("./Instruction");
const entities = require("entities");

class Decode extends Instruction {
	execute(data) {
		if (data == null) {
			return null;
		}
		return entities.decodeHTML(data);
	}
}

module.exports = Decode;
