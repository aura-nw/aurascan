import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-write-contract',
  templateUrl: './write-contract.component.html',
  styleUrls: ['./write-contract.component.scss'],
})
export class WriteContractComponent implements OnInit {
  isExpand = false;
  isConnectedWallet = false;
  jsonWriteContract = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'ExecuteMsg',
    oneOf: [
      {
        type: 'object',
        required: ['add_new'],
        properties: {
          add_new: {
            type: 'object',
            required: ['amount', 'id', 'name', 'price'],
            properties: {
              amount: {
                type: 'integer',
                format: 'int32',
              },
              id: {
                type: 'string',
              },
              name: {
                type: 'string',
              },
              price: {
                type: 'integer',
                format: 'int32',
              },
            },
          },
        },
        additionalProperties: false,
      },
      {
        type: 'object',
        required: ['sell'],
        properties: {
          sell: {
            type: 'object',
            required: ['amount', 'id'],
            properties: {
              amount: {
                type: 'integer',
                format: 'int32',
              },
              id: {
                type: 'string',
              },
            },
          },
        },
        additionalProperties: false,
      },
    ],
  };
  constructor() {}

  ngOnInit(): void {}

  expandMenu(closeAll = false): void {
    for (let i = 0; i < document.getElementsByClassName('content-contract').length; i++) {
      let element: HTMLElement = document.getElementsByClassName('content-contract')[i] as HTMLElement;
      let expand = element.getAttribute('aria-expanded');
      if (closeAll) {
        if (expand == 'true') {
          element.click();
        }
      } else {
        if (expand === this.isExpand.toString()) {
          element.click();
        }
      }
    }
    if (!closeAll) {
      this.isExpand = !this.isExpand;
    }
  }

  reloadData() {
    for (let i = 0; i < document.getElementsByClassName('form-check-input').length; i++) {
      (<HTMLInputElement>document.getElementsByClassName('form-check-input')[i]).value = '';
    }
    this.expandMenu(true);
  }
}
