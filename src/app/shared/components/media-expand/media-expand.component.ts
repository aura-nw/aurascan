import { Component, Inject } from '@angular/core';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MEDIA_TYPE } from 'src/app/core/constants/common.constant';

@Component({
  selector: 'app-media-expand',
  templateUrl: './media-expand.component.html',
  styleUrls: ['./media-expand.component.scss'],
})
export class MediaExpandComponent {
  MEDIA_TYPE = MEDIA_TYPE;

  constructor(
    public dialogRef: MatDialogRef<MediaExpandComponent>,
    @Inject(MAT_DIALOG_DATA) public modalData: { mediaType: string; mediaSrc: string; mediaPoster?: string },
  ) {}
}
