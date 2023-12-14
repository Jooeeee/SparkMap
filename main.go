// main.go
package main

import (
	"SparkMap/api"
	"flag"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Serve static files (HTML, CSS, JS)
	r.StaticFile("/", "./frontend/index.html")
	r.Static("/static", "./frontend/static")

	// API endpoint to get filtered Shapefile data based on selected city
	r.GET("/api/data", api.GetData)

	// API endpoint to get city list
	r.GET("/api/cities", api.GetCityList)

	r.Run(":8080")
}

func init() {
	var dataPath = flag.String("path", "/app/data", "shp data path")
	flag.Parse()
	api.SetDataPath(*dataPath)
}
