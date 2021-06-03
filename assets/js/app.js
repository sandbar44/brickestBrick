// TO DO
// [x] get list of all lego sets = Static CSV
// [x] for each lego set, get set price
// [a] for each lego set, get list of all parts
// [a] for each part, get price 
// [a] get total value = price * qty (avg and 6 mos)
// [a] sum up all parts within a set
// [a] export to table: set #, set price, part out value (avg and 6 mos)

"use strict";

// GLOBAL VARIABLES
// ==================================================

// Set up Bricklink OAuth 1.0
var api = require('../../node_modules/core-js/bricklink-api');
var Client = api.Client,
  ItemType = api.ItemType,
  Logger = api.Logger;

var config = require('../../config/config.json');

var bricklink = new Client({
  "consumer_key": config.consumer_key,
  "consumer_secret": config.consumer_secret,
  "token": config.token,
  "token_secret": config.token_secret
});

// Define valueOfSets global object
var valueOfSets = {
  'test': {
    setMinPrice: 'test',
    setMaxPrice: 'test',
    setAvgPrice: 'test',
    parts: {
      'test1': {
        partName: 'test',
        partQty: 0,
        partPrice: 0
      },
      'test2': {
        partName: 'test',
        partQty: 0,
        partPrice: 0
      },
    }
  }
};

// STEP 1: Get list of all lego sets (use Static CSV for now)
// Load LEGO Sets data
var setsData = require('../data/sets');

// FUNCTIONS
// ==================================================

// STEP 2: For each lego set, get set price

// Call Bricklink's Price Guide for a specific Set Number
function runPriceGuideSet(setNo) {
  return bricklink.getPriceGuide(ItemType.Set, setNo)
};

// Open to do: how to iterate this for multiple sets?
function getSetPrice(result) {
  // Store Bricklink results into setData
  // Create setObject
  var setData = {
    'setMinPrice': result.min_price,
    'setMaxPrice': result.max_price,
    'setAvgPrice': result.avg_price,
    'partOutValue': null,
    'parts': {}
  };
  // Store set data results into valueOfSets object
  valueOfSets[result.item.no] = setData;
  // console.log(valueOfSets);
  // Return setNo for next function to use
  return result.item.no
};

// STEP 3: For each lego set, get list of all parts

// Call Bricklink's Item Subset for all parts of a specific set
function getPartOutData(setNo) {
  bricklink.getItemSubset(ItemType.Set, setNo, { break_minifigs: false })
    // Must use .then function here, so that setNo persists through the chain of promises
    .then(function (result) {
      // Store each part details
      for (var i = 0; i < result.length; i++) {
        // Open to do: How to handle matching entries? Understand entries better
        var partNo = result[i].entries[0].item.no;
        var partName = result[i].entries[0].item.name;
        var partQty = result[i].entries[0].quantity + result[i].entries[0].extra_quantity;
        // If there are duplicate part numbers, add up total qty
        if (valueOfSets[setNo].parts.hasOwnProperty(partNo)) {
          valueOfSets[setNo].parts[partNo].partQty += partQty;
          // Else create a new object for the part number
        } else {
          // Create partObject for each part
          var partData = {
            'partName': partName,
            'partQty': partQty,
            'partPrice': null,
            'partValue': null
          };
          // Store part data into valueOfSets object
          valueOfSets[setNo].parts[partNo] = partData
        }
      };
      // Return set object for next function to use
      return valueOfSets[setNo]
    })

    // STEP 4: For each part, get price (avg and 6 mos)
    // Get price data for each part
    // Must use .then here to make sure setNo persists through the function
    .then(function (valueOfSets) {
      // Create array of part numbers within a set
      var partNoArray = Object.keys(valueOfSets.parts)
      // Get price for each part number
      partNoArray.forEach(partNo => {
        getPartPrice(partNo, setNo)
      })
    })
}

// Call Bricklink's Price Guide for a specific Part Number
function getPartPrice(partNo, setNo) {
  bricklink.getPriceGuide(ItemType.Part, partNo)
    .then(function (result) {
      var partQty = valueOfSets[setNo].parts[partNo].partQty
      var partPrice = result.avg_price
      var partValue = partPrice * partQty
      // Store part price into valueOfSets object
      valueOfSets[setNo].parts[partNo].partPrice = partPrice
      // STEP 5: Get total value = price * qty (avg and 6 mos)
      valueOfSets[setNo].parts[partNo].partValue = partValue
      // STEP 6: Sum up all parts within a set
      valueOfSets[setNo].partOutValue += partValue
      // Return set object for next function to use
      console.log(valueOfSets);
      return valueOfSets[setNo]
    })
};

// // [] export to table: set #, set price, part out value (avg and 6 mos)

// // EXECUTE
// // ==================================================

runPriceGuideSet('10278-1')
  .then(getSetPrice)
  .then(getPartOutData)


//  Catch all unhandled Promise rejections.
process.on('unhandledRejection', function (err) {
  console.log(err);
});