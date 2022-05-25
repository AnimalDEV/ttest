/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";
const Join = require("./Join");
const Loop = require("./Loop");
const Map = require("./Map");
const Replace = require("./Replace");
const Split = require("./Split");
const Trim = require("./Trim");
const ArrayFrom = require("./ArrayFrom");
const Multiply = require("./Multiply");
const Divide = require("./Divide");
const Const = require("./Const");
const Subtract = require("./Subtract");
const Or = require("./Or");
const Concat = require("./Concat");
const At = require("./At");
const Sum = require("./Sum.js");
const Decode = require("./Decode.js");

module.exports = {
	Join,
	Loop,
	Map,
	Replace,
	Split,
	Trim,
	Array: ArrayFrom,
	Multiply,
	Divide,
	Const,
	Subtract,
	Or,
	Concat,
	At,
	Sum,
	Decode
};
