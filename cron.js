var axios = require('axios');
var d = new Date();
var timestamp = d.getMilliseconds();
var date = new Date(); 
var time_milliseconds = date.getTime();

console.log(time_milliseconds,"time_milliseconds")



var config = {
  method: 'get',
  url: 'https://api-gtm.grubhub.com/merchant/2112427/orders?timestamp='+date.getTime(),
  headers: { 
    'sec-ch-ua': '"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"', 
    'authorization': 'Bearer dbe1d273-27ee-4831-b758-17130ea356bd', 
    'sec-ch-ua-mobile': '?0', 
    'Cookie': '_pxhd=57f8e0f2f8e1f8234f4f224e43677cb7f14305461e3d23c57360664a19dffc89:5f6f2910-7de7-11eb-bb0f-e743cb28b571'
  }
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});
