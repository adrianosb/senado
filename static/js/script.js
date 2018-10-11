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

    for (var senador in data) {
        rows = "";
        for (var sigla in data[senador]) {
            qtde = data[senador][sigla];
            if(isNaN(qtde)){
                continue;
            }
            //<tr><th scope="row">1</th><td>Mark</td><td>Otto</td></tr>
            row = '<tr><th scope="row">'+senador+'</th><td>'+sigla+'</td><td>'+getDescricao(sigla)+'</td><td>'+qtde+'</td></tr>';
            rows += row;
        }
        $('table').removeClass('d-none')
        $("table tbody").append(rows);

    }
}

function getDescricao(sigla){
    text = "";
    switch(sigla.trim()) {
        case "AP": text = "art.13, caput-Atividade política/cultural LA-art.43"; break;
        case "AUS": text = "Ausente"; break;
        case "Abstenção": text = "Abstenção"; break;
        case "EPR": text = ""; break;
        case "L1": text = ""; break;
        case "L2": text = ""; break;
        case "L3": text = ""; break;
        case "L4": text = ""; break;
        case "L6": text = ""; break;
        case "L7": text = ""; break;
        case "LA": text = "art.43, §6º-Licença à adotante"; break;
        case "LC": text = "art.44-A-Candidatura à Presidência/Vice-Presidência"; break;
        case "LP": text = "Licença Particular"; break;
        case "LAP": text = "art.43, §7º-Licença paternidade ou ao adotante "; break;
        case "LS": text = "Licença sáude"; break;
        case "LSP": text = "Licença Saúde-Particular"; break;
        case "MIS": text = "MIS-Presente(art.40 - em Missão)"; break;
        case "NA": text = "dispositivo não citado"; break;
        case "NCom": text = "Não compareceu"; break;
        case "Não": text = "Não"; break;
        case "Não - Presidente Art.48 inciso XXIII": text = "Não - Presidente Art.48 inciso XXIII"; break;
        case "Obstrução": text = "Obstrução"; break;
        case "P-NRV": text = "Presente-Não registrou voto"; break;
        case "P-OD": text = "Presente(obstrução declarada) "; break;
        case "PSF": text = ""; break;
        case "Presidente (art. 51 RISF)": text = ""; break;
        case "REP": text = "Presente(art.67/13 - em Representação da Casa)"; break;
        case "Sim": text = "Sim"; break;
        case "Votou": text = "Votou"; break;
        case "MERC": text = "Presente no Mercosul"; break;
        default:
                text = "";
    }
    return text;
}

function dynamicColors(myData) {
    var size = Object.keys(myData).length;
    var color = palette('tol', size).map(function(hex) {
        return '#' + hex;
      });
    return color;
}