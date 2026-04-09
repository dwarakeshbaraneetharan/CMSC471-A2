const marginW = { top: 16, right: 32, bottom: 52, left: 132 };
const barH = 26;

function renderWhiteHat(data) {
  const countries = data.countries;
  const innerW = 640;
  const innerH = countries.length * barH;
  const w = innerW + marginW.left + marginW.right;
  const h = innerH + marginW.top + marginW.bottom;

  const svg = d3
    .select("#white-viz")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("role", "img")
    .attr("aria-label", "Bar chart of top 15 countries by fossil CO2 emissions in 2022");

  const g = svg.append("g").attr("transform", `translate(${marginW.left},${marginW.top})`);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(countries, (d) => d.co2_million_tonnes) * 1.05])
    .range([0, innerW]);

  const y = d3
    .scaleBand()
    .domain(countries.map((d) => d.country))
    .range([0, innerH])
    .padding(0.15);

  g.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${innerH})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(8)
        .tickSize(-innerH)
        .tickFormat((d) => `${d / 1000 >= 1 ? (d / 1000).toFixed(1) + "k" : d}`)
    )
    .call((sel) => sel.select(".domain").remove());

  g.append("g").attr("class", "axis axis--x").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(x).ticks(8));

  g.append("g").attr("class", "axis axis--y").call(d3.axisLeft(y).tickSize(0)).selectAll("path").remove();

  g.append("text")
    .attr("class", "axis-title")
    .attr("x", innerW / 2)
    .attr("y", innerH + 42)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "#5c6370")
    .text("Million tonnes CO₂ (fossil, territorial)");

  const color = d3.scaleSequential(d3.interpolateBlues).domain([0, d3.max(countries, (d) => d.co2_million_tonnes)]);

  g.selectAll("rect")
    .data(countries)
    .join("rect")
    .attr("x", 0)
    .attr("y", (d) => y(d.country))
    .attr("width", (d) => x(d.co2_million_tonnes))
    .attr("height", y.bandwidth())
    .attr("fill", (d) => color(d.co2_million_tonnes))
    .attr("rx", 3);

  g.selectAll("text.val")
    .data(countries)
    .join("text")
    .attr("class", "val")
    .attr("x", (d) => x(d.co2_million_tonnes) + 6)
    .attr("y", (d) => y(d.country) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .style("font-size", "10px")
    .style("fill", "#444")
    .text((d) => d.co2_million_tonnes.toLocaleString());
}

function renderBlackHat(ts) {
  const china = ts.find((d) => d.country === "China");
  const us = ts.find((d) => d.country === "United States");
  if (!china || !us) return;

  const margin = { top: 28, right: 56, bottom: 40, left: 56 };
  const innerW = 560;
  const innerH = 300;
  const w = innerW + margin.left + margin.right;
  const h = innerH + margin.top + margin.bottom;

  const svg = d3
    .select("#black-viz")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const years = china.series.map((d) => d.year);
  const x = d3.scalePoint().domain(years).range([0, innerW]).padding(0.4);

  const chinaVals = china.series.map((d) => d.co2);
  const usVals = us.series.map((d) => d.co2);

  const yL = d3
    .scaleLinear()
    .domain([d3.min(chinaVals) * 0.97, d3.max(chinaVals) * 1.03])
    .range([innerH, 0]);

  const yR = d3
    .scaleLinear()
    .domain([d3.min(usVals) * 0.97, d3.max(usVals) * 1.03])
    .range([innerH, 0]);

  const lineL = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => yL(d.co2));

  const lineR = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => yR(d.co2));

  g.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(yL).tickSize(-innerW).tickFormat("").ticks(6))
    .call((s) => s.select(".domain").remove());

  g.append("g").attr("class", "axis axis--yL").call(d3.axisLeft(yL).ticks(6));

  g.append("g")
    .attr("class", "axis axis--yR")
    .attr("transform", `translate(${innerW},0)`)
    .call(d3.axisRight(yR).ticks(6));

  g.append("g").attr("class", "axis axis--x").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));

  g.append("text")
    .attr("class", "axis-title")
    .attr("x", -36)
    .attr("y", innerH / 2)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("fill", "#b45309")
    .text("China — Mt CO₂");

  g.append("text")
    .attr("class", "axis-title")
    .attr("x", innerW + 44)
    .attr("y", innerH / 2)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("fill", "#1d4ed8")
    .text("United States — Mt CO₂");

  g.append("path")
    .datum(china.series)
    .attr("fill", "none")
    .attr("stroke", "#ea580c")
    .attr("stroke-width", 2.5)
    .attr("d", lineL);

  g.append("path")
    .datum(us.series)
    .attr("fill", "none")
    .attr("stroke", "#2563eb")
    .attr("stroke-width", 2.5)
    .attr("d", lineR);

  const dotG = g.append("g");
  china.series.forEach((d) => {
    dotG.append("circle").attr("cx", x(d.year)).attr("cy", yL(d.co2)).attr("r", 4).attr("fill", "#ea580c");
  });
  us.series.forEach((d) => {
    dotG.append("circle").attr("cx", x(d.year)).attr("cy", yR(d.co2)).attr("r", 4).attr("fill", "#2563eb");
  });

  const leg = svg.append("g").attr("transform", `translate(${margin.left + 8},${12})`);
  leg.append("line").attr("x1", 0).attr("x2", 24).attr("y1", 0).attr("y2", 0).attr("stroke", "#ea580c").attr("stroke-width", 3);
  leg.append("text").attr("x", 30).attr("y", 4).style("font-size", "11px").text("China");
  leg.append("line").attr("x1", 90).attr("x2", 114).attr("y1", 0).attr("y2", 0).attr("stroke", "#2563eb").attr("stroke-width", 3);
  leg.append("text").attr("x", 120).attr("y", 4).style("font-size", "11px").text("United States");
}

d3.json("data/emissions.json")
  .then((data) => {
    renderWhiteHat(data);
    renderBlackHat(data.time_series_selected);
  })
  .catch((e) => {
    console.error(e);
    document.getElementById("white-viz").textContent = "Could not load data/emissions.json";
  });
