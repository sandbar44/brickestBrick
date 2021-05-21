"use strict";

// TO DO
// [] get list of all lego sets
// [] execute price guide API call
//      /items/{type}/{no}/price
//      type = MINIFIG, PART, SET, BOOK, GEAR, CATALOG, INSTRUCTION, UNSORTED_LOT, ORIGINAL_BOX
//      no = Identification number of the item
// Example
// GET /items/part/3001old/price
// Retrieves price statistics(currently for sale) of PART #3001old in new condition
// GET /items/part/3001old/price?guide_type=sold
// Retrieves price statistics(last 6 months sales) of PART #3001old in new condition
// GET /items/part/3001old/price?guide_type=sold&country_code=US
// Retrieves price statistics(last 6 months sales) of PART #3001old in new condition that are ordered from stores which are located in US.
// GET /items/part/3001old/price?currency_code=USD
// Retrieves price statistics(currently for sale in USD) of PART #3001old in new condition


// Load LEGO Sets data
var setsData = require("../data/sets");

// Set up Bricklink OAuth 1.0
var api = require('../../node_modules/core-js/bricklink-api');
var Client = api.Client,
  ItemType = api.ItemType;

var config = require('../../config/config.json');

var bricklink = new Client({
  "consumer_key": config.consumerKey,
  "consumer_secret": config.consumerSecret,
  "token": config.token,
  "token_secret": config.secret
});

// console.log(setsData);

// Execute Price Guide
bricklink.getPriceGuide(ItemType.Part, '3001')
  .then(function (result) {
    console.log(result.avg_price);
  });