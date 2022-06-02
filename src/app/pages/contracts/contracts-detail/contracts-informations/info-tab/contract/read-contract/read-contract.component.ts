import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-read-contract',
  templateUrl: './read-contract.component.html',
  styleUrls: ['./read-contract.component.scss'],
})
export class ReadContractComponent implements OnInit {
  isExpand = false;
  jsonReadContract = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "QueryMsg",
    "oneOf": [
      {
        "type": "object",
        "required": [
          "implementation"
        ],
        "properties": {
          "implementation": {
            "type": "object",
            "required": [
              "id"
            ],
            "properties": {
              "id": {
                "type": "string"
              }
            }
          }
        },
        "additionalProperties": false
      },
      {
        "type": "object",
        "required": [
          "admin"
        ],
        "properties": {
          "admin": {
            "type": "object",
            "required": [
              "id"
            ],
            "properties": {
              "id": {
                "type": "string"
              }
            }
          }
        },
        "additionalProperties": false
      }
    ]
  };

  constructor() {}

  ngOnInit(): void {}

  expandMenu(): void {
    for(let i = 0; i < document.getElementsByClassName('content-contract').length; i++) {
      let element: HTMLElement = document.getElementsByClassName('content-contract')[i] as HTMLElement;
      let expand = element.getAttribute('aria-expanded');
      if (expand === this.isExpand.toString()) {
        element.click();
      }
    }
    this.isExpand = !this.isExpand;
  }
}
