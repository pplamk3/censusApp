mapboxgl.accessToken =
'pk.eyJ1IjoicHBsYW1rMyIsImEiOiJja3JhZDFjNjYya3ZlMm9wZDg0OW1qZTViIn0.uQIWr8JRpJ_2DQ3pO0B74w'


var bounds = [
  [113.58, 22.1], // southwest coordinates
  [114.832, 22.62] // northeast coordinates
];


const map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/light-v10',
center: [114.0986109, 22.3373145],
zoom: 10,
maxBounds: bounds // set the map's geographical bounds
})


// set hover state
let hoveredStateId = null;


// Target the span elements used in the sidebar
var IdDisplay = document.getElementById('idd');
var locDisplay = document.getElementById('loc');
var popDisplay = document.getElementById('pop');
var labDisplay = document.getElementById('lab');
var lab_rDisplay = document.getElementById('ratio');
var dateDisplay = document.getElementById('med');
var dhtiDisplay = document.getElementById('dhti');

var IdDisplay_R = document.getElementById('idd_R');
var locDisplay_R = document.getElementById('loc_R');
var popDisplay_R = document.getElementById('pop_R');
var labDisplay_R = document.getElementById('lab_R');
var lab_rDisplay_R = document.getElementById('ratio_R');
var dateDisplay_R = document.getElementById('med_R');
var dhtiDisplay_R = document.getElementById('dhti_R');


// add marker parameter
var marker_L = [new mapboxgl.Marker({ color: '#82c9ff', rotation: -25}), 
                new mapboxgl.Marker({ color: '#e6f0bb', rotation: -25}), 
                new mapboxgl.Marker({ color: '#ffd68a', rotation: -25}), 
                new mapboxgl.Marker({ color: '#ff7b55', rotation: -25}), 
                new mapboxgl.Marker({ color: '#808080', rotation: -25})];

var marker_R = [new mapboxgl.Marker({ color: '#82c9ff', rotation: 25}), 
                new mapboxgl.Marker({ color: '#e6f0bb', rotation: 25}), 
                new mapboxgl.Marker({ color: '#ffd68a', rotation: 25}), 
                new mapboxgl.Marker({ color: '#ff7b55', rotation: 25}), 
                new mapboxgl.Marker({ color: '#808080', rotation: 25})];

var popup = new mapboxgl.Popup();
var Ln;
var Rn;


// create array for data visualization
var arr_para = [];
var para_def = [];
var fil = ""
var para1 = 0;
var para2 = 0;
var para3 = 0;

// retrieve census_84 geojson data
window.onload = function() {
  fil = sessionStorage.getItem("Fil"); 
  $('#sort-item').val(fil);

  // read census_data.json
  function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
      if (rawFile.readyState === 4 && rawFile.status == "200") {
        callback(rawFile.responseText);
      }
    }
    rawFile.send(null);
  } 
  
  // array manipulation
  readTextFile("census_data.json", function(text){
    var data = JSON.parse(text);
    for (let i = 0; i < 431; i++) {
      arr_para.push(data.features[i].properties);
      para_def.push(arr_para[i][fil]);
    }

    // sort array
    para_def.sort(function(a, b){return a - b});
  });
}
$('#sort-item').change(function() { 
    var selVal = $(this).val();
    sessionStorage.setItem("Fil", selVal);
});


// add navigation control
map.addControl(new mapboxgl.NavigationControl(), 'top-left');
map.addControl(new mapboxgl.FullscreenControl(), 'top-left');


