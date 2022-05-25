/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";
const XML = require("./Parser/XML");
const fs = require("fs");
const dbg = require("debug")("debug:Integration:SimpleMapper");
const ExtError = require("exterror");
const iconv = require("iconv-lite");

/**
 *
 */
class SimpleMapper {
	/**
	 *
	 * @param env
	 * @param config
	 */
	constructor(env, config) {
		this.env = env;
		this.config = config;
		if (config?.src?.url == null) {
			throw new ExtError("ERR_MISSING_REQUIRED_PARAMETER_PARSER_CONFIG_SRC_URL", "Missing required parameter 'config.src.url'");
		}
	}

	/**
	 *
	 * @returns {Promise<XML>}
	 */
	async createStream(filepath) {
		let parser;

		switch (this.config.parser.type) {
			case "XML":
				// lowered highWaterMark for more frequent ticks

				const readStream = fs.createReadStream(filepath, {
					encoding: typeof this.config.parser?.config?.encoding === "string" ? null : "utf8"
				});

				readStream.pause();


				let converterStream;
				if (typeof this.config.parser?.config?.encoding === "string") {
					converterStream = readStream.pipe(iconv.decodeStream(this.config.parser?.config?.encoding));
				}

				readStream.on("close", () => dbg("readStream closed"));
				parser = new XML({
					map: this.config.map,
					readStream: converterStream ? converterStream : readStream,
					emitTag: this.config.parser.config.emit
				});
				break;
			default:
				throw new ExtError("ERR_UNKNOWN_PARSER_TYPE", `Unknown parser type '${this.config.parser.type}'`);
		}
		return parser;
	}
}

module.exports = SimpleMapper;
