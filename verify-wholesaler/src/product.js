/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";
const ExtError = require("exterror");
const HTMLSanitizer = require("./lib/HTMLSanitizer");
const sanitizer = new HTMLSanitizer();

function has(product, property) {
	const value = product[property];
	if (value == null) {
		return false;
	}
	if (typeof value === "string") {
		if (!value.trim()) {
			return false;
		}
	}
	return true;
}

/**
 *
 * @param {object} product
 * @param {object} defaults
 * @returns {object}
 */
function normalize(product, defaults = {}) {
	const intPattern = /^([1-9][0-9]*|0)(\.0+)?$/;
	const floatPattern = /^([1-9][0-9]*|0)(\.[0-9]+)?$/;
	const normalized = {
		$errors: {},
		price: {}
	};

	// ID
	normalized._id = String(product.id).trim();
	if (!normalized._id.length) {
		throw new ExtError("ERR_NORMALIZE_MISSING_PRODUCT_ID", "Missing product id");
	}

	// Name
	if (typeof product.name !== "string") {
		normalized.$errors.name = new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_NAME", "Incorrect product name");
	} else {
		normalized.name = String(product.name).trim();
		if (!normalized.name.length) {
			normalized.$errors.name = new ExtError("ERR_NORMALIZE_MISSING_PRODUCT_NAME", "Missing product name");
		}
	}

	// Price
	const price = +product.price;
	if (!price) {
		normalized.$errors.price = new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_PRICE", `Incorrect product price: '${product.price}'`);
	} else {
		normalized.price = {
			amount: price
		};
		normalized.purchase_price = price;
	}

	// Currency
	if (has(product, "currency")) {
		if (typeof product.currency !== "string") {
			normalized.$errors.currency = new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_CURRENCY", "Incorrect product currency");
		} else {
			normalized.price = Object.assign({}, normalized.price, {currency: String(product.currency).trim().toUpperCase()});
			if (!normalized.price.currency.length) {
				normalized.$errors.currency = new ExtError("ERR_NORMALIZE_EMPTY_PRODUCT_CURRENCY", "Incorrect product currency (empty)");
			}
			if (normalized.price.currency.length !== 3) {
				normalized.$errors.currency = new ExtError("ERR_NORMALIZE_PRODUCT_CURRENCY_INCORRECT_LENGTH", `Product currency has length of ${normalized.price.currency.length} instead of 3`);
			}
		}
	} else {
		if (!defaults.hasOwnProperty("currency")) {
			// FIXME
			//normalized.$errors.currency = new ExtError("ERR_NORMALIZE_MISSING_PRODUCT_CURRENCY", "Missing product currency");
			normalized.price = Object.assign({}, normalized.price, {currency: "PLN"});
		} else {
			normalized.price = Object.assign({}, normalized.price, {currency: defaults.currency});
		}
	}

	// Tax
	if (has(product, "tax")) {
		floatPattern.lastIndex = 0;
		if (!floatPattern.test(product.tax)) {
			normalized.$errors.tax = new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_TAX", `Incorrect product tax: ${product.tax}`);
		} else {
			const tax = Math.round(+String(product.tax).trim());
			if (isNaN(tax)) {
				normalized.$errors.tax = new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_TAX", `Incorrect product tax: '${product.tax}'`);
			} else {
				normalized.tax = tax;
			}
		}
	} else {
		if (!defaults.hasOwnProperty("tax")) {
			normalized.$errors.tax = new ExtError("ERR_NORMALIZE_MISSING_PRODUCT_TAX", "Missing product tax");
		}
		normalized.tax = defaults.tax;
	}

	// Quantity
	if (has(product, "quantity")) {
		intPattern.lastIndex = 0;
		if (!intPattern.test(product.quantity)) {
			normalized.$errors.quantity = new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_QUANTITY", `Incorrect product quantity (pattern): ${product.quantity}`);
		} else {
			const quantity = +String(product.quantity).trim();
			if (isNaN(quantity) || (quantity | 0) !== quantity) {
				normalized.$errors.quantity = new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_QUANTITY", `Incorrect product quantity: '${product.quantity}'`);
			} else {
				normalized.stock = {
					available: quantity,
					unit: "pcs"
				};
			}
		}
	} else {
		if (!product.variants?.length) {
			if (!defaults.hasOwnProperty("quantity")) {
				normalized.$errors.quantity = new ExtError("ERR_NORMALIZE_MISSING_PRODUCT_QUANTITY", "Missing product quantity");
			} else {
				normalized.stock = {
					available: defaults.quantity,
					unit: "pcs"
				};
			}
		}
	}

	// Category
	if (has(product, "category")) {
		const type = typeof product.category;
		if (type !== "string") {
			normalized.$errors.category = new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_CATEGORY_DATA_TYPE", `Incorrect product category data type, expected 'string', got '${product.category === null ? "null" : type}'`);
		} else {
			const category = product.category.split("^").map(chunk => chunk.trim()).filter(Boolean).join("^");
			if (!category.length) {
				normalized.$errors.category = new ExtError("ERR_NORMALIZE_EMPTY_PRODUCT_CATEGORY", "Incorrect product category (empty)");
			} else {
				normalized.category = category;
			}
		}
	} else {
		if (!defaults.hasOwnProperty("category")) {
			normalized.$errors.category = new ExtError("ERR_NORMALIZE_MISSING_PRODUCT_CATEGORY", "Missing product category");
		} else {
			normalized.category = defaults.category;
		}
	}

	// Images
	if (has(product, "images")) {
		const type = typeof product.images;
		if (!Array.isArray(product.images)) {
			normalized.$errors.images = new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_IMAGES_DATA_TYPE", `Incorrect product images data type, expected 'array', got '${product.images === null ? "null" : type}'`);
		} else {
			normalized.images = product.images.map(image => {
				const type = typeof image;
				if (type !== "string") {
					normalized.$errors.images = new ExtError("ERR_NORMALIZE_INCORRECT_IMAGE_DATA_TYPE", `Incorrect image data type, expected 'string', got '${type}'`);
					return;
				}
				return image.trim();
			}).filter(Boolean);
		}
	} else {
		normalized.images = [];
	}

	// Description
	if (has(product, "description")) {
		const type = typeof product.description;
		if (type !== "string") {
			normalized.$errors.description = new ExtError("ERR_NORMALIZE_INCORRECT_DESCRIPTION_DATA_TYPE", `Incorrect description data type, expected 'string', got '${product.description === null ? "null" : type}'`);
		} else {
			normalized.description = sanitizer.sanitize(product.description);
		}
	} else {
		/*if (!defaults.hasOwnProperty("description")) {
			normalized.$errors.description = new ExtError("ERR_NORMALIZE_MISSING_PRODUCT_DESCRIPTION", "Missing product description");
		}*/
		normalized.description = defaults.description || "";
	}

	// Manufacturer
	if (has(product, "manufacturer")) {
		const type = typeof product.manufacturer;
		if (type !== "string") {
			normalized.$errors.manufacturer = new ExtError("ERR_NORMALIZE_INCORRECT_MANUFACTURER_TYPE", `Incorrect manufacturer data type, expected 'string', got '${product.manufacturer === null ? "null" : type}'`);
		} else {
			normalized.manufacturer = product.manufacturer.trim();
			if (!normalized.manufacturer.length) {
				normalized.$errors.manufacturer = new ExtError("ERR_NORMALIZE_EMPTY_PRODUCT_MANUFACTURER", "Missing product manufacturer");
			}
		}
	} else {
		if (!defaults.hasOwnProperty("manufacturer")) {
			normalized.$errors.manufacturer = new ExtError("ERR_NORMALIZE_MISSING_PRODUCT_MANUFACTURER", "Missing product manufacturer");
		} else {
			normalized.manufacturer = defaults.manufacturer;
		}
	}

	// Parameters
	if (has(product, "parameters")) {
		const type = typeof product.parameters;
		if (!Array.isArray(product.parameters)) {
			normalized.$errors.parameters = new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_PARAMETERS_DATA_TYPE", `Incorrect product parameters data type, expected 'array', got '${product.parameters === null ? "null" : type}'`);
		} else {
			try {
				normalized.parameters = product.parameters.map(parameter => {
					const type = typeof parameter;
					if (parameter === null || type !== "object") {
						throw new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_PARAMETER_DATA_TYPE", `Incorrect parameter data type, expected 'object', got '${parameter === null ? "null" : type}'`);
					}
					const properties = Object.keys(parameter);
					if (properties.length !== 2 || !parameter.hasOwnProperty("name") || !parameter.hasOwnProperty("value")) {
						new ExtError("ERR_NORMALIZE_INCORRECT_PARAMETER_PROPERTIES", `Incorrect parameter properties: ${properties.join()}`);
					}
					const {
						name,
						value
					} = parameter;
					if (typeof name === "string" && name.trim().length && typeof value === "string" && value.trim().length) {
						return {
							name: name.trim(),
							value: value.trim()
						};
					}

				}).filter(Boolean);
			} catch (e) {
				normalized.$errors.parameters = e;
			}
		}
	} else {
		normalized.parameters = [];
	}

	// Delivery time
	if (has(product, "delivery_time")) {
		intPattern.lastIndex = 0;
		if (!intPattern.test(product.delivery_time)) {
			normalized.$errors.delivery_time = new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_DELIVERY_TIME", `Incorrect product delivery time: ${product.delivery_time}`);
		} else {
			normalized.delivery_time = product.delivery_time | 0;
		}
	} else {
		if (defaults.hasOwnProperty("delivery_time")) {
			normalized.delivery_time = defaults.delivery_time | 0;
		}
	}
	// GTIN
	if (has(product, "gtin")) {
		const gtin = normalizeGTIN(product.gtin);
		if (gtin) {
			normalized.gtin = gtin;
		}
	}

	// Variants
	if (has(product, "variants")) {
		if (!Array.isArray(product.variants)) {
			normalized.$errors.variants = new ExtError("ERR_NORMALIZE_PRODUCT_VARIANTS_NOT_ARRAY", "Variants not array");
		} else if (product.variants.length) {
			let errorKey;
			try {
				let stock = 0;
				let attributesLength = null;
				const attributesNames = new Set;
				let initializeAttributesNames = true;
				normalized.variants = product.variants.map((variant) => {
					intPattern.lastIndex = 0;
					if (!intPattern.test(variant.quantity)) {
						errorKey = "variants.quantity";
						throw new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_VARIANT_QUANTITY", `Incorrect variant quantity (pattern): ${variant.quantity}`);
					}
					const quantity = +String(variant.quantity).trim();
					if (!isFinite(quantity) || (quantity | 0) !== quantity) {
						errorKey = "variants.quantity";
						throw new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_VARIANT_QUANTITY", `Incorrect product quantity: '${variant.quantity}'`);
					}
					if (!variant.attributes || !Array.isArray(variant.attributes)) {
						errorKey = "variants.attributes";
						throw new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_VARIANT_ATTRIBUTES_NOT_ARRAY", "Variant attributes not an array");
					}
					if (!variant.attributes.length) {
						errorKey = "variants.attributes";
						throw new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_VARIANT_ZERO_LENGTH_ATTRIBUTES", "Variant zero-length attributes");
					}
					if (attributesLength === null) {
						attributesLength = variant.attributes.length;
					} else {
						if (variant.attributes.length !== attributesLength) {
							errorKey = "variants.attributes";
							throw new ExtError("ERR_NORMALIZE_INCONSISTENT_PRODUCT_VARIANT_ATTRIBUTES_LENGTH", "Variant inconsistent attributes length");
						}
					}
					const attributes = [];
					for (const attribute of variant.attributes) {
						if (!attribute || typeof attribute !== "object") {
							errorKey = "variants.attributes";
							throw new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_VARIANT_ATTRIBUTE_DATA_TYPE", `Incorrect attribute data type, expected object, got '${typeof attribute}'`);
						}
						let name = attribute.name;
						let value = attribute.value;
						if (typeof name !== "string") {
							errorKey = "variants.attributes.name";
							throw new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_VARIANT_ATTRIBUTE_NAME_DATA_TYPE", `Incorrect attribute name data type, expected string, got '${typeof name}'`);
						}
						if (typeof value !== "string") {
							errorKey = "variants.attributes.value";
							throw new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_VARIANT_ATTRIBUTE_VALUE_DATA_TYPE", `Incorrect attribute value data type, expected string, got '${typeof value}'`);
						}
						name = name.trim();
						value = value.trim();
						if (name.length && value.length) {
							if (initializeAttributesNames) {
								if (attributesNames.has(name)) {
									errorKey = "variants.attributes";
									throw new ExtError("ERR_NORMALIZE_PRODUCT_VARIANT_DUPLICATE_ATTRIBUTE_NAMES", `Variant duplicated attributes names ('${name}')`);
								}
								attributesNames.add(name);
							} else if (!attributesNames.has(name)) {
								errorKey = "variants.attributes";
								throw new ExtError("ERR_NORMALIZE_INCONSISTENT_PRODUCT_VARIANT_ATTRIBUTES_NAMES", "Variant inconsistent attributes names");
							}
							attributes.push({
								name,
								value
							});
						}

						// GTIN
						if (has(variant, "gtin")) {
							const gtin = normalizeGTIN(variant.gtin);
							if (gtin) {
								variant.gtin = gtin;
							}
						}

						//Price
						if (variant.hasOwnProperty("price")) {
							floatPattern.lastIndex = 0;
							if (!floatPattern.test(variant.price) || !+variant.price) {
								errorKey = "variants.price";
								throw new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_VARIANT_PRICE", "Incorrect variant price: '{$variant['price']}'");
							}
							variant.purchase_price = variant.price = +variant.price;
						} else {
							variant.purchase_price = variant.price = normalized.price.amount;
						}

						// Images
						if (variant.hasOwnProperty("images")) {
							if (!Array.isArray(variant.images)) {
								errorKey = "variants.images";
								throw new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_VARIANT_IMAGES_DATA_TYPE", `Incorrect variant images data type, expected array, got '${typeof variant.images}'`);
							}
							const images = [];
							for (const image of variant.images) {
								if (image == null) {
									continue;
								}
								if (typeof image !== "string") {
									errorKey = "variants.images";
									throw new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_VARIANT_IMAGE_DATA_TYPE", `Incorrect variant image data type, expected string, got '${typeof image}'`);
								}
								images.push(image);
							}
							variant.images = images;
						} else {
							variant.images = [];
						}
					}

					initializeAttributesNames = false;
					stock += quantity;
					const result = {
						stock: quantity,
						price: variant.price,
						attributes,
						images: variant.images,
						purchase_price: variant.price
					};
					if(variant.gtin) {
						result.gtin = variant.gtin;
					}
					return result;
				});
				if (!normalized.stock) {
					normalized.stock = {unit: "unit"};
				}
				normalized.stock.available = stock;
			} catch (e) {
				normalized.$errors[errorKey || "variants"] = e;
			}
		}
	} else {
		normalized.variants = [];
	}

	// Manufacturer code
	if (has(product, "manufacturer_code")) {
		if (typeof product.manufacturer_code !== "string") {
			normalized.$errors.manufacturer_code = new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_MANUFACTURER_CODE_DATA_TYPE", "Manufacturer code must be string");
		} else {
			normalized.manufacturer_code = product.manufacturer_code;
		}
	}

	// Weight
	if (has(product, "weight")) {
		if (!isFinite(+product.weight)) {
			//normalized.$errors.weight = new ExtError("ERR_NORMALIZE_INCORRECT_PRODUCT_WEIGHT", "Weight");
		} else {
			normalized.weight = {
				unit: "kg",
				value: +product.weight
			};
		}
	} else if(defaults.hasOwnProperty("weight")) {
		normalized.weight = {
			unit: "kg",
			value: +defaults.weight
		};
	}

	return normalized;
}

module.exports = {
	normalize,
	normalizeGTIN
};

/**
 *
 * @param value
 * @returns {string|null}
 */
function normalizeGTIN(value) {
	const clean = String(value).replace(/[^0-9]/img, "");
	const length = clean.length;
	if (![
		8,
		12,
		13,
		14
	].includes(length)) {
		return null;
	}
	const digits = clean.padStart(14, "0").split("").map(char => char | 0);
	const check = digits.pop();
	let idx = 0;
	const sum = digits.reduce((sum, digit) => {
		return sum + digit * (++idx % 2 ? 3 : 1);
	}, 0);
	if ((10 - (sum % 10)) % 10 !== check) {
		return null;
	}
	return clean;
}
