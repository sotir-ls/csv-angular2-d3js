import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Component, OnInit } from '@angular/core';
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
		//Gets the http response
		let csvData = res['_body'] || '';
		//Escapes t
		let allTextLines = csvData.split(/\r\n|\n/);
		this.headers = allTextLines[0].split(',');
		let lines = [];
		
		for ( let i = 0; i < allTextLines.length; i++) {
			// split content based on comma
			let data = allTextLines[i].split(',');
			if (data.length == this.headers.length) {
				let tarr = [];
				for ( let j = 0; j < this.headers.length; j++) {
					tarr.push(data[j]);
				}
				lines.push(tarr);
			}
		}
		this.csvData = lines;
		console.log(this.csvData);
  }

}
