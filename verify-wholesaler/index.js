"use strict";
const {pipeline, Writable} = require("stream");
const SimpleMapper = require("./src/lib/SimpleMapper");
const LimitedParallelStream = require("./src/lib/LimitedParallelStream");

(async () => {
	const config = {
		"parser": {
			"type": "XML",
			"config": {
				"emit": "offer.products.product"
			}
		},
		"src": {
			"url": "@config.url"
		},
		"map": {
			"id": [
				{
					"get": "@id"
				}
			],
			"name": [
				{
					"get": "description.name[xml:lang='pol'].#text"
				}
			],
			"price": [
				{
					"get": "price.@gross"
				}
			],
			"tax": [
				{
					"get": "@vat"
				}
			],
			"manufacturer": [
				{
					"get": "producer.@name"
				}
			],
			"category": [
				{
					"get": "category.@name"
				},
				{
					"replace": ["/","^"]
				}
			],
			"quantity": [
				{
					"get": "sizes.size.stock.@quantity"
				}
			],
			"description": [
				{
					"get": "description.long_desc[xml:lang='pol'].#text"
				}
			],
			"images": [
				{
					"getAll": "images.large.image.@url"
				}
			],
			"manufacturer_code": [
				{
					"get": "producer.@id"
				}
			],
			"weight": [
				{
					"get": "sizes.size.@weight"
				}
			],
			"gtin": [
				{
					"get": "sizes.size.@code_producer"
				}
			],
			"parameters": [
				{
					"getAll": "parameters.parameter"
				},
				{
					"loop": [
						{
							"map": {
								"name": [
									{
										"get": "@name"
									}
								],
								"value": [
									{
										"get": "value.@name"
									}
								]
							}
						}
					]
				}
			]
		}
	}
	const integration = new SimpleMapper({
		defaults: {}
	}, config);
	const source = await integration.createStream("../../../xml.xml");
	const limitedParallel = new LimitedParallelStream(64,async (chunk, encoding, push, done) => {
		await new Promise((resolve, reject) => {
			setTimeout(resolve, Math.random() * (20 - 10) + 10);
		});
		push();
		done();
	});

	const consumer = new Writable({
		objectMode: true,
		write(chunk, encoding, callback) {
			callback();
		}
	});

	await new Promise((resolve, reject) => {
		console.log("Parsing XML started");
		pipeline(source, limitedParallel, consumer, (error, result) => {
			if (error) {
				return reject(error);
			}
			resolve(result);
		});
	});
	console.log("Parsing XML completed");
})()
//UPPERCASED

//UN UPPERCASED
//aa: 5:08.275 (m:ss.mmm) (od 10 do 300 ms) 1 concurrent
//aa: 19.524s (od 10 do 300 ms) 16 concurrent
//aa: 10.110s (od 10 do 300 ms) 32 concurrent
//aa: 5.246s (od 10 do 300 ms) 64 concurrent
//aa: 2.945s (od 10 do 300 ms) 128 concurrent

//aa: 1:00.626 (m:ss.mmm) (od 10 do 50 ms) 1 concurrent
//aa: 4.325s (od 10 do 50 ms) 16 concurrent
//aa: 2.601s (od 10 do 50 ms) 32 concurrent
//aa: 2.618s (od 10 do 50 ms) 64 concurrent
//aa: 2.691s (od 10 do 50 ms) 128 concurrent (to już zwalnia, bo zużywa ~30% procka)
