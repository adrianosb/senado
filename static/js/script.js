const DATE_FORMAT = "YYYY-MM-DD";
const DATE_FORMAT_BR = "DD/MM/YYYY";

var startDate = "";
var endDate = "";

var radarChart = null;
var barChart = null;

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
            //$('#teste').text(JSON.stringify(e));
            process(e);
        },
        error: function (e) {
            console.log('Error: ' + e);
        }
    });
}

function process(data){

    if(radarChart != null){
        radarChart.destroy();
    }
    if(barChart != null){
        barChart.destroy();
    }

    var senadores = [];
    var votouSim = []
    var votouNao = []
    var siglas =  new Map();

    for (var key in data) {
        senadores.push(key);
        var _votouSim = 0;
        var _votouNao = 1;
        for (var sigla in data[key]) {
            siglas.set(sigla,0);

            if(sigla.trim() == "Sim" || sigla.trim() == "Não" || sigla.trim() == "Votou"){
                _votouSim = _votouSim + data[key][sigla];
            } else {
                _votouNao = _votouNao + data[key][sigla];
            }
        }
        votouSim.push(_votouSim);
        votouNao.push(_votouNao);
    }
    for (var key in data) {
        var _siglas = new Map(siglas);
        for (var sigla in data[key]) {
            _siglas.set(sigla, data[key][sigla]);
        }
        data[key].siglas = _siglas;
    }

    var colors = dynamicColors(data);

    var datasets = [];
    var idxColor = 0;
    for (var key in data) {
        var color = colors[idxColor];
        datasets.push({
            label: key,
    //        backgroundColor: dynamicColors(),
            backgroundColor: color,
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
      idxColor++;
    }

    var configBar = {
      type: 'horizontalBar',
      data: {
        labels: senadores,
        datasets: [ {
//          type: 'bar',
          label: 'Sim',
          backgroundColor: 'rgb(54, 162, 235)',
          data: votouSim
        },
        {
//          type: 'bar',
          label: 'Não',
          backgroundColor: 'rgb(255, 99, 132)',
          data: votouNao,
        }]
      },
      options: {
        title: {
            display: true,
            text: 'Registrou seu voto?'
        },
        responsive: true,
        scales: {
          xAxes: [{
            stacked: true
          }],
          yAxes: [{
            stacked: true,
            maxBarThickness: 40
          }]
        },
        plugins: {
            datalabels: {
                color: 'white',
                display: true,
                font: {
                    weight: 'bold'
                },
                formatter: function(value, context) {
                    var sum = context.chart.config.data.datasets[0].data[context.dataIndex] + context.chart.config.data.datasets[1].data[context.dataIndex];
                    return  Math.round(value*100/sum)+"% ("+value+")";
                }
            }
        }
      }
    };

    var ctxBar = document.getElementById("myChartBar").getContext("2d");
    barChart = new Chart(ctxBar, configBar);


    var marksData = {
      labels: Array.from(siglas.keys()),
      datasets: datasets
    };

    var ctx = document.getElementById('myChart').getContext('2d');

    radarChart = new Chart(ctx, {
      type: 'radar',
      data: marksData,
      options: {
        title: {
            display: true,
            text: 'Votos'
        },
        responsive: true,
        plugins: {
            datalabels: {
                color: 'white',
                display: true,
                font: {
                    weight: 'bold'
                },
                formatter: Math.round
            }
        }
      }
    });
}

function dynamicColors(myData) {
    var size = Object.keys(myData).length;
    var color = palette('tol', size).map(function(hex) {
        return '#' + hex;
      });
    return color;
}