map.on('load', function() {
  console.log(fil);

  // update parameter
  para1 = para_def[Math.floor(para_def.length/4)];
  para2 = para_def[Math.floor(para_def.length/2)];
  para3 = para_def[Math.floor(para_def.length*3/4)];


  // Add a source for the state polygons.
  map.addSource('states', {
    'type': 'geojson',
    'data': 'census_84.json'
  });
  

  // Invisible layer for data check
  map.addLayer({
    'id': 'geochecker',
    'type': 'fill',
    'source': 'states',
    'layout': {},
    'paint': {
      'fill-opacity':0
    }
  });
  

  // console.log(parseFloat(para2.toPrecision(3)))
  // if fil != null, apply choropleth layer
  if (fil != " " && fil != null){
    
    // add choropleth layer
    map.addLayer({
      'id': 'choropleth_lay',
      'type': 'fill-extrusion',
      'source': 'states',
      // "maxzoom": 14.5,
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'fill-extrusion-color': {
          'property': fil,
          'stops': [
            [0, '#aae5ed'],
            [para1, '#9adfe6'],
            [para2, '#ffe59e'],
            [para3, '#ff7b55']
          ]
        },
        'fill-extrusion-height': {
          "property": fil,
          "stops": [
            [para_def[0], 0],
            [para_def[143], para1/para_def[430]*15000],
            [para_def[286], para2/para_def[430]*15000],
            [para_def[430], 15000]
          ]
        },
        'fill-extrusion-opacity': 0.5,
        'fill-extrusion-base': 0
      }
  
    });

    map.addLayer({
      'id': 'choropleth_2dlay',
      'type': 'fill',
      'source': 'states',
      'layout': {
        'visibility': 'none'
      },
      'paint': {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', fil],
          0, // threshold
          '#aae5ed',
          para1,
          '#9adfe6',
          para2,
          '#ffe59e',
          para3,
          '#ff7b55'
        ],
        'fill-outline-color': '#6e6e6e',
        'fill-opacity':
        [
          'case',
          ['boolean', ['feature-state', 'hover'], false], // hover
          1,
          0.5
        ]
      }
    });

    // Legend
    var layers = [
      "Legend",
      "",
      "below "+parseFloat(para1.toPrecision(3)), 
      parseFloat(para1.toPrecision(3))+" - "+parseFloat(para2.toPrecision(3)), 
      parseFloat(para2.toPrecision(3))+" - "+parseFloat(para3.toPrecision(3)), 
      "above "+parseFloat(para3.toPrecision(3))
    ];
    var colors = ['#808080', '', '#82c9ff', '#e6f0bb', '#ffd68a', '#ff7b55'];

    for (i = 0; i < layers.length; i++) {
    var layer = layers[i];
    var color = colors[i];
    var item = document.createElement('div');
    var key = document.createElement('span');
    key.className = 'legend-key';
    key.style.backgroundColor = color;

    var value = document.createElement('span');
    value.innerHTML = layer;
    item.appendChild(key);
    item.appendChild(value);
    legend.appendChild(item);
    }

  }




  // Add polygon outline
  map.addLayer({
    'id': 'outline',
    'type': 'line',
    'source': 'states',
    // 'minzoom': 14.5,
    'layout': {},
    'paint': {
      'line-color': '#6e6e6e',
      'line-width': 0.5
    }
  });

  map.on('click', 'geochecker', function (e) {
    
    // Display the census data in the sidebar
    // IdDisplay.textContent = e.features[0].properties.OBJECTID;
    locDisplay.textContent = e.features[0].properties.ENAME;
    popDisplay.textContent = e.features[0].properties.t_pop;
    labDisplay.textContent = e.features[0].properties.tlf_lf;
    lab_rDisplay.textContent = e.features[0].properties.lfpr_t + "%";
    dateDisplay.textContent = e.features[0].properties.ma_t;
    dhtiDisplay.textContent = e.features[0].properties.dht;

    if (fil != " " && fil != null){
      for (let i = 0; i < para_def.length; i++) {
        if (e.features[0].properties.OBJECTID == arr_para[i]['OBJECTID']){
          if (arr_para[i][fil] < parseFloat(para1.toPrecision(3))){
            Ln = 0;
          }
          else if (arr_para[i][fil] >= parseFloat(para1.toPrecision(3)) && arr_para[i][fil] < parseFloat(para2.toPrecision(3))){
            Ln = 1;
          }
          else if (arr_para[i][fil] >= parseFloat(para2.toPrecision(3)) && arr_para[i][fil] <= parseFloat(para3.toPrecision(3))){
            Ln = 2;
          }
          else{
            Ln = 3;
          }

          for (let j = 0; j < 4; j++) {
            if (j != Ln){
              marker_L[j].remove();
            }
          }

          marker_L[Ln].setLngLat(e.lngLat)
          .addTo(map);
        }
      }
    }else{
      Ln = 4;
      marker_L[Ln].setLngLat(e.lngLat)
      .addTo(map);
    }

    e.preventDefault();
  });

  // remove displayed function when clicking outside layer
  map.on('click', function(e) {
    if (e.defaultPrevented === false) {
      locDisplay.textContent = '';
      popDisplay.textContent = '';
      labDisplay.textContent = '';
      lab_rDisplay.textContent = '';
      dateDisplay.textContent = ''
      dhtiDisplay.textContent = ''
    
      if (marker_L[Ln]){marker_L[Ln].remove()}
    }
  });


  map.on('contextmenu', 'geochecker', function (e) {
    
    // Display the census data in the sidebar
    // IdDisplay.textContent = e.features[0].properties.OBJECTID;
    locDisplay_R.textContent = e.features[0].properties.ENAME;
    popDisplay_R.textContent = e.features[0].properties.t_pop;
    labDisplay_R.textContent = e.features[0].properties.tlf_lf;
    lab_rDisplay_R.textContent = e.features[0].properties.lfpr_t + "%";
    dateDisplay_R.textContent = e.features[0].properties.ma_t;
    dhtiDisplay_R.textContent = e.features[0].properties.dht;

    if (fil != " " && fil != null){
      for (let i = 0; i < para_def.length; i++) {
        if (e.features[0].properties.OBJECTID == arr_para[i]['OBJECTID']){
          if (arr_para[i][fil] < parseFloat(para1.toPrecision(3))){
            Rn = 0;
          }
          else if (arr_para[i][fil] >= parseFloat(para1.toPrecision(3)) && arr_para[i][fil] < parseFloat(para2.toPrecision(3))){
            Rn = 1;
          }
          else if (arr_para[i][fil] >= parseFloat(para2.toPrecision(3)) && arr_para[i][fil] < parseFloat(para3.toPrecision(3))){
            Rn = 2;
          }
          else{
            Rn = 3;
          }

          for (let j = 0; j < 5; j++) {
            if (j != Rn){
              marker_R[j].remove();
            }
          }

          marker_R[Rn].setLngLat(e.lngLat)
          .addTo(map);
        }
      }
    }else{
      Rn = 4;
      marker_R[Rn].setLngLat(e.lngLat)
      .addTo(map);
    }

    e.preventDefault();
  });

  // remove displayed function when clicking outside layer
  map.on('contextmenu', function(e) {
    if (e.defaultPrevented === false) {
      locDisplay_R.textContent = '';
      popDisplay_R.textContent = '';
      labDisplay_R.textContent = '';
      lab_rDisplay_R.textContent = '';
      dateDisplay_R.textContent = '';
      dhtiDisplay_R.textContent = '';
      
      if (marker_R[Rn]){marker_R[Rn].remove();}
    }
  });


  // pop up will move with mouse pointer
  map.on('mousemove', 'geochecker', function (e) {
    // pop up for displaying the census data
    for (let i = 0; i < 431; i++) {
      if (arr_para[i]['OBJECTID'] == e.features[0].properties.OBJECTID){
        if (fil != " " && fil != null){
          popup.setHTML(e.features[0].properties.ENAME+': '+arr_para[i][fil]);
        }else{
          popup.setHTML(e.features[0].properties.ENAME);
        }
        popup.setLngLat(e.lngLat)
        popup.addTo(map);
      }
    }
  });


  // Change the cursor to a pointer when
  // the mouse is over the states layer.
  map.on('mouseenter', 'geochecker', function () {
    map.getCanvas().style.cursor = 'pointer';
  });
   

  // Change the cursor back to a pointer
  // when it leaves the states layer.
  map.on('mouseleave', 'geochecker', function () {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });
  
});

