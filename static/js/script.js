const DATE_FORMAT = "YYYY-MM-DD";
const DATE_FORMAT_BR = "DD/MM/YYYY";

var startDate = "";
var endDate = "";

const getSenadores = function(start, end) {
    d1 = moment(start, DATE_FORMAT_BR).format(DATE_FORMAT);
    d2 = moment(end, DATE_FORMAT_BR).format(DATE_FORMAT);

    $.getJSON( "/api/v0.1/senadores/"+d1+"/"+d2, function( data ) {
        $('.selectpicker').find('option').remove()
        $.each(data, function (key, entry) {
            $('.selectpicker').append($('<option></option>').attr('value', entry).text(entry));
        });

        $('.selectpicker').selectpicker('refresh');
    });
};

$('.input-daterange').datepicker({
    format: "dd/mm/yyyy",
    language: "pt-BR",
    autoclose: true
})
.change(function(){
    $(this).datepicker('hide');
})
.on('hide', dateChanged);

function dateChanged(ev) {
    var start = $('#start');
    var end = $('#end');

    var teveAlteracao = false;

    if (start.val() != '' &&
        end.val() != '' &&
        (start.val() != startDate || end.val() != endDate)
        &&
        start.datepicker('getUTCDate') < end.datepicker('getUTCDate')
        //start.val() < end.val()
         ) {
       teveAlteracao = true;
    } else {
        //TODO colocar alerta de data invalida
    }
    startDate = start.val();
    endDate = end.val();
    console.log(startDate);
    console.log(teveAlteracao);
    if(teveAlteracao){
        getSenadores(startDate, endDate);
    }
}

$("#btn_rodar").click(function() {
    find();
    return false;
});

function find() {
    //TO-DO validar campos

    var item = {
        "start": $('#start').val(),
        "end": $('#end').val(),
        "senadores": $('.selectpicker').val()
    };
    $.ajax({
        url: '/api/v0.1/senadores',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(item),
        dataType: "json",
        success: function (e) {
            //console.log('Sucesso!');
            //console.log(e);
            $('#teste').text(JSON.stringify(e));
            process(e);
        },
        error: function (e) {
            console.log('Error: ' + e);
        }
    });
}

function process(data){
    var senadores = [];
    var siglas =  new Map();
    for (var key in data) {
        senadores.push(key);
        for (var sigla in data[key]) {
            siglas.set(sigla,0);
        }
    }
    for (var key in data) {
        var _siglas = new Map(siglas);
        for (var sigla in data[key]) {
            _siglas.set(sigla, data[key][sigla]);
        }
        data[key].siglas = _siglas;
    }

    var datasets = [];
    for (var key in data) {
        var color = dynamicColors();
        datasets.push({
        label: key,
//        backgroundColor: dynamicColors(),
        backgroundColor: "transparent",
        borderColor: color,
        fill: false,
        radius: 6,
        pointRadius: 6,
        pointBorderWidth: 3,
        pointBackgroundColor: color,
        pointBorderColor: color,
        pointHoverRadius: 10,
        data: Array.from(data[key].siglas.values())
      });
    }

    var marksData = {
      labels: Array.from(siglas.keys()),
      datasets: datasets
    };

    var ctx = document.getElementById('myChart').getContext('2d');

    var radarChart = new Chart(ctx, {
      type: 'radar',
      data: marksData
    });
}

function dynamicColors() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgba(" + r + "," + g + "," + b + ", 0.8)";
}