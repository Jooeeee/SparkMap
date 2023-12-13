package api

import (
	"SparkMap/shp"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"path"
)

var dataPath string

func GetData(c *gin.Context) {
	cityCode := c.Query("cityCode")
	features, err := shp.GetCityData(path.Join(dataPath, cityCode+".shp"))
	fmt.Println(path.Join(dataPath, cityCode, ".shp"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}

	c.JSON(http.StatusOK, features)
}

func GetCityList(c *gin.Context) {
	// 获取城市列表，可以从数据库或其他来源获取
	cities, err := shp.GetCities(dataPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error Getting Cities List"})
		return
	}
	c.JSON(http.StatusOK, cities)
}

func SetDataPath(path string) {
	dataPath = path
}
