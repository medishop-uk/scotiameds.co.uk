// Google Apps Script deployment ID or full /exec URL.
(function(){
  var value='AKfycbyD9WbMoAdPsrixR71VPYpyNKqioG57t8zPiOO0rUw1f-cuEEDtcGwuZfmvV1blqq_R';
  window.SCOTIAMEDS_DATA_API=/^https:\/\/script\.google\.com\/macros\/s\//.test(value)
    ? value
    : 'https://script.google.com/macros/s/'+value.replace(/^\/+|\/+$/g,'')+'/exec';
})();