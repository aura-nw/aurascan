import { Component, OnInit } from '@angular/core';
import { TableTemplate } from 'src/app/core/models/common.model';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';

@Component({
  selector: 'app-evm-transactions',
  templateUrl: './evm-transactions.component.html',
  styleUrls: ['./evm-transactions.component.scss'],
})
export class EvmTransactionsComponent {
  templates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'EVM Txn hash', headerWidth: 214 },
    { matColumnDef: 'method', headerCellDef: 'Method', headerWidth: 216 },
    { matColumnDef: 'height', headerCellDef: 'Height', headerWidth: 110 },
    { matColumnDef: 'timestamp', headerCellDef: 'Time', headerWidth: 136 },
    { matColumnDef: 'from', headerCellDef: 'From', headerWidth: 214 },
    { matColumnDef: 'to', headerCellDef: 'To', headerWidth: 214 },
    { matColumnDef: 'amount', headerCellDef: 'Amount', headerWidth: 176 },
    { matColumnDef: 'aura_txn', headerCellDef: 'AURA Txn', headerWidth: 102 },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  dataTx: any[];

  pageSize = 20;
  loading = true;
  errTxt = null;

  constructor() {}

  ngOnInit(): void {
    this.getListTx();
  }

  getListTx(): void {
    // const payload = {
    //   limit: this.pageSize,
    // };
    this.dataSource.data = [
      {
        tx_hash: '0xe9293a50b62cbfc50b39de4884b1a8506fad060180b0c619fc685d11104d34c8',
        method: 'swapExactETHForTokens',
        height: '4569415',
        timestamp: '2024-02-28T07:00:00.000Z',
        from: '0xf99ee98167b41e226527b83982acd618678a510c',
        to: '0xf99ee98167b41e226527b83982acd618678a510c',
        amount: '0.593883',
        aura_txn: '6CFC0EC66419AD0F95EA93652AD5A29ECE919C12E3DD9B5C45108378E2018DE5',
      },
      {
        tx_hash: '0xe9293a50b62cbfc50b39de4884b1a8506fad060180b0c619fc685d11104d34c8',
        method: 'swapExactETHForTokens',
        height: '4569415',
        timestamp: '2024-02-28T07:00:00.000Z',
        from: '0xf99ee98167b41e226527b83982acd618678a510c',
        to: '0xf99ee98167b41e226527b83982acd618678a510c',
        amount: '0.593883',
        aura_txn: '6CFC0EC66419AD0F95EA93652AD5A29ECE919C12E3DD9B5C45108378E2018DE5',
      },
      {
        tx_hash: '0xe9293a50b62cbfc50b39de4884b1a8506fad060180b0c619fc685d11104d34c8',
        method: 'swapExactETHForTokens',
        height: '4569415',
        timestamp: '2024-02-28T07:00:00.000Z',
        from: '0xf99ee98167b41e226527b83982acd618678a510c',
        to: '0xf99ee98167b41e226527b83982acd618678a510c',
        amount: '0.593883',
        aura_txn: '6CFC0EC66419AD0F95EA93652AD5A29ECE919C12E3DD9B5C45108378E2018DE5',
      },
      {
        tx_hash: '0xe9293a50b62cbfc50b39de4884b1a8506fad060180b0c619fc685d11104d34c8',
        method: 'swapExactETHForTokens',
        height: '4569415',
        timestamp: '2024-02-28T07:00:00.000Z',
        from: '0xf99ee98167b41e226527b83982acd618678a510c',
        to: '0xf99ee98167b41e226527b83982acd618678a510c',
        amount: '0.593883',
        aura_txn: '6CFC0EC66419AD0F95EA93652AD5A29ECE919C12E3DD9B5C45108378E2018DE5',
      },
      {
        tx_hash: '0xe9293a50b62cbfc50b39de4884b1a8506fad060180b0c619fc685d11104d34c8',
        method: 'swapExactETHForTokens',
        height: '4569415',
        timestamp: '2024-02-28T07:00:00.000Z',
        from: '0xf99ee98167b41e226527b83982acd618678a510c',
        to: '0xf99ee98167b41e226527b83982acd618678a510c',
        amount: '0.593883',
        aura_txn: '6CFC0EC66419AD0F95EA93652AD5A29ECE919C12E3DD9B5C45108378E2018DE5',
      },
      {
        tx_hash: '0xe9293a50b62cbfc50b39de4884b1a8506fad060180b0c619fc685d11104d34c8',
        method: 'swapExactETHForTokens',
        height: '4569415',
        timestamp: '2024-02-28T07:00:00.000Z',
        from: '0xf99ee98167b41e226527b83982acd618678a510c',
        to: '0xf99ee98167b41e226527b83982acd618678a510c',
        amount: '0.593883',
        aura_txn: '6CFC0EC66419AD0F95EA93652AD5A29ECE919C12E3DD9B5C45108378E2018DE5',
      },
      {
        tx_hash: '0xe9293a50b62cbfc50b39de4884b1a8506fad060180b0c619fc685d11104d34c8',
        method: 'swapExactETHForTokens',
        height: '4569415',
        timestamp: '2024-02-28T07:00:00.000Z',
        from: '0xf99ee98167b41e226527b83982acd618678a510c',
        to: '0xf99ee98167b41e226527b83982acd618678a510c',
        amount: '0.593883',
        aura_txn: '6CFC0EC66419AD0F95EA93652AD5A29ECE919C12E3DD9B5C45108378E2018DE5',
      },
      {
        tx_hash: '0xe9293a50b62cbfc50b39de4884b1a8506fad060180b0c619fc685d11104d34c8',
        method: 'swapExactETHForTokens',
        height: '4569415',
        timestamp: '2024-02-28T07:00:00.000Z',
        from: '0xf99ee98167b41e226527b83982acd618678a510c',
        to: '0xf99ee98167b41e226527b83982acd618678a510c',
        amount: '0.593883',
        aura_txn: '6CFC0EC66419AD0F95EA93652AD5A29ECE919C12E3DD9B5C45108378E2018DE5',
      },
      {
        tx_hash: '0xe9293a50b62cbfc50b39de4884b1a8506fad060180b0c619fc685d11104d34c8',
        method: 'swapExactETHForTokens',
        height: '4569415',
        timestamp: '2024-02-28T07:00:00.000Z',
        from: '0xf99ee98167b41e226527b83982acd618678a510c',
        to: '0xf99ee98167b41e226527b83982acd618678a510c',
        amount: '0.593883',
        aura_txn: '6CFC0EC66419AD0F95EA93652AD5A29ECE919C12E3DD9B5C45108378E2018DE5',
      },
      {
        tx_hash: '0xe9293a50b62cbfc50b39de4884b1a8506fad060180b0c619fc685d11104d34c8',
        method: 'swapExactETHForTokens',
        height: '4569415',
        timestamp: '2024-02-28T07:00:00.000Z',
        from: '0xf99ee98167b41e226527b83982acd618678a510c',
        to: '0xf99ee98167b41e226527b83982acd618678a510c',
        amount: '0.593883',
        aura_txn: '6CFC0EC66419AD0F95EA93652AD5A29ECE919C12E3DD9B5C45108378E2018DE5',
      },
      {
        tx_hash: '0xe9293a50b62cbfc50b39de4884b1a8506fad060180b0c619fc685d11104d34c8',
        method: 'swapExactETHForTokens',
        height: '4569415',
        timestamp: '2024-02-28T07:00:00.000Z',
        from: '0xf99ee98167b41e226527b83982acd618678a510c',
        to: '0xf99ee98167b41e226527b83982acd618678a510c',
        amount: '0.593883',
        aura_txn: '6CFC0EC66419AD0F95EA93652AD5A29ECE919C12E3DD9B5C45108378E2018DE5',
      },
      {
        tx_hash: '0xe9293a50b62cbfc50b39de4884b1a8506fad060180b0c619fc685d11104d34c8',
        method: 'swapExactETHForTokens',
        height: '4569415',
        timestamp: '2024-02-28T07:00:00.000Z',
        from: '0xf99ee98167b41e226527b83982acd618678a510c',
        to: '0xf99ee98167b41e226527b83982acd618678a510c',
        amount: '0.593883',
        aura_txn: '6CFC0EC66419AD0F95EA93652AD5A29ECE919C12E3DD9B5C45108378E2018DE5',
      },
      {
        tx_hash: '0xe9293a50b62cbfc50b39de4884b1a8506fad060180b0c619fc685d11104d34c8',
        method: 'swapExactETHForTokens',
        height: '4569415',
        timestamp: '2024-02-28T07:00:00.000Z',
        from: '0xf99ee98167b41e226527b83982acd618678a510c',
        to: '0xf99ee98167b41e226527b83982acd618678a510c',
        amount: '0.593883',
        aura_txn: '6CFC0EC66419AD0F95EA93652AD5A29ECE919C12E3DD9B5C45108378E2018DE5',
      },
      {
        tx_hash: '0xe9293a50b62cbfc50b39de4884b1a8506fad060180b0c619fc685d11104d34c8',
        method: 'swapExactETHForTokens',
        height: '4569415',
        timestamp: '2024-02-28T07:00:00.000Z',
        from: '0xf99ee98167b41e226527b83982acd618678a510c',
        to: '0xf99ee98167b41e226527b83982acd618678a510c',
        amount: '0.593883',
        aura_txn: '6CFC0EC66419AD0F95EA93652AD5A29ECE919C12E3DD9B5C45108378E2018DE5',
      },
    ];
    this.loading = false;
  }
}
