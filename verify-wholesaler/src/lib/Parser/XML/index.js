/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";
const {Readable} = require("stream");
const sax = require("sax");
const ExtError = require("exterror");

const dbg = require("debug")("debug:Parser:XML");
const err = require("debug")("error:Parser:XML");

const Node = require("../Node");
const Get = require("./Get");
const GetAll = require("./GetAll");
const Pipeline = require("../../Pipeline");

/**
 *
 */
class XML extends Readable {
	constructor({
		map,
		readStream,
		emitTag
	}) {
		super({
			objectMode: true
		});

		if (map) {
			this.pipelines = Object.entries(map).map(([key, instructions]) => {
				const pipeline = new Pipeline(this);
				pipeline.prepare(instructions);
				return [
					key,
					pipeline
				];
			});
		}

		this.emitTag = emitTag;

		/*if(!(readStream instanceof Readable)) {
			throw new ExtError("ERR_READSTREAM_IS_NOT_READABLE", "'readStream' is not readable");
		}*/
		this.readStream = readStream;

		this.readStream.on("error", (err) => {
			this.destroy(err);
		});

		this.readStream.on("data", (data) => {
			if (data) {
				this.sax.write(data);
			}
		});

		this.readStream.on("close", () => {
			this.sax.end();
		});

		// noinspection JSUnresolvedFunction
		this.sax = sax.parser(false, {
			trim: true,
			lowercase: true,
			xmlns: true,
			position: true,
			strictEntities: false
		});

		this.currentNode = null;
		this.innerMode = false;
		this.stack = [];
		this.path = [];
		this.emitted = 0;

		this.sax.onend = () => {
			dbg("SAX ended, ending reader ...");
			this.push(null);
		};

		this.sax.onerror = (error) => {
			this.destroy(error);
		};

		this.sax.onopentag = (node) => {
			dbg("SAX:onopentag '%s'", node.name);
			const {
				name,
				attributes
			} = node;

			this.path.push(name);

			const pathStr = this.path.join(".");

			if (pathStr === this.emitTag || this.innerMode) {
				this.innerMode = true;
				const currentNode = new Node({
					type: "tag",
					name,
					attributes: Object.values(attributes).reduce((obj, {
						name,
						value
					}) => Object.assign(obj, {[name]: value}), {})
				});
				if (this.currentNode) {
					this.currentNode.children.push(currentNode);
				}
				this.currentNode = currentNode;
				this.stack.push(this.currentNode);
			}
		};

		this.sax.ontext = (text) => {
			dbg("SAX:ontext '%s'", text.slice(0, 16));
			if (this.innerMode) {
				this.currentNode.children.push(new Node({
					type: "text",
					value: text,
					attributes: {}
				}));
			}
		};
		this.sax.onopencdata = () => {
			dbg("SAX:onopencdata");
			if (this.innerMode) {
				this.currentNode.children.push(new Node({
					type: "cdata",
					value: ""
				}));
			}
		};
		this.sax.oncdata = (text) => {
			dbg("SAX:oncdata '%s'", text);
			if (this.innerMode) {
				_last(this.currentNode.children).value += text;
			}
		};
		this.sax.onclosecdata = () => {
			dbg("SAX:closecdata");
		};

		this.sax.onclosetag = (name) => {
			dbg("SAX:onclosetag '%s'", name);
			if (name !== _last(this.path)) {
				err("SAX close tag mismatch. Expected: '%s', got '%s'", _last(this.path), name);
			}

			const currentNode = this.stack.pop();
			this.currentNode = _last(this.stack);
			const pathStr = this.path.join(".");
			if (pathStr === this.emitTag) {
				this.innerMode = false;
				dbg("Pushing node");
				try {
					const node = this.pipelines ? Object.fromEntries(this.pipelines.map(([key, pipeline]) => {
						return [
							key,
							pipeline.execute(currentNode)
						];
					})) : currentNode;
					if (!this.push(node)) {
						if (!this.readStream.isPaused()) {
							dbg("Pausing read stream");
							this.readStream.pause();
						}
					}
					this.emitted++;
				} catch (e) {
					this.destroy(e);
				}
			}

			this.path.pop();
		};
	}

	get instructions() {
		return {
			Get,
			GetAll
		};
	}

	/**
	 *
	 * @param _
	 * @private
	 */
	_read(_) {
		dbg("_read");
		if (this.readStream.isPaused()) {
			this.readStream.resume();
		}
	}

	/**
	 *
	 * @param error
	 * @param callback
	 * @private
	 */
	_destroy(error, callback) {
		dbg("_destroy");
		try {
			this.readStream.destroy();
			this.sax.end();
			if (error) {
				this.emit("error", error);
			}
			callback();
		} catch (e) {
			callback(e);
		}
	}
}

/**
 *
 * @param {Array} arr
 * @returns {*}
 * @private
 */
function _last(arr) {
	if (arr.length - 1 < 0) {
		return;
	}
	return arr[arr.length - 1];
}

module.exports = XML;
