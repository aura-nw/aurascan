import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-qr",
  templateUrl: "./qr.component.html",
  styleUrls: ["./qr.component.scss"],
})
export class QrComponent implements OnInit {
  @Input() address: string = '';

  constructor() {}

  ngOnInit(): void {}
}
