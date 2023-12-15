// main.js
var map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 加载地图数据
function loadMapData(data) {
    // 清除之前的地图数据
    map.eachLayer(layer => {
        if (layer instanceof L.Circle) {
            map.removeLayer(layer);
        }
    });
    // 将数据转换为 GeoJSON 格式
    var geoJsonData = {
        type: 'FeatureCollection',
        features: []
    };

    var latSum=0;
    var lonSum=0;
    var cnt=0;
    data.forEach(feature => {
        var lat = parseFloat(feature.Lat);
        var lon = parseFloat(feature.Lon);
        var fArea = parseFloat(feature.F_AREA);

        latSum+=lat;
        lonSum+=lon;
        cnt++;

        if (!isNaN(lat) && !isNaN(lon) && !isNaN(fArea)) {
            // 计算半径，假设半径与面积成正比例
            var radius = Math.sqrt(fArea / Math.PI);

            // 构建 GeoJSON Feature
            var geoJsonFeature = {
                type: 'Feature',
                properties: {
                    Level2_cn: feature.Level2_cn
                },
                geometry: {
                    type: 'Point',
                    coordinates: [lon, lat]
                }
            };

            // 添加半径属性
            geoJsonFeature.properties.radius = radius;

            geoJsonData.features.push(geoJsonFeature);
        }
    });
    // 使用 L.geoJSON 渲染地图
    L.geoJSON(geoJsonData, {
        pointToLayer: function (feature, latlng) {
            return L.circle(latlng, {
                fillColor: getColor(feature.properties.Level2_cn),
                weight: 2,
                opacity: 1,
                color: 'transparent',
                fillOpacity: 0.7,
                radius: feature.properties.radius * 1000 // 乘以 1000 将半径转换为米
            });
        }
    }).addTo(map);
    // 计算城市坐标的平均值
    map.setView([latSum/cnt,lonSum/cnt], 11)
}


function updateLegend() {
    const legendContainer = document.getElementById('legend');
    legendContainer.innerHTML = ''; // 清空图例容器

    const legendName = document.createElement('div');
    legendName.classList.add('legend-name');
    legendName.textContent = '图例';
    legendContainer.appendChild(legendName)
    // 遍历颜色映射，创建图例项
    for (const level2 in colorMapping) {
        const color = colorMapping[level2];

        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');

        const legendColor = document.createElement('div');
        legendColor.classList.add('legend-color');
        legendColor.style.backgroundColor = color;

        const legendText = document.createElement('div');
        legendText.classList.add('legend-text');
        legendText.textContent = level2;

        legendItem.appendChild(legendColor);
        legendItem.appendChild(legendText);

        legendContainer.appendChild(legendItem);
    }
}

// 在数据加载之前获取城市列表
function loadCityList() {
    fetch('/api/cities')
        .then(response => response.json())
        .then(cities => {
            cities.sort((a, b) => a.City_NAME.localeCompare(b.City_NAME));
            // 清空下拉框
            const cityDropdown = document.getElementById('cityDropdown');
            cityDropdown.innerHTML = '';
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.City_CODE;
                option.textContent = city.City_NAME;
                cityDropdown.appendChild(option);
            });
            // 设置默认
            cityDropdown.value = '上海市'; // 310000 为上海市的城市代码
            // 加载数据
            loadCityData()
        })
        .catch(error => console.error('Error fetching cities:', error));
}

function loadCityData() {
    const selectedCityCode = document.getElementById('cityDropdown').value;

    // 使用选定的城市代码请求相应的 Shapefile 数据
    fetch(`/api/data?cityCode=${selectedCityCode}`)
        .then(response => response.json())
        .then(data => {
            // 处理数据并加载到地图中
            loadMapData(data);
            // 更新图例
            updateLegend();
        })
        .catch(error => console.error('Error fetching data:', error));
}
const colorMapping = {
    '居住用地': '#0000FF', // 蓝色
    '商务办公用地': '#FF0000', // 红色
    '商业服务用地': '#FFA07A', // LightSalmon
    '工业用地': '#008000', // 绿色
    '道路用地': '#FFA500', // 橙色
    '交通场站用地': '#FFD700', // 金色
    '机场设施用地': '#FF4500', // OrangeRed
    '行政办公用地': '#800080', // 紫色
    '教育科研用地': '#DDA0DD', // Lavender
    '医疗卫生用地': '#9400D3', // DarkViolet
    '体育与文化用地': '#FFC0CB', // Pink
    '公园与绿地用地': '#FFB6C1', // LightPink
    '其他': '#808080' // 未知值的默认颜色
}

function getColor(name) {
    // 定义基于提取的名称的颜色
    return colorMapping[name] || colorMapping['其他'];
}


loadCityList()