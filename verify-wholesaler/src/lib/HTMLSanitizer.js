/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";
const {JSDOM} = require("jsdom");

/**
 *
 */
class HTMLSanitizer {
	/**
	 *
	 * @param {object} [options]
	 * @param {Set} [options.stripTags]
	 * @param {Set} [options.removeTags]
	 * @param {Set} [options.remoteAttributes]
	 */
	constructor({
		stripTags,
		removeTags,
		remoteAttributes
	} = {}) {
		this.stripTags = stripTags || new Set([
			"font"
		]);
		this.removeTags = removeTags || new Set([
			"style",
			"script",
			"iframe",
			"object"
		]);
		this.removeAttributes = remoteAttributes || new Set([
			"onblur",
			"onerror",
			"onfocus",
			"onload",
			"onresize",
			"onscroll",
			"onafterprint",
			"onbeforeprint",
			"onbeforeunload",
			"onhashchange",
			"onlanguagechange",
			"onmessage",
			"onmessageerror",
			"onoffline",
			"ononline",
			"onpagehide",
			"onpageshow",
			"onpopstate",
			"onrejectionhandled",
			"onstorage",
			"onunhandledrejection",
			"onunload",
			"onbeforexrselect",
			"onabort",
			"oncancel",
			"oncanplay",
			"oncanplaythrough",
			"onchange",
			"onclick",
			"onclose",
			"oncontextmenu",
			"oncuechange",
			"ondblclick",
			"ondrag",
			"ondragend",
			"ondragenter",
			"ondragleave",
			"ondragover",
			"ondragstart",
			"ondrop",
			"ondurationchange",
			"onemptied",
			"onended",
			"onformdata",
			"oninput",
			"oninvalid",
			"onkeydown",
			"onkeypress",
			"onkeyup",
			"onloadeddata",
			"onloadedmetadata",
			"onloadstart",
			"onmousedown",
			"onmouseenter",
			"onmouseleave",
			"onmousemove",
			"onmouseout",
			"onmouseover",
			"onmouseup",
			"onmousewheel",
			"onpause",
			"onplay",
			"onplaying",
			"onprogress",
			"onratechange",
			"onreset",
			"onseeked",
			"onseeking",
			"onselect",
			"onstalled",
			"onsubmit",
			"onsuspend",
			"ontimeupdate",
			"ontoggle",
			"onvolumechange",
			"onwaiting",
			"onwebkitanimationend",
			"onwebkitanimationiteration",
			"onwebkitanimationstart",
			"onwebkittransitionend",
			"onwheel",
			"onauxclick",
			"ongotpointercapture",
			"onlostpointercapture",
			"onpointerdown",
			"onpointermove",
			"onpointerup",
			"onpointercancel",
			"onpointerover",
			"onpointerout",
			"onpointerenter",
			"onpointerleave",
			"onselectstart",
			"onselectionchange",
			"onanimationend",
			"onanimationiteration",
			"onanimationstart",
			"ontransitionrun",
			"ontransitionstart",
			"ontransitionend",
			"ontransitioncancel",
			"oncopy",
			"oncut",
			"onpaste",
			"onpointerrawupdate",
			"onbeforecopy",
			"onbeforecut",
			"onbeforepaste",
			"onsearch",
			"onfullscreenchange",
			"onfullscreenerror",
			"onwebkitfullscreenchange",
			"onwebkitfullscreenerror"
		]);
	}

	/**
	 *
	 * @param html
	 */
	sanitize(html) {
		if (typeof html !== "string" || !html.trim()) {
			return "";
		}
		const dom = new JSDOM(String(html));

		const {window: {document}} = dom;

		this.removeTags.forEach(name => {
			document.querySelectorAll(name).forEach(node => {
				node.parentNode.removeChild(node);
			});

		});

		let siblingNode = document.body.lastChild;

		// noinspection JSAssignmentUsedAsCondition
		do {
			this.sanitizeNode(siblingNode);
		} while (siblingNode = siblingNode?.previousSibling);
		return document.body.innerHTML.trim();
	}

	/**
	 *
	 * @param node
	 * @returns
	 */
	removeNodeAttributes(node) {
		if (node.attributes) {
			[...node.attributes].forEach(({name}) => {
				if (this.removeAttributes.has(name)) {
					node.removeAttribute(name);
				}
			});
		}
		return node;
	}

	/**
	 *
	 * @param node
	 */
	sanitizeNode(node) {
		if (!node) {
			return;
		}
		const childNodes = [...node.childNodes.values()];
		if (this.stripTags.has(node.nodeName.toLowerCase())) {
			childNodes.forEach((child) => {
				node.parentNode.appendChild(child);
			});
			node.parentNode.removeChild(node);
		} else {
			this.removeNodeAttributes(node);
		}
		childNodes.forEach(child => this.sanitizeNode(child));
	}
}

module.exports = HTMLSanitizer;
