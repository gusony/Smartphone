/*==JS VERSION 1==*/
var id ='sp-';
var endPoint = 'http://140.113.215.7:9999/';
var timestamp = {};

const csmRegister = function(pf, callback) {
  id += btoa(Math.random()).substring(1, 10);
  if (pf.is_sim == undefined){
    pf.is_sim = false;
  }
  if (pf.d_name == undefined){
    pf.d_name = (Math.floor(Math.random() * 99)).toString() + '.' + pf.dm_name ;
  }
  $.ajax({
    url: endPoint + id,
    type: 'POST',
    data: JSON.stringify({profile: pf}),
    //dataType: 'json',
    contentType: 'application/json',
    success: function () {
      document.title = pf.d_name;
      window.onunload = csmDelete;
      window.onbeforeunload = csmDelete;
      window.onclose = csmDelete;
      window.onpagehide = csmDelete;
      callback();
    },
    error: function (a,b,c) {
      alert('register fail');
    }
  }).done(function(){
        csmPush ('__Ctl_I__',['SET_DF_STATUS_RSP',{'cmd_params':[]}])
  });
};


const csmPull = function(df, handler) {
  var preHandler = function(data) {
    let value = null;
    if (!timestamp[df]){
      timestamp[df] = '';
    }
    if ((data.samples.length > 0) && data.samples[0][0] != timestamp[df]) {
      timestamp[df] = data.samples[0][0];
      if (data.samples[0][1].length == 1) {
        value = data.samples[0][1][0];
      }
      else {
        value = data.samples[0][1];
      }
      console.log(value);
    }
    handler(value);
  }
  $.ajax({
    url: endPoint + id + '/' + df,
    type: 'GET',
    error: function(a, b, c) {handler();}
  })
  .done(preHandler);
};

const csmPush = function (df, rawData) {
  jsonData = {'data': rawData};
  $.ajax({
    url: endPoint + id + '/' + df,
    type: 'PUT',
    data: JSON.stringify(jsonData),
    dataType: 'json',
    contentType: 'application/json'
  })
};

const csmDelete = function() {
  $.ajax({
    url: endPoint + id,
    type: 'DELETE'
  })
};


