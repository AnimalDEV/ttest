/**
 * @author Maciej Lasoń <maciejlason3@gmail.com>
 */
"use strict";
const Instruction = require("./Instruction");

class Const extends Instruction {
	execute(data) {
		return this.args[0];
	}
}

module.exports = Const;
