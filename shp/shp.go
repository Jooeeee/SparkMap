package shp

import (
	"fmt"
	"github.com/jonas-p/go-shp"
	"io/ioutil"
	"strings"
)

func GetCityData(filePath string) ([]map[string]interface{}, error) {
	// 使用选定的城市代码来获取对应的 Shapefile 数据
	shapefile, err := shp.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("Error opening Shapefile: %s", err)
	}
	defer shapefile.Close()

	// Process Shapefile data
	var features []map[string]interface{}
	for shapefile.Next() {
		n, _ := shapefile.Shape()

		attributes := make(map[string]interface{})
		for i, field := range shapefile.Fields() {
			attribute := shapefile.ReadAttribute(n, i)
			attributes[field.String()] = attribute
		}

		features = append(features, attributes)
	}
	return features, nil
}

func GetCities(dirPath string) ([]map[string]string, error) {
	// 读取 data 文件夹中的文件名，生成城市列表
	files, err := ioutil.ReadDir(dirPath)
	if err != nil {
		return nil, err
	}
	var cities []map[string]string
	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".shp") {
			name := strings.TrimSuffix(file.Name(), ".shp")
			cities = append(cities, map[string]string{"City_CODE": name, "City_NAME": name})
			// 这里你可能需要更复杂的逻辑来从城市名中提取更友好的显示名称
		}
	}
	return cities, nil
}
