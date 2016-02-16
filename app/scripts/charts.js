$(function () {

    var gaugeOptions = {
        'chart': {
            'type': 'solidgauge'
        },

        'title': null,

        'tooltip': {
            'enabled': false
        },
        
        'pane': {
          'center': ['50%', '50%'],
          'size': '200px',
          'startAngle': 0,
          'endAngle': 360,
          'background': {
            'backgroundColor': 'rgba(255,255,255,0)',
            'innerRadius': '90%',
            'outerRadius': '100%',
            'borderWidth': 0
          }
        },

        'yAxis': {
          'min': 0,
          'max': 100,
          'labels': {
            'enabled': false
          },
    
          'lineWidth': 0,
          'minorTickInterval': null,
          'tickPixelInterval': 400,
          'tickWidth': 0
        },

        'plotOptions': {
            'solidgauge': {
                'innerRadius': '90%'
            }
        },
        
        'series': [{
            'name': 'Speed',
            'data': [90],
            'dataLabels': {
                'enabled': false
            }
        }]
    };

    $('#carga-horaria-chart').highcharts(gaugeOptions);

});