"use strict";
const $ = require("jquery");
import "./custom.css";
injectCustomJs();
window.resultProduct;
window.sendMessageToBackground = function (resultProduct) {
  //console.log(resultProduct,">>>>>>>data")
  chrome.runtime.sendMessage(
    {
      type: "GREETINGS",
      payload: {
        message: resultProduct,
      },
    },
    (response) => {
      console.log(response.message);
    }
  );
};
// Communicate with background file by sending a message

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page
const pageTitle = document.head.getElementsByTagName("title")[0].innerHTML;
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);
// 向页面注入JS
function injectCustomJs(jsPath) {
  jsPath = jsPath || "inject.js";
  var temp = document.createElement("script");
  temp.setAttribute("type", "text/javascript");
  // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
  temp.src = chrome.extension.getURL(jsPath);
  temp.onload = function () {
    // 放在页面不好看，执行完后移除掉
    this.parentNode.removeChild(this);
  };
  document.body.appendChild(temp);
}
function addEXtract() {
  $("body").append("<div class='crawl-btn'>Extract</div>");
  // 主动发送消息给后台
  // 要演示此功能，请打开控制台主动执行sendMessageToBackground()
  $(".crawl-btn").click(function () {
    var imgArr = [];
    var productTitle = $("div.product-intro__head-name")[0].innerText;
    var price = $("div.from").attr("aria-label");
    var sizeArray = [];
    var colorArray = [];
    $("div.j-product-intro__size-radio").each(function (i) {
      var size = $(this).attr("aria-label");
      sizeArray.push(size);
    });

    $(".color-name span").each(function (i) {
      var color = $(this)[0].innerText;
      colorArray.push(color);
    });

    $(".product-intro__gallery img").each(function (i) {
      var src = $(this).attr("src");
      var realSrc = /^(http|https)/.test(src) ? src : location.protocol + src;
      imgArr.push(realSrc);
    });
    var productDetails = $("<div></div>");
    var imgBox = $("<div class='img-box'></div>");
    var title = $(
      "<div class='title'>" + "Product Title:" + productTitle + "</div>"
    );
    var pricehtml = $(
      "<div class='title'>" + "Product Price:" + price + "</div>"
    );
    productDetails.append(title);
    productDetails.append(pricehtml);
    imgArr.forEach((item) => {
      var imgWrap = $("<div class='img-wrap'></div>");
      var img = $("<img src='" + item + "' />");
      imgWrap.append(img);
      imgBox.append(imgWrap);
    });
    colorArray.forEach((item) => {
      var colorWrap = $("<div class='color-wrap'></div>");
      var color = $("<div>" + "Color option:" + item + " </div>");
      colorWrap.append(color);
      productDetails.append(colorWrap);
    });
    sizeArray.forEach((item) => {
      var sizeWrap = $("<div class='size-wrap'></div>");
      var size = $("<div>" + "Size option:" + item + "</div>");
      sizeWrap.append(size);
      productDetails.append(sizeWrap);
    });
    productDetails.append(imgBox);
    const imgList = imgArr.map((item) => {
      return { src: item };
    });
    window.resultProduct = {
      imgArr: imgList,
      title: productTitle,
      price: price,
      sizeArray: sizeArray,
      colorArray: colorArray,
    };

    Modal.show({
      title: "Extracting Result",
      content: productDetails,
    });
  });
  let that = this;
  // 弹窗
  ~(function Modal() {
    var modal;
    if (this instanceof Modal) {
      this.init = function (opt) {
        modal = $("<div class='modal'></div>");
        var title = $("<div class='modal-title'>" + opt.title + "</div>");
        var close_btn = $("<span class='modal-close-btn'>X</span>");
        var content = $("<div class='modal-content'></div>");
        var mask = $("<div class='modal-mask'></div>");
        var save_btn = $("<div class='save-btn'>Save</div>");

        close_btn.click(function () {
          modal.hide();
        });
        save_btn.click(function () {
          modal.hide();
          window.sendMessageToBackground(window.resultProduct);
        });
        title.append(close_btn);
        title.append(save_btn);
        content.append(title);
        content.append(opt.content);

        modal.append(content);
        modal.append(mask);
        $("body").append(modal);
      };
      this.show = function (opt) {
        if (modal) {
          modal.show();
        } else {
          var options = {
            title: opt.title || "title",
            content: opt.content || "",
          };
          this.init(options);
          modal.show();
        }
      };
      this.hide = function () {
        modal.hide();
      };
    } else {
      window.Modal = new Modal();
    }
  })();
}
addEXtract();

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "SaveSuccess") {
    tip(
      "The products successfully created, please check in maxhui2021.myshopify.com/admin "
    );
  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({});
  return true;
});
var tipCount = 0;
// 简单的消息通知
function tip(info) {
  info = info || "";
  var ele = document.createElement("div");
  ele.className = "chrome-plugin-simple-tip slideInLeft";
  ele.style.top = tipCount * 70 + 120 + "px";
  ele.style.zIndex = 1000;
  ele.innerHTML = `<div>${info}</div>`;
  document.body.appendChild(ele);
  ele.classList.add("animated");
  tipCount++;
  setTimeout(() => {
    ele.style.top = "100px";
    setTimeout(() => {
      ele.remove();
      tipCount--;
    }, 1400);
  }, 3000);
}
