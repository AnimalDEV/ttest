/**
 * @author Maciej Lasoń <maciejlason3@gmail.com>
 */
"use strict";
const Joi = require("joi");

const checkbox_schema = Joi.object({
	type: Joi.valid("checkbox").required(),
	name: Joi.string().trim().required(),
	label: Joi.string().trim().required(),
	src: Joi.string().trim().required(),
	help: Joi.string().trim(),
	description: Joi.string().trim(),
	required: Joi.boolean()
});

const number_schema = Joi.object({
	type: Joi.valid("number").required(),
	name: Joi.string().trim().required(),
	label: Joi.string().trim().required(),
	src: Joi.string().trim().required(),
	help: Joi.string().trim(),
	description: Joi.string().trim(),
	max: Joi.number(),
	min: Joi.number(),
	placeholder: Joi.number(),
	step: Joi.number(),
	required: Joi.boolean()
});

const password_schema = Joi.object({
	type: Joi.valid("password").required(),
	name: Joi.string().trim().required(),
	label: Joi.string().trim().required(),
	src: Joi.string().trim().required(),
	help: Joi.string().trim(),
	description: Joi.string().trim(),
	maxlength: Joi.number().integer().positive(),
	minlength: Joi.number().integer().positive(),
	pattern: Joi.string().trim(),
	placeholder: Joi.string(),
	size: Joi.number().integer().positive(),
	required: Joi.boolean()
});

const text_schema = Joi.object({
	type: Joi.valid("text").required(),
	name: Joi.string().trim().required(),
	label: Joi.string().trim().required(),
	src: Joi.string().trim().required(),
	help: Joi.string().trim(),
	description: Joi.string().trim(),
	maxlength: Joi.number().integer().positive(),
	minlength: Joi.number().integer().positive(),
	pattern: Joi.string().trim(),
	placeholder: Joi.string(),
	size: Joi.number().integer().positive(),
	required: Joi.boolean()
});

const select_schema = Joi.object({
	type: Joi.valid("select").required(),
	name: Joi.string().trim().required(),
	label: Joi.string().trim().required(),
	src: Joi.string().trim().required(),
	help: Joi.string().trim(),
	description: Joi.string().trim(),
	options: Joi.array().min(1).items(Joi.object({
		text: Joi.string().trim().required(),
		value: Joi.string().trim().required()
	})).unique("value").required(),
	required: Joi.boolean()
});

const multiselect_schema = Joi.object({
	type: Joi.valid("multiselect").required(),
	name: Joi.string().trim().required(),
	label: Joi.string().trim().required(),
	src: Joi.string().trim().required(),
	help: Joi.string().trim(),
	description: Joi.string().trim(),
	options: Joi.array().min(1).items(Joi.object({
		text: Joi.string().trim().required(),
		value: Joi.string().trim().required()
	})).unique("text").required(),
	required: Joi.boolean()
});

module.exports = Joi.object({
	name: Joi.string().min(1).max(64).trim().required(),
	image: Joi.string().uri().min(1).max(256).trim().required(),
	short_description: Joi.string().min(1).max(256).trim().required(),
	description: Joi.string().max(16384).trim().required(),
	category: Joi.string().min(1).max(64).trim().required(),
	dropshipping: Joi.boolean().required(),
	properties: Joi.array().items(Joi.object({
		icon: Joi.string().min(1).max(256).trim(),
		name: Joi.string().min(1).max(256).trim().required(),
		value: Joi.string().min(1).max(256).trim().required()
	})).max(128).required(),
	tags: Joi.array().items(Joi.string().trim()).max(16).required(),
	additional_info: Joi.object({
		website: Joi.string().uri().trim().required(),
		phone: Joi.string().min(1).pattern(/^\+48 \d{3} \d{3} \d{3}$/).trim().required(),
		email: Joi.string().email().trim().required(),
		contact_person: Joi.string().min(1).trim()
	}).required(),
	config: Joi.array().items(Joi.object({
		label: Joi.string().trim().required(),
		fields: Joi.array().items(checkbox_schema, number_schema, password_schema, text_schema, select_schema, multiselect_schema).unique("src").required()
	})).unique("label").required(),
	default_config: Joi.object().required(),
	parser: Joi.object({
		type: Joi.string().valid("SimpleMapper").required(),
		defaults: Joi.object({
			tax: Joi.number().min(0),
			quantity: Joi.number().integer().min(0),
			category: Joi.string().trim(),
			description: Joi.string().trim(),
			manufacturer: Joi.string().trim(),
			delivery_time: Joi.number().integer().min(0),
			currency: Joi.string().uppercase().length(3),
			weight: Joi.number().positive()
		}).required(),
		config: Joi.object({
			parser: Joi.object({
				type: Joi.string().valid("XML").required(),
				config: Joi.object({
					emit: Joi.string().trim().min(1).required(),
					encoding: Joi.string().trim().min(1)
				}).required()
			}).required(),
			src: Joi.object({
				url: Joi.string().min(1).trim().required()
			}).required(),
			map: Joi.object({
				id: Joi.array().min(1).required(),
				price: Joi.array().min(1).when("..variants", {
					not: Joi.exist(),
					then: Joi.array().required()
				}),
				currency: Joi.array().min(1).when("....defaults.currency", {
					not: Joi.exist(),
					then: Joi.array().required()
				}),
				manufacturer_code: Joi.array().min(1),
				weight: Joi.array().min(1),
				manufacturer: Joi.array().min(1).when("....defaults.manufacturer", {
					not: Joi.exist(),
					then: Joi.array().required()
				}),
				category: Joi.array().min(1).when("....defaults.category", {
					not: Joi.exist(),
					then: Joi.array().required()
				}),
				tax: Joi.array().min(1).when("....defaults.tax", {
					not: Joi.exist(),
					then: Joi.array().required()
				}),
				quantity: Joi.array().min(1).when("..variants", {
					not: Joi.exist(),
					then: Joi.array().required()
				}),
				gtin: Joi.array().min(1),
				description: Joi.array().min(1),
				name: Joi.array().min(1).required(),
				images: Joi.array().min(1).required(),
				parameters: Joi.array().min(1),
				delivery_time: Joi.array().min(1),
				variants: Joi.array().min(1)
			}).required()
		}).required()
	}).required(),
	schedule: Joi.object({
		type: Joi.string().valid("frequency").required(),
		hours: Joi.number().positive().integer().min(1).required(),
		schedule: Joi.array().required()
	}).required()
});

