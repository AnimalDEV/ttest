/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";
const {Writable} = require("stream");
const {
	normalize
} = require("../product");

class ProductProcessor extends Writable {
	constructor({
		defaults,
		errors
	}) {
		super({
			objectMode: true,
			highWaterMark: 32
		});
		this.errors = errors;
		this.defaults = defaults;
		this.totalErrors = 0;
		this.totalProductsWithErrors = 0;
		this.totalProducts = 0;
		this.totalProductsWithoutImages = 0;
	}

	_write(product, encoding, callback) {
		this.totalProducts++;
		this.processProduct(product).then((doc) => {
			if(Object.keys(doc.$errors).length) {
				this.totalProductsWithErrors++;
			}
			if(!doc.images?.length) {
				this.totalProductsWithoutImages++;
			}
			callback();
		}).catch((error) => {
			this.totalErrors++;
			callback();
		});
	}

	/**
	 *
	 * @param product
	 * @returns {Promise<{meta: {source: {price: number, id: *, stock: number}}}>}
	 */
	async processProduct(product) {
		const {
			_id,
			$errors,
			...normalized
		} = normalize(product, this.defaults);
		const errors = Object.values($errors);

		if (errors.length) {
			for (const [key, {code}] of Object.entries($errors)) {
				if (!this.errors[key]) {
					this.errors[key] = {};
				}
				if (!this.errors[key][code]) {
					this.errors[key][code] = 0;
				}
				this.errors[key][code]++;
			}
		}

		return {
			...normalized,
			meta: {
				source: {
					_id,
					price: normalized?.price?.amount,
					stock: normalized?.stock?.available
				}
			},
			$errors: errors
		};
	}
}

module.exports = ProductProcessor;
