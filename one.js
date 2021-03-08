const chrome = require('chromedriver');
const fs = require('fs')
const axios = require('axios')
const { Builder, By, Key, until } = require('selenium-webdriver');
const mongoose = require('mongoose');
const Store = require('./modal/store');
let _chrome = require('selenium-webdriver/chrome');
const { Response } = require('selenium-webdriver/http');
// db
mongoose
  .connect('mongodb+srv://dev:T7tpjzK3z5TCYh9f@cluster-prism.eqnqm.mongodb.net/test_db?retryWrites=true&w=majority', { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
  .then(() => console.log('DB connected'))
  .catch(err => {
    console.log(err);
  });

  Store.aggregate([

    { $unwind: "$brands" },
    {
      $match: { "brands.brand_name": { $eq: "Uber Eats" } }
    },
  
    { $set: { brand_id_obj_id: { $toObjectId: "$brands.brand_id" } } },
  
    {
      $lookup: {
        from: "delivery_channels",
        localField: "brand_id_obj_id",
        foreignField: "_id",
        as: "brand"
      }
    },
  
    {
      $project: { "_id": 0, "brand.restaurant_dashboard_url": 1, "brands.brand_store_id": 1, "brands.dashboard_login": 1, "brands.dashboard_password": 1 }
    }
  
  ]).exec((err, store) => {
    if (err) {
      console.log(err)
      throw err
    }
    // console.log("store starts >>>>>>>>>>>>>>>>>>>");
    // console.log(store);
    // console.log("store ends<<<<<<<<<<<<<<<<<<<<<<<<");
  
  let index=0;
  
  (async function example() {
    //  console.log("store starts >>>>>>>>>>>>>>>>>>>");
    // console.log(store[index]);
    // console.log("store ends<<<<<<<<<<<<<<<<<<<<<<<<");
      
     
    let driver = await new Builder().forBrowser('chrome').build();
    try {
      await driver.get('https://auth.uber.com/login/?next_url=https%3A%2F%2Frestaurant-dashboard.uber.com#_');
      await driver.findElement(By.id('useridInput')).sendKeys(store[index].brands.dashboard_login);
      let elements = await driver.findElements(By.className("push-small--right"));
      for (let index = 0; index < elements.length; index++) {
          let element = elements[index];
          element.click()        
      }
      let password = By.id('password');
      await driver.wait(until.elementLocated(password));
      let whatElement = driver.findElement(password);
      driver.wait(until.elementIsVisible(whatElement), 5000).sendKeys(store[index].brands.dashboard_password);
      let nextBTN = By.xpath('//*[@id="app-body"]/div/div/form/div[2]/button')
      await driver.wait(until.elementLocated(nextBTN));
      let whatnextElement = driver.findElement(nextBTN);
      (await driver.wait(until.elementIsVisible(whatnextElement), 5000)).click()
      await driver.switchTo().newWindow('window');
      await driver.sleep(5000);
      await driver.get('https://restaurant-dashboard.uber.com/rt/eats/v1/stores/'+store[index].brands.brand_store_id+'/active-orders',); 
      let json = await driver.findElement(By.xpath("/html/body/pre")).getText();
      
      console.log(index,"json starts >>>>>>>>>>>>>>>>>>>");
      console.log(json);
      console.log(index,"json ends<<<<<<<<<<<<<<<<<<<<<<<<");
  
      let jsondata=JSON.parse(json)
  
      
      let url = 'https://prism.trulyhyper.com/api/webhooks/ubereatsCourier'
  
      var config = {
        method: 'post',
        url: url,
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          "orders":jsondata.orders,
          "prism_store_id":store[index].brands.brand_store_id
        }
      };
  
      axios(config).then(Response=>{
         console.log("Response starts >>>>>>>>>>>>>>>>>>>");
      console.log(Response.data,"Response.data")
      console.log("Response ends<<<<<<<<<<<<<<<<<<<<<<<<");
        
      })
    } finally {
      await driver.quit();
      index++
      if(index<store.length){
        example()
      }
        
    }
  
  })() 
  
  
  })





