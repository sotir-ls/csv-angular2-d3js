import { HammerInstance } from '@angular/platform-browser/src/dom/events/hammer_gestures';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import 'rxjs/Rx';

declare var d3: any;

@Component({
	selector: 'app-csv',
	templateUrl: 'csv.component.html',
	styleUrls: ['csv.component.scss']
})


export class CsvComponent implements OnInit {
	public filePath: string;
	public fileName: string;
	public csvData: any[] = [];
	public headers: string[] = [];
	public allTextLines: string[] = [];
	public isValid: boolean = true;

	@ViewChild('fileInput') fileInput: ElementRef;

    constructor(public http:Http) { }

    ngOnInit() {
    }

	fileChange(file){
		this.fileName = file.srcElement.files[0].name;
		this.filePath = file.target.value;
	}

	readCSV(){
		this.http.get(this.fileName)
			.subscribe(res => {
				this.extractData(res);
			}, err =>{
				console.log(err);
			})
	}

	extractData(res: Response) {
		console.log(this.fileInput.nativeElement.value);
		if(this.fileInput.nativeElement.value != ""){
			//Verify the input
			this.isValid = true;
			//Gets the http response
			let csvData = res['_body'] || '';
			this.allTextLines = csvData.split(/\r\n|\n/);
			this.headers = this.allTextLines[0].split(',');
			let lines = [];
			//loopes through the array of arrays from all records
			for ( let i = 0; i < this.allTextLines.length; i++) {
				// split content based on comma
				let data = this.allTextLines[i].split(',');
				//Pushes all records into a single array
				if (data.length == this.headers.length) {
					let tableArr = [];
					for ( let j = 0; j < this.headers.length; j++) {
						tableArr.push(data[j]);
					}
					lines.push(tableArr);
				}
			}
			this.csvData = lines;
			this.mergeCSVData(this.csvData);
		}else{
			this.isValid = false;
		}
  	}

	mergeCSVData(data){
		data = [].concat.apply([], this.csvData);
		//Creates an array with numbers to be displayed by the graphs
		//The task is to have only numerical values
		let convertedArray = data.map(item => {
			return parseInt(item, 10);
		})

		//Bar Graph
		this.d3BarGraph(convertedArray);

		//Pie Chart Graph
		this.d3PieChartGraph(convertedArray);
	}

	d3BarGraph(convertedData){
		//Generics for the Graph Chart
		let width = 500;
		let height = 500;
		let barWidth = 30;
		let duration = 700;
		let delay = 30;

		//Scaling the graph
		let yScale = d3.scale.linear()
			.domain(
				[0, d3.max(convertedData)]
			).range(
				[0, height]
			)

		let xScale = d3.scale.ordinal()
			.domain(
				d3.range(0, convertedData.length))
			.rangeBands(
				[0, width]
			)

		//Custom colors
		let colors = d3.scale.linear()
			.domain([0, convertedData.length])
			.range(['#B8D9C0', '#3E927A'])

		//Tooltip for mouseover
		let tooltip = d3.select('body').append('div')
			.style('position', 'absolute')
			.style('background', '#f4f4f4')
			.style('padding', '5px 15px')
			.style('border', '1px #333 solid')
			.style('border-radius', '5px')
			.style('opacity', '0')

		//Building the svg graph
		let dataChart = d3.select('#barChartGraph').append(
			'svg'
		).attr('width', width)
		 .attr('height', height)
		 .style('background', '#f4f4f4')
		 .selectAll('rect')
		 .data(convertedData)
		 .enter().append('rect')
		 		 .style('fill', (data, index) => {
					  return colors(index);
				  })
				 .attr('width', xScale.rangeBand())
				 .attr('height', 0)
				 .attr('x', (data, index) => {
					 return xScale(index);
				 })
				 .attr('y', height)
		.on('mouseover', (data, index) => {
			tooltip.transition()
				.style('opacity', 1)

			tooltip.html(data)
				.style('left', (d3.event.pageX) + 'px')
				.style('top', (d3.event.pageY + 'px'))
		})
		.on('mouseout', data => {
			tooltip.transition()
				.style('opacity', 0)
		})

		//Animation
		dataChart.transition()
			.attr('height', data => {
				return yScale(data)
			})
			.attr('y', data => {
				return height - yScale(data)
			})
			.duration(duration)
			.delay((data, index) => {
				return index * delay;
			})
			.ease('elastic')
	}

	d3PieChartGraph(convertedData){
		//Generic for Pie Chart Graph
		let data = convertedData;
		let width = 500;
		let height = 500;
		let radius = 200;

		let color = d3.scale.ordinal()
			.domain([0, convertedData.length])
			.range(['#B8D9C0', '#3E927A'])

		let canvas = d3.select('#pieChartGraph').append('svg')
			.attr('width', width)
			.attr('height', height)
		 	.style('background', '#f4f4f4');

		let group = canvas.append('g')
			.attr('transform', 'translate(' + width/2 +  ',' + height/2 +')');

		let arc = d3.svg.arc()
			.innerRadius(100)
			.outerRadius(radius);

		let pie = d3.layout.pie()
			.value( data => {
				return data;
		});

		let arcs = group.selectAll('.arc')
			.data(pie(data))
			.enter()
			.append('g')
			.attr('class', 'arc')
			.attr('align','center')

		arcs.append('path')
			.attr('d', arc)
			.attr('fill', (data, index) => {
				return color(index);
		});

		arcs.append('text')
			.attr('transform', data => {
			return 'translate(' + arc.centroid(data) + ')';
		})
			.attr('text-anchor', 'middle')
			.attr('font-size', '1em')
			.text(data => {
				return data.data;
		});
	}
}
