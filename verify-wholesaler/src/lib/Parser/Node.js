/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";

class Node {
	constructor({
		type = "tag",
		name,
		attributes,
		value
	}) {
		this.name = name;
		this.value = value;
		this.type = type;
		this.attributes = attributes;
		this.children = [];
	}

	toString() {
		if (this.type === "text" || this.type === "cdata") {
			return this.value;
		}
		return this.children.join("");
	}
}

module.exports = Node;
