"use strict";
const { default: axios } = require("axios");
const $ = require("jquery");
// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages
const saveExtractedText = (data, cb) => {
  const {
    imgArr = [],
    title = "",
    price = "",
    sizeArray = [],
    colorArray = [],
  } = data;
  let variants = [];
  sizeArray.map((size) => {
    for (let i = 0; i < colorArray.length; i++) {
      variants.push({
        option1: size,
        option2: colorArray[i],
        price: price,
      });
    }
  });
  //console.log(variants,111111)
  const product = {
    title: title,
    variants: variants,
    options: [
      { name: "Size", values: sizeArray },
      { name: "Color", values: colorArray },
    ],
    images: imgArr,
  };
  const config = {
    method: "post",
    url: "https://maxhui2021.myshopify.com/admin/api/2021-07/products.json",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": "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",
    },
    data: JSON.stringify({ product: product }),
  };
  axios(config)
    .then(function (response) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "SaveSuccess" },
          function (response) {}
        );
      });
    })
    .catch(function (a, b) {
      console.log(a, b, 55555);
    });
};
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GREETINGS") {
    const message = `Hi ${
      sender.tab ? "Con" : "Pop"
    }, my name is Bac. I am from Background. It's great to hear from you.`;
    saveExtractedText(request.payload.message, sendResponse);
    // Log message coming from the `request` parameter
    console.log(request.payload.message);
  }
});
