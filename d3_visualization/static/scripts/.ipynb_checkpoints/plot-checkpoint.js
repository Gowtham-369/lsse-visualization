/*
/ Features data with reviews (replace this with your actual data)
var features = [
    { feature_name: "Feature1", frequency: 100, avg_sentiment: 0.7, reviews: ['review1', 'review2', 'review3'] },
    { feature_name: "Feature2", frequency: 50, avg_sentiment: -0.5, reviews: ['review4', 'review5'] },
    { feature_name: "Feature3", frequency: 80, avg_sentiment: 0.2, reviews: ['review6', 'review7', 'review8'] },
    { feature_name: "Feature4", frequency: 120, avg_sentiment: 0.9, reviews: ['review9', 'review10'] }
];
*/
// Load the feature_stats JSON data
d3.json("/static/data/feature_stats.json").then(function(feature_stats) {
    // Convert feature_stats object to an array of features
    var features = Object.keys(feature_stats).map(function(feature_name) {
        var feature_data = feature_stats[feature_name];
        return {
            feature_name: feature_name,
            frequency: feature_data.frequency,
            avg_sentiment: feature_data.sentiment_score,
            reviews: feature_data.reviews
        };
    });

    console.log(features);

    d3.json("/static/data/review_stats.json").then(function(review_stats) {
        // Convert review_stats object to an array of reviews
        var reviews = Object.keys(review_stats).map(function(review_id) {
            var review_data = review_stats[review_id];
            return {
                review_id: review_id,
                content: review_data.content,
                time: review_data.at,
                score: review_data.score,
                version: review_data.appVersion,
                sentiment_score: review_data.sentimentScore,
            };
        });

        console.log(reviews);
            
        // dummy reviews data
        /*
        var reviews = [
                    { review_id: 'review1', time: '2020-01-31T08:00:00Z', sentiment_score: 0.7 },
                    { review_id: 'review2', time: '2021-02-03T09:00:00Z', sentiment_score: -0.5 },
                    { review_id: 'review3', time: '2022-03-23T10:00:00Z', sentiment_score: 0.2 },
                    { review_id: 'review4', time: '2021-04-13T11:00:00Z', sentiment_score: -0.8 },
                    { review_id: 'review5', time: '2023-05-25T12:00:00Z', sentiment_score: 0.5 },
                    { review_id: 'review6', time: '2019-06-01T13:00:00Z', sentiment_score: -0.3 },
                    { review_id: 'review7', time: '2020-07-10T14:00:00Z', sentiment_score: 0.6 },
                    { review_id: 'review8', time: '2021-08-20T15:00:00Z', sentiment_score: -0.2 },
                    { review_id: 'review9', time: '2024-09-05T16:00:00Z', sentiment_score: 0.9 },
                    { review_id: 'review10', time: '2022-09-05T16:00:00Z', sentiment_score: 0.5 }
                ];
        */
        
        // Set up the SVG element
        var margin = { top: 20, right: 20, bottom: 30, left: 40 },
            width = 960 - margin.left - margin.right,
            height = 480 - margin.top - margin.bottom;
        
        var featurePlotSvg = d3.select("#scatter-plot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        // Define scales and axes
        var x = d3.scaleLinear()
            .domain([0,d3.max(features, function(d) { return d.frequency; })])
            .range([0, width]);
        
        var y = d3.scaleLinear()
            .domain([-5,5])
            // .domain([0, d3.max(features, function(d) { return d.avg_sentiment; })])
            .range([height, 50]);
        
        var xAxis = d3.axisBottom(x);
        var yAxis = d3.axisLeft(y);
        
        // Add axes to the plot
        featurePlotSvg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        
        featurePlotSvg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        // Add axes labels for featurePlotSvg
        featurePlotSvg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.top + 7)
            .style("text-anchor", "middle")
            .text("Frequency");
        
        featurePlotSvg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 15)
            .style("text-anchor", "middle")
            .text("Average Sentiment Score");

        // Define color scale for sentiment score
        var colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
            .domain([-5, 5]); // Assuming sentiment scores range from -5 to 5
        
        // Add data points to the plot
        featurePlotSvg.selectAll("circle")
            .data(features)
            .enter().append("circle")
            .attr("cx", function(d) { return x(d.frequency); })
            .attr("cy", function(d) { return y(d.avg_sentiment); })
            .attr("r", 5)
            .attr("fill", function(d) { return colorScale(d.avg_sentiment); })
            .attr("title", function(d) { return d.feature_name; }) // Tooltip with feature name
            .on("mouseover", (event, d) => {
                // console.log("mouseover"); // Check if the mouseover event is triggered
                // Use event parameter to access event properties
                if (event && event.pageX && event.pageY) {
                    // console.log("Mouse event information available");
                    // console.log("Mouse coordinates (pageX, pageY):", event.pageX, event.pageY);
                    console.log("Showing feature tooltip");
                    console.log("Feature Name:", d.feature_name);
                    d3.select("#tooltip")
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px")
                        .select("#value")
                        .html(`Feature: ${d.feature_name}<br>Average Sentiment Score: ${d.avg_sentiment.toFixed(2)}`); // Customize this to show the information you want
                        // .text(d.feature_name);
                    d3.select("#tooltip").classed("hidden", false);
                } else {
                    console.log("Mouse event information not available");
                }
            })
            .on("mouseout", (event, d) => {
                // console.log("mouseout"); // Check if the mouseout event is triggered
                // Use event parameter to access event properties
                if (event && event.pageX && event.pageY) {
                    // console.log("Mouse out event information available");
                    // console.log("Mouse coordinates (pageX, pageY):", event.pageX, event.pageY);
                    
                    // Hide tooltip
                    d3.select("#tooltip").classed("hidden", true);
                    
                } else {
                    console.log("Mouse out event information not available");
                }
            })
            .on("click", (event, d) => {
                // Extract the feature name from the data
                const featureName = d.feature_name;
                
                // Find the feature object in the features array
                const clickedFeature = features.find(feature => feature.feature_name === featureName);
                
                // Get the reviews associated with the clicked feature
                const clickedFeatureReviewIds = clickedFeature.reviews;
                // filtering out in 10000 reviews takes less time, but filter over million reviews takes time, 
                // optimize this to directly search for clickedFeatureReviewIds in reviews using reviews_stats[review_id] on reviews_stats json object
                const clickedFeatureReviews = reviews.filter(review => clickedFeatureReviewIds.includes(review.review_id));
        
                console.log(clickedFeatureReviews);
        
                
                // Remove any existing review plot
                d3.select("#review-plot-svg").remove();
                
                // Create a new SVG element for the review plot
                const reviewPlotSvg = d3.select("#review-plot-container")
                    .append("svg")
                    .attr("id", "review-plot-svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);

                // custom Date format
                const formatDate = (dateString) => {
                    const date = new Date(dateString);
                    const day = date.getDate();
                    const suffix = (day >= 10 && day <= 20) ? 'th' : ['st', 'nd', 'rd'][day % 10 - 1] || 'th';
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const month = monthNames[date.getMonth()];
                    const year = date.getFullYear();
                
                    return `${day}${suffix} ${month} ${year}`;
                };
                
                // Define x-scale for time
                const xScaleReview = d3.scaleTime()
                    .domain(d3.extent(clickedFeatureReviews, d => new Date(d.time)))
                    .range([margin.left, width - margin.right]);
                
                // Define y-scale for sentiment score
                const yScaleReview = d3.scaleLinear()
                    .domain([-5, 5]) // Assuming sentiment scores range from -1 to 1
                    .range([height - margin.bottom, margin.top+50]);

                // Define x-axis for time
                const xAxisReview = d3.axisBottom(xScaleReview)
                    .tickFormat(formatDate);
                
                // Define y-axis for sentiment score
                const yAxisReview = d3.axisLeft(yScaleReview);
                
                // Append x-axis to the review plot
                reviewPlotSvg.append("g")
                    .attr("class", "x-axis-review")
                    .attr("transform", `translate(0, ${height - margin.bottom})`)
                    .call(xAxisReview);
                
                // Append y-axis to the review plot
                reviewPlotSvg.append("g")
                    .attr("class", "y-axis-review")
                    .attr("transform", `translate(${margin.left}, 0)`)
                    .call(yAxisReview);

                // Add axes labels for reviewPlotSvg
                reviewPlotSvg.append("text")
                    .attr("x", width / 2)
                    .attr("y", height + margin.top + 10)
                    .style("text-anchor", "middle")
                    .text("Time");
                
                reviewPlotSvg.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("x", -height / 2)
                    .attr("y", -margin.left + 60)
                    .style("text-anchor", "middle")
                    .text("Sentiment Score");
                
                
                // Add review points to the new review plot
                reviewPlotSvg.selectAll(".review-point")
                    .data(clickedFeatureReviews)
                    .enter()
                    .append("circle")
                    .attr("class", "review-point")
                    .attr("cx", d => xScaleReview(new Date(d.time)))
                    .attr("cy", d => yScaleReview(d.sentiment_score))
                    .attr("r", 5)
                    .attr("fill", function(d) { return colorScale(d.sentiment_score); })
                    // .attr("fill", "blue") // Set color of review points
                    .on("mouseover", (event, d) => {
                        console.log("Showing review tooltip");
                        console.log("Review Id:", d.review_id);
                        d3.select("#review-tooltip")
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 20) + "px")
                            .select("#review-value")
                            .html(`Review content: ${d.content}<br>User Score: ${d.score}<br>Sentiment Score: ${d.sentiment_score.toFixed(2)}<br>App Version: ${d.version}`); // Customize this to show the information you want
                            // .text("Review ID: " + d.review_id); // Customize this to show the information you want
                        d3.select("#review-tooltip").classed("hidden", false);
                    })
                    .on("mouseout", (event, d) => {
                        d3.select("#review-tooltip").classed("hidden", true);
                    });


                // Define legend for review plot
                var legendReview = reviewPlotSvg.append("g")
                    .attr("class", "legend")
                    .attr("transform", "translate(" + (width - 560) + "," + 20 + ")");
                
                // Add title to the legend
                legendReview.append("text")
                    .attr("x", 0)
                    .attr("y", -5)
                    .text("Date Range Filter");

                // Add "From" text before the start date objects
                legendReview.append("text")
                    .attr("x", 0)
                    .attr("y", 15)
                    .text("From");
                
                // Add dropdown menu for start date day
                var daySelectStart = legendReview.append("foreignObject")
                    .attr("x", 40)
                    .attr("y", 0)
                    .attr("width", 60)
                    .attr("height", 20)
                    .append("xhtml:select")
                    .attr("id", "daySelectStart")
                    .on("change", function() {
                        updateReviewPlot();
                    });
                
                // Populate day dropdown menu for start date
                for (var i = 1; i <= 31; i++) {
                    daySelectStart.append("option")
                        .attr("value", i)
                        .text(i);
                }
                
                // Add dropdown menu for start date month
                var monthSelectStart = legendReview.append("foreignObject")
                    .attr("x", 80)
                    .attr("y", 0)
                    .attr("width", 100)
                    .attr("height", 20)
                    .append("xhtml:select")
                    .attr("id", "monthSelectStart")
                    .on("change", function() {
                        updateReviewPlot();
                    });
                
                // Populate month dropdown menu for start date
                for (var i = 1; i <= 12; i++) {
                    monthSelectStart.append("option")
                        .attr("value", i)
                        .text(i);
                }
                
                // Add dropdown menu for start date year
                var yearSelectStart = legendReview.append("foreignObject")
                    .attr("x", 120)
                    .attr("y", 0)
                    .attr("width", 60)
                    .attr("height", 20)
                    .append("xhtml:select")
                    .attr("id", "yearSelectStart")
                    .on("change", function() {
                        updateReviewPlot();
                    });
                
                // Populate year dropdown menu for start date
                for (var i = 2000; i <= 2050; i++) {
                    yearSelectStart.append("option")
                        .attr("value", i)
                        .text(i);
                }

                // Add "To" text before the end date objects
                legendReview.append("text")
                    .attr("x", 0)
                    .attr("y", 35)
                    .text("To");
                
                // Add dropdown menu for end date day
                var daySelectEnd = legendReview.append("foreignObject")
                    .attr("x", 40)
                    .attr("y", 20)
                    .attr("width", 60)
                    .attr("height", 20)
                    .append("xhtml:select")
                    .attr("id", "daySelectEnd")
                    .on("change", function() {
                        updateReviewPlot();
                    });
                
                // Populate day dropdown menu for end date
                for (var i = 1; i <= 31; i++) {
                    var option = daySelectEnd.append("option")
                        .attr("value", i)
                        .text(i);
                
                    // Set default value to 31
                    if (i === 31) {
                        option.attr("selected", "selected");
                    }
                }
                
                // Add dropdown menu for end date month
                var monthSelectEnd = legendReview.append("foreignObject")
                    .attr("x", 80)
                    .attr("y", 20)
                    .attr("width", 60)
                    .attr("height", 20)
                    .append("xhtml:select")
                    .attr("id", "monthSelectEnd")
                    .on("change", function() {
                        updateReviewPlot();
                    });
                
                // Populate month dropdown menu for end date
                for (var i = 1; i <= 12; i++) {
                    var option = monthSelectEnd.append("option")
                        .attr("value", i)
                        .text(i);
                
                    // Set default value to December
                    if (i === 12) {
                        option.attr("selected", "selected");
                    }
                }
                
                // Add dropdown menu for end date year
                var yearSelectEnd = legendReview.append("foreignObject")
                    .attr("x", 120)
                    .attr("y", 20)
                    .attr("width", 60)
                    .attr("height", 20)
                    .append("xhtml:select")
                    .attr("id", "yearSelectEnd")
                    .on("change", function() {
                        updateReviewPlot();
                    });
                
                // Populate year dropdown menu for end date
                for (var i = 2000; i <= 2030; i++) {
                    var option = yearSelectEnd.append("option")
                        .attr("value", i)
                        .text(i);
                    // Set default value to 2030
                    if (i === 2030) {
                        option.attr("selected", "selected");
                    }
                }

                // Define Review Plot Range Slide bar in the legend
                
                // Add title to the legend
                legendReview.append("text")
                    .attr("x", 210)
                    .attr("y", -5)
                    .text("Sentiment Score");
                
                // Add sliding select tool for review startRange
                legendReview.append("foreignObject")
                    .attr("x", 200)
                    .attr("y", 0)
                    .attr("width", 200)
                    .attr("height", 50)
                    .append("xhtml:input")
                    .attr("type", "range")
                    .attr("min", -5)
                    .attr("max", 5)
                    .attr("value", -5)
                    .attr("id", "startRangeReview")
                    .on("input", function() {
                        updateReviewPlot();
                    });
                
                // Add number scale for review startRange
                legendReview.selectAll(".startRangeLabelReview")
                    .data([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5])
                    .enter().append("text")
                    .attr("class", "startRangeLabelReview")
                    .attr("x", function(d, i) { return 200 + i * 12; })
                    .attr("y", 25)
                    .style("font-size", "9px")
                    .text(function(d) { return d; });
                
                // Add sliding select tool for review endRange
                legendReview.append("foreignObject")
                    .attr("x", 200)
                    .attr("y", 25)
                    .attr("width", 200)
                    .attr("height", 50)
                    .append("xhtml:input")
                    .attr("type", "range")
                    .attr("min", -5)
                    .attr("max", 5)
                    .attr("value", 5)
                    .attr("id", "endRangeReview")
                    .on("input", function() {
                        updateReviewPlot();
                    });
                
                // Add number scale for review endRange
                legendReview.selectAll(".endRangeLabelReview")
                    .data([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5])
                    .enter().append("text")
                    .attr("class", "endRangeLabelReview")
                    .attr("x", function(d, i) { return 200 + i * 12; })
                    .attr("y", 50)
                    .style("font-size", "9px")
                    .text(function(d) { return d; });
                
                
                // Function to update the review plot based on selected date range
                function updateReviewPlot() {
                    
                    var startDate = new Date(
                        document.getElementById("yearSelectStart").value,
                        document.getElementById("monthSelectStart").value - 1,
                        document.getElementById("daySelectStart").value
                    );
                
                    var endDate = new Date(
                        document.getElementById("yearSelectEnd").value,
                        document.getElementById("monthSelectEnd").value - 1,
                        document.getElementById("daySelectEnd").value
                    );

                    console.log("start Date "+startDate);
                    console.log("end Date "+endDate);
                
                    var startRange = parseInt(document.getElementById("startRangeReview").value);
                    var endRange = parseInt(document.getElementById("endRangeReview").value);

                    console.log("start Range "+startRange);
                    console.log("end Range "+endRange);
                
                    // Filter reviews based on selected date range and sentiment score
                    var filteredReviews = clickedFeatureReviews.filter(function(d) {
                        return (new Date(d.time) >= startDate && new Date(d.time) <= endDate) && (d.sentiment_score >= startRange && d.sentiment_score <= endRange);
                    });

                    
                    console.log(filteredReviews);
                    // Update review plot based on filtered reviews
                    reviewPlotSvg.selectAll(".review-point")
                        .data(filteredReviews, function(d) { return d.review_id; })
                        .join(
                            enter => enter.append("circle")
                                .attr("class", "review-point")
                                .attr("cx", d => xScaleReview(new Date(d.time)))
                                .attr("cy", d => yScaleReview(d.sentiment_score))
                                .attr("r", 5)
                                .attr("fill", d => colorScale(d.sentiment_score)),
                            update => update,
                            exit => exit.remove()
                        )
                        .on("mouseover", (event, d) => {
                            console.log("Showing review tooltip");
                            console.log("Review Id:", d.review_id);
                            d3.select("#review-tooltip")
                                .style("left", (event.pageX + 10) + "px")
                                .style("top", (event.pageY - 20) + "px")
                                .select("#review-value")
                                .html(`Review ID: ${d.review_id}<br>User Score: ${d.score}<br>Sentiment Score: ${d.sentiment_score.toFixed(2)}`); // Customize this to show the information you want
                                // .text("Review ID: " + d.review_id); // Customize this to show the information you want
                            d3.select("#review-tooltip").classed("hidden", false);
                        })
                        .on("mouseout", (event, d) => {
                            d3.select("#review-tooltip").classed("hidden", true);
                        });
                    
                    
                }

                    
            });


        // Define Feature Plot legend
        var legendFeature = featurePlotSvg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (width - 560) + "," + 20 + ")");
        
        // Add title to the legend
        legendFeature.append("text")
            .attr("x", 0)
            .attr("y", -25)
            .text("Avg. Sentiment Score");
        
        // Add sliding select tool for startRange
        legendFeature.append("foreignObject")
            .attr("x", 0)
            .attr("y", -20)
            .attr("width", 200)
            .attr("height", 50)
            .append("xhtml:input")
            .attr("type", "range")
            .attr("min", -5)
            .attr("max", 5)
            .attr("value", -5)
            .attr("id", "startRangeFeature")
            .on("input", function() {
                updateFeaturePlot();
            });
        
        // Add number scale for feature startRange
        legendFeature.selectAll(".startRangeLabelFeature")
            .data([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5])
            .enter().append("text")
            .attr("class", "startRangeLabelFeature")
            .attr("x", function(d, i) { return i * 12; })
            .attr("y", 5)
            .style("font-size", "9px")
            .text(function(d) { return d; });
        
        // Add sliding select tool for review endRange
        legendFeature.append("foreignObject")
            .attr("x", 0)
            .attr("y", 3)
            .attr("width", 200)
            .attr("height", 50)
            .append("xhtml:input")
            .attr("type", "range")
            .attr("min", -5)
            .attr("max", 5)
            .attr("value", 5)
            .attr("id", "endRangeFeature")
            .on("input", function() {
                updateFeaturePlot();
            });
        
        // Add number scale for endRange
        legendFeature.selectAll(".endRangeLabelFeature")
            .data([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5])
            .enter().append("text")
            .attr("class", "endRangeLabelFeature")
            .attr("x", function(d, i) { return i * 12; })
            .attr("y", 27)
            .style("font-size", "9px")
            .text(function(d) { return d; });
        
        // Function to update the plot based on selected range
        function updateFeaturePlot() {
            var startRange = parseInt(document.getElementById("startRangeFeature").value);
            var endRange = parseInt(document.getElementById("endRangeFeature").value);
        
            featurePlotSvg.selectAll("circle")
                .style("display", function(d) {
                    return (d.avg_sentiment >= startRange && d.avg_sentiment <= endRange) ? "inline" : "none";
                });
        }

        




    });   
        
});





    
/*

// Set up the SVG element for feature plot
var featurePlotSvg = d3.select("#scatter-plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



// Set up the SVG element for review plot
var reviewPlotSvg = d3.select("#review-plot-container")
    .append("svg")
    .attr("id", "review-plot-svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Define zoom behavior
const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

// Apply zoom behavior to feature plot SVG
featurePlotSvg.call(zoom);

// Apply zoom behavior to review plot SVG
reviewPlotSvg.call(zoom);

// Zoom event handler
function zoomed(event) {
    const { transform } = event;

    // Update x and y scales for feature plot based on the zoom transform
    x.range([0, width].map(d => transform.applyX(d)));
    y.range([height, 0].map(d => transform.applyY(d)));

    // Update x and y axes for feature plot
    featurePlotSvg.select(".x.axis").call(xAxis);
    featurePlotSvg.select(".y.axis").call(yAxis);

    // Update data points for feature plot
    featurePlotSvg.selectAll("circle")
        .attr("cx", d => x(d.frequency))
        .attr("cy", d => y(d.avg_sentiment));

    // Update x and y scales for review plot based on the zoom transform
    xScaleReview.range([margin.left, width - margin.right].map(d => transform.rescaleX(xScaleReview)(d)));
    yScaleReview.range([height - margin.bottom, margin.top].map(d => transform.rescaleY(yScaleReview)(d)));

    // Update x and y axes for review plot
    reviewPlotSvg.select(".x-axis-review").call(xAxisReview);
    reviewPlotSvg.select(".y-axis-review").call(yAxisReview);

    // Update data points for review plot
    reviewPlotSvg.selectAll(".review-point")
        .attr("cx", d => xScaleReview(new Date(d.time)))
        .attr("cy", d => yScaleReview(d.sentiment_score));
}

// Double-click event handler for zooming
featurePlotSvg.on("dblclick.zoom", function(event) {
    const [x, y] = d3.pointer(event, featurePlotSvg.node());
    const scale = zoom.scaleBy(featurePlotSvg.transition().duration(750), 1.5);
    const translate = scale.translate([width / 2 - x * scale, height / 2 - y * scale]);
    featurePlotSvg.transition().duration(750).call(zoom.transform, translate);
});

reviewPlotSvg.on("dblclick.zoom", function(event) {
    const [x, y] = d3.pointer(event, reviewPlotSvg.node());
    const scale = zoom.scaleBy(reviewPlotSvg.transition().duration(750), 1.5);
    const translate = scale.translate([width / 2 - x * scale, height / 2 - y * scale]);
    reviewPlotSvg.transition().duration(750).call(zoom.transform, translate);
});

*/